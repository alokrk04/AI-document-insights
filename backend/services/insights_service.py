"""AI Insights generation service."""
import json
import httpx
from config import OLLAMA_BASE_URL, CHAT_MODEL
from services.document_service import get_document
from rag.retriever import hybrid_retrieve


async def generate_insights(document_id: str) -> dict:
    """Generate executive insights for a document."""
    doc = get_document(document_id)
    if not doc:
        return {"error": "Document not found"}

    full_text = doc.get("full_text", "")
    if not full_text:
        return {"error": "No text content available for this document"}

    # Truncate if too long (keep first ~8000 chars for summary generation)
    text_for_analysis = full_text[:8000]
    if len(full_text) > 8000:
        text_for_analysis += "\n\n[... document truncated for analysis ...]"

    prompt = f"""Analyze the following document and provide structured insights in valid JSON format.

Document content:
{text_for_analysis}

Return a JSON object with exactly these keys:
1. "executive_summary": A comprehensive 3-5 sentence executive summary covering purpose, context, and main conclusions.
2. "key_findings": Array of 5-10 important facts, critical clauses, KPIs, or deliverables as strings.
3. "action_items": Array of 3-7 deadlines, required actions, or next steps as strings.
4. "risks": Array of 3-5 risks, liabilities, or compliance issues as strings.
5. "highlighted_sections": Array of 3-5 objects, each with "quote" (exact important quote from the text), "explanation" (why it's important), and "source" (location reference).

IMPORTANT: Return ONLY valid JSON. No markdown, no code fences, no extra text."""

    try:
        async with httpx.AsyncClient(timeout=180.0) as client:
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/chat",
                json={
                    "model": CHAT_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "stream": False,
                    "format": "json",
                },
            )
            if response.status_code == 200:
                content = response.json().get("message", {}).get("content", "{}")
                # Parse the JSON response
                insights = json.loads(content)

                return {
                    "document_id": document_id,
                    "executive_summary": insights.get("executive_summary", "Summary not available."),
                    "key_findings": insights.get("key_findings", []),
                    "action_items": insights.get("action_items", []),
                    "risks": insights.get("risks", []),
                    "highlighted_sections": insights.get("highlighted_sections", []),
                }
            else:
                return {"error": f"Failed to generate insights: status {response.status_code}"}
    except httpx.ConnectError:
        return {"error": "Ollama is not available. Please ensure Ollama is running."}
    except json.JSONDecodeError:
        return {"error": "Failed to parse AI insights response."}
    except Exception as e:
        return {"error": f"Error generating insights: {str(e)}"}
