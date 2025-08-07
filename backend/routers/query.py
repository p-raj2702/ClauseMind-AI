from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse
from utils.query_parser import parse_query
from utils.pdf_loader import extract_clauses_from_pdf
import re
import os
import requests
from sentence_transformers import SentenceTransformer, util

HF_API_KEY = os.getenv("HUGGINGFACE_API_KEY")
router = APIRouter(prefix="/api", tags=["Query"])

model = SentenceTransformer("all-MiniLM-L6-v2")

# ✅ Hugging Face summarization
def summarize_clause(clause: str) -> str:
    try:
        headers = {
            "Authorization": f"Bearer {HF_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {"inputs": clause}
        response = requests.post(
            "https://api-inference.huggingface.co/models/sshleifer/distilbart-cnn-12-6",
            headers=headers,
            json=payload
        )
        result = response.json()
        if isinstance(result, list) and "summary_text" in result[0]:
            return result[0]["summary_text"].strip()
        return "(Summary not returned by model)"
    except Exception as e:
        print("⚠️ Summarization Error:", e)
        return "(Summary unavailable due to error)"

# ✅ Regex payout extractor
def extract_payout_amount(clause: str) -> str | None:
    clause_lower = clause.lower()
    context_phrases = ["covered", "reimbursed", "maximum limit", "up to", "payable", "eligible for", "benefit of", "sum insured"]

    if not any(phrase in clause_lower for phrase in context_phrases):
        return None

    matches = re.findall(r"(?:₹|Rs\.?|INR)\s?[1-9]\d{1,2}(?:,\d{3})*(?:\.\d{1,2})?", clause)
    if matches:
        return matches[0].replace("₹", "").replace("Rs.", "").replace("INR", "").replace(",", "").strip()
    return None

# ✅ Waiting period extractor
def extract_waiting_period(clause: str) -> int | None:
    match = re.search(r"waiting period of (\d+)\s?(days?|months?)", clause.lower())
    if match:
        value = int(match.group(1))
        unit = match.group(2)
        return value * 30 if "month" in unit else value
    return None

# ✅ Load fallback PDFs and return best clause match
def get_fallback_recommendation(query: str):
    fallback_dir = "fallback_policies"
    if not os.path.exists(fallback_dir):
        return None

    query_embedding = model.encode(query, convert_to_tensor=True)
    best_match = None
    best_score = -1.0
    best_plan_name = None

    for file in os.listdir(fallback_dir):
        if file.endswith(".pdf"):
            path = os.path.join(fallback_dir, file)
            with open(path, "rb") as f:
                clauses = extract_clauses_from_pdf(f.read())
                for clause in clauses:
                    clause_embedding = model.encode(clause, convert_to_tensor=True)
                    score = float(util.pytorch_cos_sim(query_embedding, clause_embedding)[0][0])
                    if score > best_score:
                        best_score = score
                        best_match = clause
                        best_plan_name = file

    if best_match:
        return {
            "pdf_name": best_plan_name,
            "best_clause": best_match,
            "confidence": round(best_score * 100, 1)
        }
    return None

@router.post("/query")
async def handle_query(query: str = Form(...), pdf: UploadFile = File(...)):
    try:
        print("🔍 Raw Query:", query)

        structured_query = parse_query(query)
        keywords = structured_query.get("keywords", [])
        user_policy_days = structured_query.get("policy_days")
        user_policy_days = int(user_policy_days) if user_policy_days is not None else 0

        print("🧠 Extracted Keywords:", keywords)
        print("📅 User Policy Days:", user_policy_days)

        pdf_bytes = await pdf.read()
        extracted_clauses = extract_clauses_from_pdf(pdf_bytes)

        if not extracted_clauses:
            return JSONResponse(content={
                "decision": {
                    "eligible": False,
                    "reason": "PDF could not be read. Make sure it contains text, not just scanned images."
                },
                "clauses": []
            })

        query_embedding = model.encode(query, convert_to_tensor=True)
        matched_clauses = []
        payout_amounts = []
        earliest_eligible_days = None

        for clause in extracted_clauses:
            clause_lower = clause.lower()
            matched_keywords = [kw for kw in keywords if kw in clause_lower]

            if matched_keywords:
                highlighted_clause = clause
                for kw in matched_keywords:
                    highlighted_clause = re.sub(
                        rf"(?i)\b({re.escape(kw)})\b",
                        r"<mark>\1</mark>",
                        highlighted_clause
                    )

                summary = summarize_clause(clause) if len(clause.split()) >= 30 else "(Clause too short to summarize)"
                clause_embedding = model.encode(clause, convert_to_tensor=True)
                relevance_score = float(util.pytorch_cos_sim(query_embedding, clause_embedding)[0][0])
                confidence = round(relevance_score * 100, 1)

                sentences = re.split(r'[.!?]', clause)
                sentence_lengths = [len(s.split()) for s in sentences if s.strip()]
                clarity_score = round(100 - min(50, sum(sentence_lengths)/len(sentence_lengths)) * 2, 1) if sentence_lengths else 50.0

                explanation_score = round((confidence + clarity_score) / 2, 1)

                payout = extract_payout_amount(clause)
                if payout:
                    payout_amounts.append(payout)

                clause_wait_days = extract_waiting_period(clause)
                if clause_wait_days is not None and user_policy_days < clause_wait_days:
                    wait_left = clause_wait_days - user_policy_days
                    if earliest_eligible_days is None or wait_left < earliest_eligible_days:
                        earliest_eligible_days = wait_left

                matched_clauses.append({
                    "text": highlighted_clause,
                    "justification": f"Contains keyword(s): {', '.join(matched_keywords)}",
                    "source": pdf.filename,
                    "summary": summary,
                    "confidence": confidence,
                    "relevance_score": round(confidence, 1),
                    "clarity_score": clarity_score,
                    "explanation_score": explanation_score
                })

        response_payload = {
            "clauses": matched_clauses
        }

        if matched_clauses:
            if earliest_eligible_days and earliest_eligible_days > 0:
                response_payload["decision"] = {
                    "eligible": False,
                    "reason": f"Waiting period not completed. Eligible after {earliest_eligible_days} day(s).",
                    "next_eligible_in_days": earliest_eligible_days,
                    "amount": payout_amounts[0] if payout_amounts else None
                }
            else:
                response_payload["decision"] = {
                    "eligible": True,
                    "reason": f"Matched {len(matched_clauses)} relevant clause(s).",
                    "amount": payout_amounts[0] if payout_amounts else None
                }
        else:
            response_payload["decision"] = {
                "eligible": False,
                "reason": "No relevant clauses found matching the query.",
                "amount": None
            }

            # ✅ Inject top-level alternate plan
            fallback = get_fallback_recommendation(query)
            if fallback:
                response_payload["alternate_plan"] = {
                    "name": fallback["pdf_name"],
                    "clause": fallback["best_clause"],
                    "confidence": fallback["confidence"]
                }

        return JSONResponse(content=response_payload)

    except Exception as e:
        print("❌ Error:", str(e))
        return JSONResponse(status_code=500, content={"error": str(e)})