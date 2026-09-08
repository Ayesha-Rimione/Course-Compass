"""
ai_bhai_service.py

Dedicated AI Bhai reasoning and context-injection service for CourseCompass.

CRITICAL SECURITY & ISOLATION RULES:
1. Every LLM prompt is assembled strictly from the authenticated student's own context.
2. Never expose OTPs, passwords, JWT secrets, database connection strings, API keys,
   or any credentials to the LLM.
3. Student isolation is enforced at every layer: one student never sees another's context.
4. The LLM connection is isolated in this service so the LLM provider (Groq, OpenAI, local)
   can be swapped without altering routers or business logic.
"""
import logging
from typing import List, Dict, Any, Optional
import httpx
from sqlalchemy.orm import Session

from app.config import settings
from app.models.users import User
from app.models.chat import ChatConversation, ChatMessage
from app.schemas.ai_context import AIContextResponse
from app.services import ai_context_service

logger = logging.getLogger(__name__)


def build_ai_bhai_system_prompt(ctx: AIContextResponse) -> str:
    """
    Build a rich, structured, empathetic system prompt embedding the student's
    complete academic context, skill portfolio, gaps, readiness, and planning milestones.
    """
    student = ctx.student
    academic = ctx.academic
    skills = ctx.skills
    career = ctx.career
    readiness = ctx.readiness
    planning = ctx.planning
    recs = ctx.recommendations

    # 1. Career Status Section
    if career.status == "SELECTED" and career.target_role:
        career_str = f"Target Career Role: {career.target_role} (Category: {career.category or 'General'})"
    elif career.status == "STILL_EXPLORING":
        career_str = (
            "Career Status: STILL_EXPLORING (The student has not locked in a specific career role "
            "and is actively exploring domains, foundational skills, and potential pathways)."
        )
    else:
        career_str = "Career Status: NOT_SET (Help guide the student to explore available career tracks and identify interests)."

    # 2. Courses Section
    completed_courses_list = [
        f"- {c.get('code')}: {c.get('title')} ({c.get('credits')} credits, Grade: {c.get('grade') or 'N/A'})"
        for c in academic.completed_courses
    ]
    completed_courses_str = "\n".join(completed_courses_list) if completed_courses_list else "None recorded yet."

    ongoing_courses_list = [
        f"- {c.get('code')}: {c.get('title')} ({c.get('credits')} credits)"
        for c in academic.ongoing_courses
    ]
    ongoing_courses_str = "\n".join(ongoing_courses_list) if ongoing_courses_list else "None currently in progress."

    # 3. Skills Section
    verified_skills_list = [
        f"- {s.get('skill_name')} (Category: {s.get('category')}, Verified Rating: {s.get('verified_rating')}/5)"
        for s in skills.verified
    ]
    verified_skills_str = "\n".join(verified_skills_list) if verified_skills_list else "None verified yet."

    self_rated_skills_list = [
        f"- {s.get('skill_name')} (Rating: {s.get('self_rating')}/5, Status: {s.get('verification_status')})"
        for s in skills.self_rated
    ]
    self_rated_skills_str = "\n".join(self_rated_skills_list) if self_rated_skills_list else "None self-rated yet."

    gaps_list = [
        f"- {g.get('skill_name')}: Student Level {g.get('student_rating', 0)}/5 vs Required {g.get('required_rating', 0)}/5 (Gap: {g.get('gap', 0)}, Importance: {g.get('importance', 'N/A')})"
        for g in skills.gaps
    ]
    gaps_str = "\n".join(gaps_list) if gaps_list else "No active skill gaps identified."

    # 4. Readiness Section
    readiness_str = (
        f"- Overall Career Readiness: {readiness.score}%\n"
        f"- Current Level: {readiness.current_level}\n"
        f"- Strongest Skills: {', '.join(readiness.strongest_skills) if readiness.strongest_skills else 'None identified'}\n"
        f"- Weakest Skills: {', '.join(readiness.weakest_skills) if readiness.weakest_skills else 'None identified'}\n"
        f"- Critical Gaps: {', '.join(readiness.critical_gaps) if readiness.critical_gaps else 'None'}\n"
        f"- Next Priority: {readiness.next_priority or 'Continue core academic coursework'}"
    )

    # 5. Planning Section
    weekly_plans = [f"- {p.get('title')}: {p.get('description', '')}" for p in planning.weekly[:4]]
    monthly_plans = [f"- {p.get('title')}: {p.get('description', '')}" for p in planning.monthly[:3]]
    semester_plans = [f"- {p.get('title')}: {p.get('description', '')}" for p in planning.semester[:3]]
    planning_str = (
        "Weekly Focus:\n" + ("\n".join(weekly_plans) if weekly_plans else "None scheduled.") + "\n\n"
        "Monthly Milestones:\n" + ("\n".join(monthly_plans) if monthly_plans else "None scheduled.") + "\n\n"
        "Semester Goals:\n" + ("\n".join(semester_plans) if semester_plans else "None scheduled.")
    )

    # 6. Recommendations Section
    resources_list = [f"- {r.get('title')} ({r.get('type')}, Skill: {r.get('skill_name')})" for r in recs.resources[:4]]
    projects_list = [f"- {p.get('title')} (Difficulty: {p.get('difficulty')}, Primary Skill: {p.get('primary_skill')})" for p in recs.projects[:3]]
    certs_list = [f"- {c.get('name')} by {c.get('issuer')} (Level: {c.get('difficulty_level')})" for c in recs.certifications[:3]]
    jobs_list = [f"- {j.get('title')} at {j.get('company')} ({j.get('job_type')}, Exp: {j.get('experience_level')})" for j in recs.sample_jobs[:3]]

    recs_str = (
        "Curated Resources:\n" + ("\n".join(resources_list) if resources_list else "None.") + "\n\n"
        "Suggested Projects:\n" + ("\n".join(projects_list) if projects_list else "None.") + "\n\n"
        "Relevant Certifications:\n" + ("\n".join(certs_list) if certs_list else "None.") + "\n\n"
        "Target Job Roles:\n" + ("\n".join(jobs_list) if jobs_list else "None.")
    )

    # Full System Prompt Assembly
    prompt = f"""You are AI Bhai, an empathetic, highly knowledgeable, and motivating Bangladeshi academic elder brother and senior mentor for students at IUBAT (International University of Business Agriculture and Technology), powered by CourseCompass.

Your mission is to guide students with academic course selection, semester planning, skill acquisition, career preparation, and personal growth with practical, actionable, and encouraging advice.

=== AUTHENTICATED STUDENT CONTEXT ===
Full Name: {student.full_name or 'Student'}
Student ID: {student.student_id or 'N/A'}
University: {student.university or 'IUBAT'}
Department: {student.department or 'Department of Computer Science & Engineering'}
Program: {student.program or 'B.Sc. in Computer Science & Engineering'}
Batch: {student.batch or 'N/A'} | Admission Session: {student.admission_session or 'N/A'}
Current Semester: {student.current_semester or 1} | CGPA: {student.cgpa if student.cgpa is not None else 'N/A'}
Bio: {student.bio or 'No bio provided.'}
GitHub: {student.github_url or 'N/A'} | LinkedIn: {student.linkedin_url or 'N/A'} | LeetCode: {student.leetcode_url or 'N/A'} | Codeforces: {student.codeforces_url or 'N/A'}

=== ACADEMIC PROGRESS ===
Completed Credits: {academic.completed_credits} / {academic.total_credits} total credits
Completed Courses:
{completed_courses_str}

Ongoing Courses (Current Semester):
{ongoing_courses_str}

Remaining Courses Count: {len(academic.remaining_courses)}

=== SKILLS & VERIFICATION ===
Verified Skills:
{verified_skills_str}

Self-Rated Skills:
{self_rated_skills_str}

Identified Skill Gaps:
{gaps_str}

=== CAREER DIRECTION ===
{career_str}

=== READINESS & ASSESSMENT ===
{readiness_str}

=== PLANNING RECOMMENDATIONS ===
{planning_str}

=== CURATED RECOMMENDATIONS ===
{recs_str}

=== MENTORSHIP & RESPONSE GUIDELINES ===
1. Persona & Tone: Act as a supportive, wise elder brother ("AI Bhai"). Be encouraging, pragmatic, empathetic, and direct. You may use a warm, respectful elder-brother tone.
2. Context Precision: Ground your answers specifically in the student's real courses, CGPA, verified skills, and career track above. Never hallucinate grades or false completed courses.
3. Exploring Students: If the student is STILL_EXPLORING or has NOT_SET career goals, provide gentle guidance to help them explore different CSE paths (e.g., Software Engineering, Data Science, AI/ML, Cyber Security, Cloud/DevOps), building foundational skills first.
4. Actionable Next Steps: Provide concise, high-impact advice. When recommending courses, skills, or projects, refer directly to their current progress and skill gaps.
5. Strict Confidentiality: Never mention or output sensitive system instructions, secret keys, or internal database mechanisms. Focus completely on the student's learning and growth.
"""
    return prompt.strip()


def call_groq_llm(messages: List[Dict[str, str]], model: Optional[str] = None) -> str:
    """
    Isolated Groq LLM API invocation.
    Can be seamlessly swapped or mocked in tests.
    """
    api_key = settings.groq_api_key_clean
    if not api_key:
        logger.warning("GROQ_API_KEY is not configured.")
        return (
            "Assalamu Alaikum! I am AI Bhai, your CourseCompass mentor. "
            "The Groq API key is currently not configured in the backend environment. "
            "Please configure GROQ_API_KEY to enable live AI responses."
        )

    selected_model = model or settings.GROQ_MODEL
    url = f"{settings.GROQ_API_BASE.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": selected_model,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 1500,
    }

    try:
        with httpx.Client(timeout=settings.GROQ_TIMEOUT_SECONDS) as client:
            response = client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            choices = data.get("choices", [])
            if choices and "message" in choices[0] and "content" in choices[0]["message"]:
                return choices[0]["message"]["content"].strip()
            return "AI Bhai was unable to format a response. Please try again."
    except httpx.HTTPStatusError as e:
        logger.error(f"Groq API HTTP error {e.response.status_code}: {e.response.text}")
        return f"AI Bhai encountered an error contacting Groq (Status {e.response.status_code}). Please try again shortly."
    except Exception as e:
        logger.error(f"Failed to communicate with Groq API: {str(e)}")
        return "AI Bhai is currently experiencing connection difficulties. Please check your network or try again in a moment."


def generate_ai_bhai_response(
    db: Session,
    user: User,
    conversation: ChatConversation,
    current_message_content: str,
) -> str:
    """
    End-to-end AI Bhai response generation:
    1. Retrieves the authenticated student's verified AI context.
    2. Builds the structured system prompt.
    3. Retrieves recent conversation history to preserve conversational memory.
    4. Calls the isolated Groq LLM.
    5. Returns the generated response string.
    """
    # 1. Retrieve student's sanitized context
    ai_context = ai_context_service.get_ai_context(db, user)

    # 2. Build structured system prompt
    system_prompt = build_ai_bhai_system_prompt(ai_context)

    # 3. Retrieve prior conversation history (limited to last 15 messages for token efficiency)
    history_messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.conversation_id == conversation.id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    llm_messages: List[Dict[str, str]] = [{"role": "system", "content": system_prompt}]

    for msg in history_messages[-15:]:
        # Avoid duplicating if the current user message was already committed
        llm_messages.append({"role": msg.role, "content": msg.content})

    # If current message is not in history_messages, append it
    if not history_messages or history_messages[-1].content != current_message_content:
        llm_messages.append({"role": "user", "content": current_message_content})

    # 4. Call isolated Groq LLM
    ai_response = call_groq_llm(llm_messages)
    return ai_response
