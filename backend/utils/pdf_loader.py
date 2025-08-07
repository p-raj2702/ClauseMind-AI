import fitz  # PyMuPDF
from typing import List

def extract_clauses_from_pdf(pdf_bytes: bytes) -> List[str]:
    """
    Extracts clauses from a PDF file using PyMuPDF (fitz).
    Splits text into clauses based on newlines or bullet points.
    """
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    full_text = ""

    for page in doc:
        full_text += page.get_text()

    doc.close()

    # Split on bullet points or line breaks
    potential_clauses = full_text.split("\n")
    cleaned_clauses = [
        clause.strip().replace("•", "").replace("–", "-")
        for clause in potential_clauses
        if len(clause.strip()) > 50  # Lowered threshold to catch more
    ]

    return cleaned_clauses