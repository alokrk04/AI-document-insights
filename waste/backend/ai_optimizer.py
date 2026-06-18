
import os
import json
import uuid
import logging
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / '.env')

from emergentintegrations.llm.chat import LlmChat, UserMessage

logger = logging.getLogger(__name__)

API_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

SYSTEM_PROMPT_OPTIMIZER = \"\"\"You are a Professional Career Coach and ATS Expert with 15+ years of experience in resume optimization. Your role is to:

1. Analyze resumes against job descriptions for ATS compatibility
2. Rewrite bullet points using the Google XYZ formula: \"Accomplished [X] as measured by [Y], by doing [Z]\"
3. Identify missing industry-specific keywords
4. Restructure resumes into ATS-friendly formats

Rules:
- Always use strong action verbs (Led, Developed, Implemented, Optimized, etc.)
- Include quantifiable results where possible
- Keep bullet points concise (1-2 lines max)
- Prioritize keywords from the job description
- Maintain professional tone
- Structure: Contact Info, Summary, Skills, Experience, Education, Certifications

IMPORTANT: Always respond with valid JSON only. No markdown, no code blocks, just raw JSON.\"\"\"

SYSTEM_PROMPT_BULLET = \"\"\"You are an expert resume bullet point optimizer. Transform weak, generic bullet points into powerful, achievement-focused statements using the Google XYZ formula:
\"Accomplished [X] as measured by [Y], by doing [Z]\"

Rules:
- Use strong action verbs
- Add quantifiable metrics when possible
- Be specific and concise
- Keep each version under 2 lines
- Make each version unique in approach

IMPORTANT: Always respond with valid JSON only. No markdown, no code blocks, just raw JSON.\"\"\"

SYSTEM_PROMPT_SKILLGAP = \"\"\"You are a Career Skills Analyst and ATS Expert. Your role is to perform detailed skill gap analysis between a candidate's resume and a target job description.

Analyze:
1. Technical skills present vs required
2. Soft skills present vs required
3. Experience level alignment
4. Industry-specific terminology gaps
5. Certification/qualification gaps

Provide actionable recommendations for closing each gap.

IMPORTANT: Always respond with valid JSON only. No markdown, no code blocks, just raw JSON.\"\"\"


async def optimize_resume(resume_text: str, job_description: str) -> dict:
    \"\"\"Use AI to optimize the full resume\"\"\"
    chat = LlmChat(
        api_key=API_KEY,
        session_id=f\"optimize-{uuid.uuid4().hex[:8]}\",
        system_message=SYSTEM_PROMPT_OPTIMIZER
    ).with_model(\"openai\", \"gpt-5.2\")

    prompt = f\"\"\"Analyze this resume against the job description and provide an optimized version.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Respond with this exact JSON structure:
{{
    \"optimized_resume\": {{
        \"summary\": \"A tailored professional summary (2-3 sentences)\",
        \"skills\": [\"skill1\", \"skill2\", ...],
        \"experience\": [
            {{
                \"title\": \"Job Title\",
                \"company\": \"Company Name\",
                \"period\": \"Date Range\",
                \"bullets\": [\"Optimized bullet 1\", \"Optimized bullet 2\", ...]
            }}
        ],
        \"education\": [
            {{
                \"degree\": \"Degree Name\",
                \"institution\": \"School Name\",
                \"year\": \"Year\"
            }}
        ]
    }},
    \"suggestions\": [\"suggestion1\", \"suggestion2\", ...],
    \"rewritten_bullets\": [
        {{
            \"original\": \"original bullet text\",
            \"improved\": \"improved bullet text\"
        }}
    ]
}}\"\"\"

    try:
        response = await chat.send_message(UserMessage(text=prompt))
        # Try to parse JSON from response
        parsed = _extract_json(response)
        if parsed:
            return parsed
        # Fallback structure
        return {
            \"optimized_resume\": {
                \"summary\": response[:500] if response else \"Unable to generate summary\",
                \"skills\": [],
                \"experience\": [],
                \"education\": []
            },
            \"suggestions\": [\"AI optimization completed. Review the output for accuracy.\"],
            \"rewritten_bullets\": []
        }
    except Exception as e:
        logger.error(f\"AI optimization error: {e}\")
        return {\"error\": str(e)}


async def optimize_bullet_point(bullet: str, job_description: str = \"\") -> dict:
    \"\"\"Optimize a single bullet point into 3 enhanced versions\"\"\"
    chat = LlmChat(
        api_key=API_KEY,
        session_id=f\"bullet-{uuid.uuid4().hex[:8]}\",
        system_message=SYSTEM_PROMPT_BULLET
    ).with_model(\"openai\", \"gpt-5.2\")

    jd_context = f\"\nContext from target job description: {job_description}\" if job_description else \"\"

    prompt = f\"\"\"Transform this resume bullet point into 3 enhanced versions using the Google XYZ formula.{jd_context}

Original bullet point: \"{bullet}\"

Respond with this exact JSON structure:
{{
    \"original\": \"{bullet}\",
    \"enhanced_versions\": [
        \"Enhanced version 1 with metrics and action verbs\",
        \"Enhanced version 2 with different angle\",
        \"Enhanced version 3 with maximum impact\"
    ]
}}\"\"\"

    try:
        response = await chat.send_message(UserMessage(text=prompt))
        parsed = _extract_json(response)
        if parsed:
            return parsed
        return {
            \"original\": bullet,
            \"enhanced_versions\": [response] if response else [\"Unable to generate enhanced versions\"]
        }
    except Exception as e:
        logger.error(f\"Bullet optimization error: {e}\")
        return {\"error\": str(e)}


async def generate_skill_gap_analysis(resume_text: str, job_description: str) -> dict:
    \"\"\"AI-powered skill gap analysis\"\"\"
    chat = LlmChat(
        api_key=API_KEY,
        session_id=f\"skillgap-{uuid.uuid4().hex[:8]}\",
        system_message=SYSTEM_PROMPT_SKILLGAP
    ).with_model(\"openai\", \"gpt-5.2\")

    prompt = f\"\"\"Perform a detailed skill gap analysis.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Respond with this exact JSON structure:
{{
    \"technical_skills\": {{
        \"present\": [\"skill1\", \"skill2\"],
        \"missing\": [\"skill3\", \"skill4\"],
        \"match_percentage\": 75
    }},
    \"soft_skills\": {{
        \"present\": [\"skill1\"],
        \"missing\": [\"skill2\"],
        \"match_percentage\": 60
    }},
    \"experience_alignment\": {{
        \"score\": 70,
        \"gaps\": [\"gap1\", \"gap2\"],
        \"strengths\": [\"strength1\"]
    }},
    \"certifications\": {{
        \"recommended\": [\"cert1\", \"cert2\"]
    }},
    \"action_plan\": [
        {{
            \"priority\": \"high\",
            \"action\": \"Learn X technology\",
            \"timeline\": \"1-2 months\",
            \"resources\": \"Coursera, Udemy\"
        }}
    ]
}}\"\"\"

    try:
        response = await chat.send_message(UserMessage(text=prompt))
        parsed = _extract_json(response)
        if parsed:
            return parsed
        return {\"raw_analysis\": response}
    except Exception as e:
        logger.error(f\"Skill gap analysis error: {e}\")
        return {\"error\": str(e)}


def _extract_json(text: str) -> dict:
    \"\"\"Extract JSON from AI response, handling markdown code blocks\"\"\"
    if not text:
        return None
    
    # Try direct parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    
    # Try extracting from code blocks
    patterns = [
        r'```json\s*(.*?)\s*```',
        r'```\s*(.*?)\s*```',
        r'\{.*\}'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1) if '```' in pattern else match.group(0))
            except (json.JSONDecodeError, IndexError):
                continue
    
    return None


import re
"
