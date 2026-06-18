from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import io
import re
import json
import uuid
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
from datetime import datetime, timezone

from resume_parser import parse_resume
from ats_scorer import calculate_ats_score, extract_keywords
from ai_optimizer import optimize_resume, optimize_bullet_point, generate_skill_gap_analysis
from pdf_generator import generate_pdf
from docx_generator import generate_docx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix=\"/api\")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# --- Pydantic Models ---
class AnalyzeRequest(BaseModel):
    resume_text: str
    job_description: str

class OptimizeRequest(BaseModel):
    resume_text: str
    job_description: str

class BulletOptimizeRequest(BaseModel):
    bullet_point: str
    job_description: Optional[str] = \"\"

class DownloadRequest(BaseModel):
    optimized_content: dict
    format: str = \"pdf\"

class AnalysisResult(BaseModel):
    ats_score: int
    keyword_matches: List[str]
    missing_keywords: List[str]
    formatting_score: int
    relevance_score: int
    skills_found: List[str]
    skills_missing: List[str]
    recommendations: List[str]

class OptimizationResult(BaseModel):
    optimized_resume: dict
    suggestions: List[str]
    rewritten_bullets: List[dict]

class BulletResult(BaseModel):
    original: str
    enhanced_versions: List[str]


# --- Routes ---
@api_router.get(\"/\")
async def root():
    return {\"message\": \"ATS Resume Optimizer API\"}

@api_router.post(\"/upload-resume\")
async def upload_resume(file: UploadFile = File(...)):
    \"\"\"Upload and parse a resume file (PDF or DOCX)\"\"\"
    if not file.filename:
        return {\"error\": \"No file provided\"}
    
    ext = file.filename.lower().split('.')[-1]
    if ext not in ['pdf', 'docx']:
        return {\"error\": \"Unsupported file format. Please upload PDF or DOCX.\"}
    
    content = await file.read()
    
    try:
        resume_text = parse_resume(content, ext)
        if not resume_text or len(resume_text.strip()) < 10:
            return {\"error\": \"Could not extract text from the file. Please ensure the file contains readable text.\"}
        return {\"resume_text\": resume_text, \"filename\": file.filename}
    except Exception as e:
        logger.error(f\"Error parsing resume: {e}\")
        return {\"error\": f\"Failed to parse resume: {str(e)}\"}


@api_router.post(\"/analyze\")
async def analyze_resume(req: AnalyzeRequest):
    \"\"\"Analyze resume against job description and return ATS score\"\"\"
    try:
        result = calculate_ats_score(req.resume_text, req.job_description)
        return result
    except Exception as e:
        logger.error(f\"Error analyzing resume: {e}\")
        return {\"error\": f\"Analysis failed: {str(e)}\"}


@api_router.post(\"/optimize\")
async def optimize(req: OptimizeRequest):
    \"\"\"Use AI to optimize the resume for ATS\"\"\"
    try:
        result = await optimize_resume(req.resume_text, req.job_description)
        return result
    except Exception as e:
        logger.error(f\"Error optimizing resume: {e}\")
        return {\"error\": f\"Optimization failed: {str(e)}\"}


@api_router.post(\"/optimize-bullet\")
async def optimize_bullet(req: BulletOptimizeRequest):
    \"\"\"Optimize a single bullet point into 3 enhanced versions\"\"\"
    try:
        result = await optimize_bullet_point(req.bullet_point, req.job_description)
        return result
    except Exception as e:
        logger.error(f\"Error optimizing bullet: {e}\")
        return {\"error\": f\"Bullet optimization failed: {str(e)}\"}


@api_router.post(\"/download/pdf\")
async def download_pdf(req: DownloadRequest):
    \"\"\"Generate and download optimized resume as PDF\"\"\"
    try:
        pdf_buffer = generate_pdf(req.optimized_content)
        return StreamingResponse(
            pdf_buffer,
            media_type=\"application/pdf\",
            headers={\"Content-Disposition\": \"attachment; filename=optimized_resume.pdf\"}
        )
    except Exception as e:
        logger.error(f\"Error generating PDF: {e}\")
        return {\"error\": f\"PDF generation failed: {str(e)}\"}


@api_router.post(\"/download/docx\")
async def download_docx(req: DownloadRequest):
    \"\"\"Generate and download optimized resume as DOCX\"\"\"
    try:
        docx_buffer = generate_docx(req.optimized_content)
        return StreamingResponse(
            docx_buffer,
            media_type=\"application/vnd.openxmlformats-officedocument.wordprocessingml.document\",
            headers={\"Content-Disposition\": \"attachment; filename=optimized_resume.docx\"}
        )
    except Exception as e:
        logger.error(f\"Error generating DOCX: {e}\")
        return {\"error\": f\"DOCX generation failed: {str(e)}\"}


@api_router.post(\"/skill-gap\")
async def skill_gap(req: AnalyzeRequest):
    \"\"\"Perform AI-powered skill gap analysis\"\"\"
    try:
        result = await generate_skill_gap_analysis(req.resume_text, req.job_description)
        return result
    except Exception as e:
        logger.error(f\"Error in skill gap analysis: {e}\")
        return {\"error\": f\"Skill gap analysis failed: {str(e)}\"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=[\"*\"],
    allow_headers=[\"*\"],
)

@app.on_event(\"shutdown\")
async def shutdown_db_client():
    client.close()
"
