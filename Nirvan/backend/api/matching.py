from __future__ import annotations

from fastapi import APIRouter, BackgroundTasks, Depends

from agents.negotiation.protocol import (
    FitScoreInput,
    any_dealbreaker_triggered,
    calculate_fit_score,
)
from api.auth import get_current_user
from db.client import get_db
from tasks.queue import dispatch_task

router = APIRouter(prefix="/api/matching", tags=["matching"])


async def run_matching_scan(
    candidate_id: str | None = None, recruiter_id: str | None = None
):
    db = get_db()

    candidates = []
    recruiters = []

    if candidate_id:
        candidate_res = (
            db.table("candidates").select("*").eq("id", candidate_id).execute()
        )
        if not candidate_res.data:
            return
        candidates = candidate_res.data
        recruiters_res = db.table("recruiters").select("*").execute()
        recruiters = recruiters_res.data or []
    elif recruiter_id:
        recruiter_res = (
            db.table("recruiters").select("*").eq("id", recruiter_id).execute()
        )
        if not recruiter_res.data:
            return
        recruiters = recruiter_res.data
        candidates_res = db.table("candidates").select("*").execute()
        candidates = candidates_res.data or []
    else:
        # Full scan
        candidates_res = db.table("candidates").select("*").execute()
        candidates = candidates_res.data or []
        recruiters_res = db.table("recruiters").select("*").execute()
        recruiters = recruiters_res.data or []

    # Iterate through pairs and calculate fit scores
    for cand in candidates:
        for rec in recruiters:
            # Skip if active negotiation already exists
            existing = (
                db.table("negotiations")
                .select("id")
                .eq("candidate_id", cand["id"])
                .eq("recruiter_id", rec["id"])
                .eq("status", "active")
                .execute()
            )
            if existing.data:
                continue

            skills_dict = {s: "verified" for s in (cand.get("skills") or [])}
            reqs_dict = {s: "required" for s in (rec.get("must_haves") or [])}

            fit_input = FitScoreInput(
                candidate_verified_skills=skills_dict,
                candidate_salary_min=cand.get("salary_min"),
                candidate_salary_target=None,
                candidate_dealbreakers=cand.get("dealbreakers") or [],
                candidate_priorities=["remote"] if cand.get("remote_pref") else [],
                recruiter_requirements=reqs_dict,
                recruiter_salary_ceiling=rec.get("salary_range_max"),
                recruiter_salary_budget=rec.get("salary_range_min"),
                recruiter_must_haves=rec.get("must_haves") or [],
                recruiter_dealbreakers=rec.get("dealbreakers") or [],
            )

            # Check dealbreakers and fit score
            if not any_dealbreaker_triggered(fit_input):
                fit_score = calculate_fit_score(fit_input)
                if fit_score >= 0.60:
                    # Create negotiation
                    neg_res = (
                        db.table("negotiations")
                        .insert(
                            {
                                "candidate_id": cand["id"],
                                "recruiter_id": rec["id"],
                                "status": "active",
                                "fit_score": int(round(fit_score * 100)),
                            }
                        )
                        .execute()
                    )

                    if neg_res.data:
                        negotiation_id = neg_res.data[0]["id"]
                        # Trigger A2A orchestrator loop and send email alerts via background worker
                        dispatch_task(
                            None, "notify_new_match", negotiation_id=negotiation_id
                        )
                        dispatch_task(
                            None, "run_negotiation_loop", negotiation_id=negotiation_id
                        )


@router.post("/scan")
async def trigger_full_scan(
    background_tasks: BackgroundTasks,
    user=Depends(get_current_user),
):
    dispatch_task(background_tasks, "run_matching_scan")
    return {"status": "started", "scan": "full"}
