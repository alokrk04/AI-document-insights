"""AI Insights generation service."""
import json
import os
import httpx
from config import OLLAMA_BASE_URL, CHAT_MODEL
from services.document_service import get_document
from rag.retriever import hybrid_retrieve

INSIGHTS_MODEL = os.getenv("INSIGHTS_MODEL", "llama3.2")


async def generate_insights(document_id: str) -> dict:
    """Generate executive insights for a document."""
    doc = get_document(document_id)
    if not doc:
        return {"error": "Document not found"}

    full_text = doc.get("full_text", "")
    if not full_text:
        return {"error": "No text content available for this document"}

    # Truncate to keep generation fast
    text_for_analysis = full_text[:6000]
    if len(full_text) > 6000:
        text_for_analysis += "\n\n[... document truncated ...]"

    prompt = f"""Document:
{text_for_analysis}

Return JSON with:
- "executive_summary": 2-3 sentence summary
- "key_findings": array of 3-7 key points
- "action_items": array of 2-5 action items
- "risks": array of 2-4 risks
- "highlighted_sections": array of {{"quote", "explanation"}}

Return ONLY valid JSON."""

    try:
        async with httpx.AsyncClient(timeout=300.0) as client:
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/chat",
                json={
                    "model": INSIGHTS_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "stream": False,
                    "format": "json",
                },
            )
            if response.status_code == 200:
                content = response.json().get("message", {}).get("content", "{}")
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
