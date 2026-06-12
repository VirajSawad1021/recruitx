import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from db.client import get_db


def create_or_get_candidate(
    name: str,
    title: str,
    skills: list,
    salary_min: int,
    email: str,
    github_url: str = None,
    portfolio_url: str = None,
):
    db = get_db()

    # 1. Check if profile already exists in DB by name
    p_res = (
        db.table("profiles")
        .select("*")
        .eq("role", "candidate")
        .eq("name", name)
        .execute()
    )
    if p_res.data:
        profile = p_res.data[0]
        print(f"Profile for {name} already exists: {profile['id']}")
    else:
        # 2. Register candidate via Auth system
        print(f"Signing up auth user for {name} with email: {email}")
        user_id = None
        try:
            auth_res = db.auth.sign_up(
                credentials={"email": email, "password": "Password123!"}
            )
            user_id = auth_res.user.id
            print(f"Created Auth User for {name}: {user_id}")
        except Exception as auth_err:
            print(f"Auth registration failed or user already exists: {auth_err}")

        # Try signing in to set active session (satisfying auth.uid() = id)
        print(f"Signing in as {name} ({email}) to set client auth context...")
        try:
            login_res = db.auth.sign_in_with_password(
                credentials={"email": email, "password": "Password123!"}
            )
            user_id = login_res.user.id
            print(f"Successfully signed in as {name}: {user_id}")
        except Exception as login_err:
            print(f"Sign in failed: {login_err}")
            if user_id is None:
                # If we couldn't create or login, try to find existing profile anyway
                pf_res = db.table("profiles").select("*").eq("name", name).execute()
                if pf_res.data:
                    profile = pf_res.data[0]
                    user_id = profile["id"]
                else:
                    raise login_err

        # Check if profile row already exists (trigger might have created it)
        p_check = db.table("profiles").select("*").eq("id", user_id).execute()
        if p_check.data:
            print(f"Profile row for {name} already exists, updating role and name...")
            p_insert = (
                db.table("profiles")
                .update({"role": "candidate", "name": name, "avatar_url": None})
                .eq("id", user_id)
                .execute()
            )
        else:
            print(f"Inserting new profile row for {name}...")
            p_insert = (
                db.table("profiles")
                .insert(
                    {
                        "id": user_id,
                        "role": "candidate",
                        "name": name,
                        "avatar_url": None,
                    }
                )
                .execute()
            )
        profile = p_insert.data[0]

    # 3. Create/Ensure Candidate Detail Row
    c_res = db.table("candidates").select("*").eq("profile_id", profile["id"]).execute()
    if c_res.data:
        cand = c_res.data[0]
        print(f"Candidate details for {name} already exists: {cand['id']}")
    else:
        # Create candidate row (allowed because backend_candidates_update and standard policies permit)
        c_id = str(uuid.uuid4())
        print(f"Creating candidate details for {name} with ID: {c_id}")
        c_insert = (
            db.table("candidates")
            .insert(
                {
                    "id": c_id,
                    "profile_id": profile["id"],
                    "title": title,
                    "skills": skills,
                    "salary_min": salary_min,
                    "remote_pref": True,
                    "github_url": github_url,
                    "portfolio_url": portfolio_url,
                    "availability": "immediate",
                }
            )
            .execute()
        )
        cand = c_insert.data[0]

    return cand


def main():
    db = get_db()
    recruiter_id = "fe9e3b5a-aca8-4138-a8b8-1d4929768f09"  # Recruiter Zoro

    print("--- Seeding Kanban Mock Data into Supabase ---")

    # Reset/clear previous client auth session to start clean
    try:
        db.auth.sign_out()
    except Exception:
        pass

    # 1. Luffy (DevOps Intern, Leapfrog) - already exists, skip auth creation
    luffy_res = (
        db.table("candidates").select("*").eq("title", "DevOps Intern").execute()
    )
    if luffy_res.data:
        luffy = luffy_res.data[0]
        print(f"Found existing Luffy candidate: {luffy['id']}")
    else:
        luffy = create_or_get_candidate(
            "Luffy",
            "DevOps Intern",
            ["Docker", "Linux", "CI/CD"],
            15000,
            "luffy_mugiwara@gmail.com",
        )

    # Luffy negotiation
    l_neg = (
        db.table("negotiations")
        .select("*")
        .eq("candidate_id", luffy["id"])
        .eq("recruiter_id", recruiter_id)
        .execute()
    )
    if not l_neg.data:
        db.table("negotiations").insert(
            {
                "id": str(uuid.uuid4()),
                "candidate_id": luffy["id"],
                "recruiter_id": recruiter_id,
                "status": "active",
                "fit_score": 78,
                "candidate_notes": "job_id:2c593449-fcd0-4597-9342-79ef88edd385",
                "recruiter_notes": "Sourcing stage - awaiting agent trigger",
            }
        ).execute()
        print("Seeded Luffy negotiation successfully.")

    # 2. Sanji (AI Fellow, Logpoint) - already exists, skip auth creation
    sanji_res = db.table("candidates").select("*").eq("title", "AI Fellow").execute()
    if sanji_res.data:
        sanji = sanji_res.data[0]
        print(f"Found existing Sanji candidate: {sanji['id']}")
    else:
        sanji = create_or_get_candidate(
            "Sanji",
            "AI Fellow",
            ["Python", "PyTorch", "NLP"],
            13000,
            "sanji_chef@gmail.com",
        )

    # Sanji negotiation
    s_neg = (
        db.table("negotiations")
        .select("*")
        .eq("candidate_id", sanji["id"])
        .eq("recruiter_id", recruiter_id)
        .execute()
    )
    if not s_neg.data:
        db.table("negotiations").insert(
            {
                "id": str(uuid.uuid4()),
                "candidate_id": sanji["id"],
                "recruiter_id": recruiter_id,
                "status": "active",
                "fit_score": 66,
                "candidate_notes": "job_id:dd351c71-8846-4b71-92a5-49a7228b1615",
                "recruiter_notes": "Active dialogue ongoing",
            }
        ).execute()
        print("Seeded Sanji negotiation successfully.")

    # 3. Zoro Candidate (Backend Engineer)
    try:
        zoro_cand = create_or_get_candidate(
            "Zoro (Candidate)",
            "Backend Engineer",
            ["Go", "PostgreSQL", "gRPC"],
            16000,
            "zoro_swordsman@gmail.com",
        )
        z_neg = (
            db.table("negotiations")
            .select("*")
            .eq("candidate_id", zoro_cand["id"])
            .eq("recruiter_id", recruiter_id)
            .execute()
        )
        if not z_neg.data:
            db.table("negotiations").insert(
                {
                    "id": str(uuid.uuid4()),
                    "candidate_id": zoro_cand["id"],
                    "recruiter_id": recruiter_id,
                    "status": "scheduled",
                    "fit_score": 85,
                    "candidate_notes": "job_id:93aa7533-52ad-462c-820a-ee3a707a5fbe|Friday, May 22 at 02:00 PM UTC",
                    "recruiter_notes": "Interview set",
                }
            ).execute()
            print("Seeded Zoro candidate negotiation successfully.")
    except Exception as e:
        print(
            f"Skipping Zoro candidate seeding due to auth/email confirmation settings: {e}"
        )

    # 4. Nami (Frontend Intern)
    try:
        nami = create_or_get_candidate(
            "Nami",
            "Frontend Intern",
            ["React", "CSS", "Tailwind"],
            14000,
            "nami_navigator@gmail.com",
        )
        n_neg = (
            db.table("negotiations")
            .select("*")
            .eq("candidate_id", nami["id"])
            .eq("recruiter_id", recruiter_id)
            .execute()
        )
        if not n_neg.data:
            db.table("negotiations").insert(
                {
                    "id": str(uuid.uuid4()),
                    "candidate_id": nami["id"],
                    "recruiter_id": recruiter_id,
                    "status": "matched",
                    "fit_score": 80,
                    "candidate_notes": "job_id:a3703bae-4349-4d2c-9300-1145b5e2fd4e",
                    "recruiter_notes": "Selected & Hired",
                }
            ).execute()
            print("Seeded Nami negotiation successfully.")
    except Exception as e:
        print(f"Skipping Nami seeding due to auth/email confirmation settings: {e}")

    # 5. Usopp (QA Tester)
    try:
        usopp = create_or_get_candidate(
            "Usopp",
            "QA Tester",
            ["Selenium", "Jest", "Cypress"],
            11000,
            "usopp_sniper@gmail.com",
        )
        u_neg = (
            db.table("negotiations")
            .select("*")
            .eq("candidate_id", usopp["id"])
            .eq("recruiter_id", recruiter_id)
            .execute()
        )
        if not u_neg.data:
            db.table("negotiations").insert(
                {
                    "id": str(uuid.uuid4()),
                    "candidate_id": usopp["id"],
                    "recruiter_id": recruiter_id,
                    "status": "rejected",
                    "fit_score": 45,
                    "candidate_notes": "job_id:93aa7533-52ad-462c-820a-ee3a707a5fbe",
                    "recruiter_notes": "Passed",
                }
            ).execute()
            print("Seeded Usopp negotiation successfully.")
    except Exception as e:
        print(f"Skipping Usopp seeding due to auth/email confirmation settings: {e}")

    # 6. Chopper (Data Intern)
    try:
        chopper = create_or_get_candidate(
            "Chopper",
            "Data Intern",
            ["Python", "Pandas", "SQL"],
            12000,
            "chopper_doctor@gmail.com",
        )
        ch_neg = (
            db.table("negotiations")
            .select("*")
            .eq("candidate_id", chopper["id"])
            .eq("recruiter_id", recruiter_id)
            .execute()
        )
        if not ch_neg.data:
            db.table("negotiations").insert(
                {
                    "id": str(uuid.uuid4()),
                    "candidate_id": chopper["id"],
                    "recruiter_id": recruiter_id,
                    "status": "active",
                    "fit_score": 70,
                    "candidate_notes": "job_id:2c593449-fcd0-4597-9342-79ef88edd385 paused",
                    "recruiter_notes": "Manual takeover active",
                }
            ).execute()
            print("Seeded Chopper negotiation successfully.")
    except Exception as e:
        print(f"Skipping Chopper seeding due to auth/email confirmation settings: {e}")

    # Clean up auth session back to clean state
    try:
        db.auth.sign_out()
    except Exception:
        pass

    print("\n--- Seeding Completed Successfully ---")


if __name__ == "__main__":
    main()
