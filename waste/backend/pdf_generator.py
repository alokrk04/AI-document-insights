
Action: file_editor create /app/backend/pdf_generator.py --file-text "\"\"\"PDF Generator - creates ATS-compliant PDF resumes using ReportLab\"\"\"
import io
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.enums import TA_LEFT, TA_CENTER


def generate_pdf(content: dict) -> io.BytesIO:
    \"\"\"Generate an ATS-friendly PDF from optimized resume content\"\"\"
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles for ATS compliance (simple, clean formatting)
    name_style = ParagraphStyle(
        'NameStyle',
        parent=styles['Heading1'],
        fontSize=18,
        spaceAfter=4,
        alignment=TA_CENTER,
        textColor=colors.black,
    )
    
    section_style = ParagraphStyle(
        'SectionStyle',
        parent=styles['Heading2'],
        fontSize=13,
        spaceBefore=12,
        spaceAfter=6,
        textColor=colors.HexColor('#1a1a2e'),
        borderWidth=0,
    )
    
    body_style = ParagraphStyle(
        'BodyStyle',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        spaceAfter=3,
    )
    
    bullet_style = ParagraphStyle(
        'BulletStyle',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        leftIndent=20,
        spaceAfter=2,
        bulletIndent=10,
    )
    
    subtitle_style = ParagraphStyle(
        'SubtitleStyle',
        parent=styles['Normal'],
        fontSize=11,
        leading=14,
        spaceAfter=2,
        textColor=colors.HexColor('#333333'),
        fontName='Helvetica-Bold',
    )
    
    story = []
    
    # Summary
    summary = content.get('summary', '')
    if summary:
        story.append(Paragraph(\"PROFESSIONAL SUMMARY\", section_style))
        story.append(HRFlowable(width=\"100%\", thickness=1, color=colors.HexColor('#cccccc')))
        story.append(Spacer(1, 4))
        story.append(Paragraph(summary, body_style))
        story.append(Spacer(1, 8))
    
    # Skills
    skills = content.get('skills', [])
    if skills:
        story.append(Paragraph(\"SKILLS\", section_style))
        story.append(HRFlowable(width=\"100%\", thickness=1, color=colors.HexColor('#cccccc')))
        story.append(Spacer(1, 4))
        skills_text = \" | \".join(skills) if isinstance(skills, list) else str(skills)
        story.append(Paragraph(skills_text, body_style))
        story.append(Spacer(1, 8))
    
    # Experience
    experience = content.get('experience', [])
    if experience:
        story.append(Paragraph(\"EXPERIENCE\", section_style))
        story.append(HRFlowable(width=\"100%\", thickness=1, color=colors.HexColor('#cccccc')))
        story.append(Spacer(1, 4))
        
        for exp in experience:
            if isinstance(exp, dict):
                title = exp.get('title', '')
                company = exp.get('company', '')
                period = exp.get('period', '')
                
                if title or company:
                    header = f\"<b>{title}</b>\"
                    if company:
                        header += f\" — {company}\"
                    if period:
                        header += f\" ({period})\"
                    story.append(Paragraph(header, subtitle_style))
                
                bullets = exp.get('bullets', [])
                for bullet in bullets:
                    if bullet:
                        story.append(Paragraph(f\"• {bullet}\", bullet_style))
                
                story.append(Spacer(1, 6))
    
    # Education
    education = content.get('education', [])
    if education:
        story.append(Paragraph(\"EDUCATION\", section_style))
        story.append(HRFlowable(width=\"100%\", thickness=1, color=colors.HexColor('#cccccc')))
        story.append(Spacer(1, 4))
        
        for edu in education:
            if isinstance(edu, dict):
                degree = edu.get('degree', '')
                institution = edu.get('institution', '')
                year = edu.get('year', '')
                line = f\"<b>{degree}</b>\"
                if institution:
                    line += f\" — {institution}\"
                if year:
                    line += f\" ({year})\"
                story.append(Paragraph(line, body_style))
                story.append(Spacer(1, 4))
    
    if not story:
        story.append(Paragraph(\"No content available for PDF generation.\", body_style))
    
    doc.build(story)
    buffer.seek(0)
    return buffer
"
Observation: Create successful: /app/backend/pdf_generator.py