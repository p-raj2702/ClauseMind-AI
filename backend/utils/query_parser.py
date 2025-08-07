import re
from datetime import datetime

# You can expand this list as needed
MEDICAL_KEYWORDS = [
    "surgery", "procedure", "treatment", "hospitalization",
    "cataract", "knee", "heart", "cancer", "tumor", "fracture",
    "bypass", "diabetes", "dialysis", "appendix", "hernia"
]

def parse_query(query: str) -> dict:
    query_lower = query.lower()

    age_match = re.search(r"(\d{2})[- ]?year[- ]?old|\b(\d{2})[mM]\b", query_lower)
    gender_match = re.search(r"\b(male|female)\b", query_lower)
    duration_match = re.search(r"(\d+)[ -]?(month|year)[- ]?(old|policy)?", query_lower)
    location_match = re.search(r"in ([a-zA-Z]+)|\b([a-zA-Z]+)\b policy", query_lower)

    # Extract medical keywords
    keywords = []
    for word in MEDICAL_KEYWORDS:
        if word in query_lower:
            keywords.append(word)

    # Calculate policy age in days
    policy_days = None
    if duration_match:
        num = int(duration_match.group(1))
        unit = duration_match.group(2)
        if unit.startswith("year"):
            policy_days = num * 365
        elif unit.startswith("month"):
            policy_days = num * 30

    return {
        "age": int(age_match.group(1) or age_match.group(2)) if age_match else None,
        "gender": gender_match.group(1) if gender_match else None,
        "policy_duration": f"{duration_match.group(1)} {duration_match.group(2)}" if duration_match else None,
        "location": location_match.group(1) or location_match.group(2) if location_match else None,
        "keywords": keywords,
        "policy_days": policy_days
    }