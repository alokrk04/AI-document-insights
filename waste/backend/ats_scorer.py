
import re
from collections import Counter

# Common tech skills and industry keywords
COMMON_SKILLS = {
    \"python\", \"java\", \"javascript\", \"typescript\", \"react\", \"angular\", \"vue\", \"node\",
    \"sql\", \"nosql\", \"mongodb\", \"postgresql\", \"mysql\", \"redis\", \"docker\", \"kubernetes\",
    \"aws\", \"azure\", \"gcp\", \"git\", \"ci/cd\", \"agile\", \"scrum\", \"rest\", \"graphql\",
    \"machine learning\", \"deep learning\", \"data science\", \"tensorflow\", \"pytorch\",
    \"html\", \"css\", \"sass\", \"tailwind\", \"bootstrap\", \"figma\", \"photoshop\",
    \"project management\", \"leadership\", \"communication\", \"teamwork\", \"problem solving\",
    \"c++\", \"c#\", \"go\", \"rust\", \"swift\", \"kotlin\", \"ruby\", \"php\", \"scala\",
    \"spring\", \"django\", \"flask\", \"fastapi\", \"express\", \"next.js\", \"nuxt\",
    \"tableau\", \"power bi\", \"excel\", \"jira\", \"confluence\", \"slack\",
    \"devops\", \"microservices\", \"api\", \"testing\", \"automation\", \"selenium\",
    \"nlp\", \"computer vision\", \"pandas\", \"numpy\", \"scikit-learn\", \"spark\",
    \"hadoop\", \"kafka\", \"rabbitmq\", \"elasticsearch\", \"linux\", \"bash\",
    \"cybersecurity\", \"networking\", \"cloud computing\", \"blockchain\", \"iot\",
    \"product management\", \"ux design\", \"ui design\", \"a/b testing\", \"seo\",
    \"marketing\", \"sales\", \"analytics\", \"business intelligence\", \"financial modeling\",
}


def extract_keywords(text: str) -> list:
    \"\"\"Extract meaningful keywords from text\"\"\"
    text_lower = text.lower()
    words = re.findall(r'\b[\w+#/.]+\b', text_lower)
    
    # Extract multi-word skills
    found_skills = []
    for skill in COMMON_SKILLS:
        if skill in text_lower:
            found_skills.append(skill)
    
    # Also extract important single words (nouns, technical terms)
    important_words = set()
    for word in words:
        if len(word) > 2 and word not in _STOP_WORDS:
            important_words.add(word)
    
    return list(set(found_skills) | important_words)


def calculate_ats_score(resume_text: str, job_description: str) -> dict:
    \"\"\"Calculate ATS compatibility score\"\"\"
    resume_lower = resume_text.lower()
    jd_lower = job_description.lower()
    
    # Extract keywords from both
    resume_keywords = set(extract_keywords(resume_text))
    jd_keywords = set(extract_keywords(job_description))
    
    # Find matching and missing keywords
    matching = resume_keywords & jd_keywords
    missing_from_resume = jd_keywords - resume_keywords
    
    # Filter to more relevant missing keywords (skills + important terms)
    jd_skills = {s for s in COMMON_SKILLS if s in jd_lower}
    resume_skills = {s for s in COMMON_SKILLS if s in resume_lower}
    missing_skills = jd_skills - resume_skills
    
    # Score components
    # 1. Keyword match score (40%)
    if len(jd_keywords) > 0:
        keyword_ratio = len(matching) / len(jd_keywords)
    else:
        keyword_ratio = 0
    keyword_score = min(int(keyword_ratio * 100), 100)
    
    # 2. Formatting score (30%) - check for good resume structure
    formatting_score = _evaluate_formatting(resume_text)
    
    # 3. Relevance score (30%) - semantic overlap
    relevance_score = _evaluate_relevance(resume_text, job_description)
    
    # Weighted total
    total_score = int(keyword_score * 0.4 + formatting_score * 0.3 + relevance_score * 0.3)
    total_score = max(0, min(100, total_score))
    
    # Generate recommendations
    recommendations = _generate_recommendations(
        total_score, keyword_score, formatting_score, relevance_score,
        list(missing_skills), resume_text
    )
    
    # Filter missing keywords to top meaningful ones
    important_missing = sorted(
        [k for k in missing_from_resume if len(k) > 3],
        key=lambda x: len(x),
        reverse=True
    )[:20]
    
    return {
        \"ats_score\": total_score,
        \"keyword_matches\": sorted(list(matching))[:30],
        \"missing_keywords\": important_missing,
        \"formatting_score\": formatting_score,
        \"relevance_score\": relevance_score,
        \"keyword_score\": keyword_score,
        \"skills_found\": sorted(list(resume_skills)),
        \"skills_missing\": sorted(list(missing_skills)),
        \"recommendations\": recommendations,
    }


def _evaluate_formatting(resume_text: str) -> int:
    \"\"\"Evaluate resume formatting quality\"\"\"
    score = 50  # Base score
    
    lines = resume_text.split('\n')
    non_empty = [l for l in lines if l.strip()]
    
    # Check for section headers
    headers = ['experience', 'education', 'skills', 'summary', 'objective', 'projects', 'certifications', 'work history']
    found_headers = sum(1 for h in headers if h in resume_text.lower())
    score += min(found_headers * 8, 25)
    
    # Check for bullet points
    bullet_count = sum(1 for l in lines if l.strip().startswith(('-', '*', '•', '>')))
    if bullet_count >= 5:
        score += 10
    elif bullet_count >= 2:
        score += 5
    
    # Check length (not too short, not too long)
    word_count = len(resume_text.split())
    if 200 <= word_count <= 1000:
        score += 10
    elif word_count < 100:
        score -= 10
    
    # Check for contact info patterns
    if re.search(r'[\w.-]+@[\w.-]+\.\w+', resume_text):
        score += 5
    
    return max(0, min(100, score))


def _evaluate_relevance(resume_text: str, job_description: str) -> int:
    \"\"\"Evaluate semantic relevance between resume and JD\"\"\"
    resume_words = Counter(re.findall(r'\b\w+\b', resume_text.lower()))
    jd_words = Counter(re.findall(r'\b\w+\b', job_description.lower()))
    
    # Remove stop words
    for sw in _STOP_WORDS:
        resume_words.pop(sw, None)
        jd_words.pop(sw, None)
    
    # Calculate cosine similarity using word frequency
    common = set(resume_words.keys()) & set(jd_words.keys())
    if not common:
        return 20
    
    dot = sum(resume_words[w] * jd_words[w] for w in common)
    mag_r = sum(v**2 for v in resume_words.values()) ** 0.5
    mag_j = sum(v**2 for v in jd_words.values()) ** 0.5
    
    if mag_r * mag_j == 0:
        return 20
    
    similarity = dot / (mag_r * mag_j)
    return max(20, min(100, int(similarity * 200)))


def _generate_recommendations(total, keyword, formatting, relevance, missing_skills, resume_text) -> list:
    \"\"\"Generate actionable recommendations\"\"\"
    recs = []
    
    if keyword < 50:
        recs.append(\"Your resume is missing many keywords from the job description. Add relevant technical terms and skills.\")
    
    if formatting < 60:
        recs.append(\"Improve your resume structure. Use clear section headers (Experience, Education, Skills) and bullet points.\")
    
    if relevance < 50:
        recs.append(\"Your resume content doesn't closely match the job description. Tailor your experience descriptions to align with the role.\")
    
    if missing_skills:
        top_missing = missing_skills[:5]
        recs.append(f\"Add these missing skills if applicable: {', '.join(top_missing)}\")
    
    if not re.search(r'\d+%|\d+x|\$[\d,]+|\d+ (users|clients|projects|team)', resume_text.lower()):
        recs.append(\"Add quantifiable achievements (e.g., 'Increased efficiency by 30%', 'Managed team of 8').\")
    
    if total >= 80:
        recs.append(\"Strong match! Fine-tune remaining gaps for a perfect score.\")
    elif total >= 60:
        recs.append(\"Good foundation. Focus on adding missing keywords and quantifying achievements.\")
    else:
        recs.append(\"Significant improvements needed. Consider a full resume rewrite targeting this specific role.\")
    
    return recs


_STOP_WORDS = {
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'need',
    'dare', 'ought', 'used', 'i', 'me', 'my', 'we', 'our', 'you', 'your',
    'he', 'him', 'his', 'she', 'her', 'it', 'its', 'they', 'them', 'their',
    'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am',
    'not', 'no', 'nor', 'so', 'if', 'then', 'than', 'too', 'very', 'just',
    'about', 'above', 'after', 'again', 'all', 'also', 'any', 'because',
    'before', 'between', 'both', 'each', 'few', 'further', 'here', 'how',
    'into', 'more', 'most', 'other', 'out', 'over', 'own', 'same', 'some',
    'such', 'through', 'under', 'until', 'up', 'when', 'where', 'while',
}
"
