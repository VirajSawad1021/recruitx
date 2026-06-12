"use client";

import { createClient } from "@/lib/supabase-client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Negotiation = {
  id: string;
  status: string;
  fit_score: number | null;
  created_at: string;
  candidate: { title: string; salary_min: number }[] | null;
};

const monthlyData = [
  { month: "Jan", matches: 0, interviews: 0 },
  { month: "Feb", matches: 0, interviews: 0 },
  { month: "Mar", matches: 0, interviews: 0 },
  { month: "Apr", matches: 0, interviews: 0 },
  { month: "May", matches: 0, interviews: 0 },
  { month: "Jun", matches: 0, interviews: 0 },
];

export default function RecruiterAnalytics() {
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      const { data: recruiter } = await supabase.from("recruiters").select("id").eq("profile_id", user.id).single();
      if (recruiter) {
        const { data: negoData } = await supabase
          .from("negotiations")
          .select("id, status, fit_score, created_at, candidate:candidates(title, salary_min)")
          .eq("recruiter_id", recruiter.id)
          .order("created_at", { ascending: false });
        if (negoData && negoData.length > 0) {
          setNegotiations(negoData);
        }
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" /></div>;

  if (negotiations.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-card-border bg-white p-12 text-center max-w-xl mx-auto mt-8 shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
          <svg className="h-7 w-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-foreground">No Live Candidates Yet</h3>
        <p className="mt-2 text-xs text-muted max-w-sm mx-auto leading-relaxed">
          Your pipeline analytics will populate once your recruiter agent matches and begins negotiating with candidates. Post a job or activate your recruiter agent to start matching!
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/dashboard/recruiter/jobs/new" className="rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent/90 transition-all shadow-sm">
            Create Job posting &rarr;
          </Link>
          <Link href="/dashboard/recruiter/settings" className="rounded-lg bg-white border border-card-border px-4 py-2 text-xs font-semibold text-muted hover:text-foreground transition-all shadow-sm">
            Activate Agent Settings
          </Link>
        </div>
      </div>
    );
  }

  const maxMonthly = Math.max(...monthlyData.map((d) => Math.max(d.matches, d.interviews)), 1);
  const avgFit = negotiations.length ? Math.round(negotiations.reduce((a, n) => a + (n.fit_score || 0), 0) / negotiations.length) : 0;
  const acceptanceRate = negotiations.length ? Math.round((negotiations.filter((n) => n.status === "scheduled" || n.status === "completed").length / negotiations.length) * 100) : 0;
  const avgSalary = negotiations.length ? Math.round(negotiations.reduce((a, n) => a + (n.candidate?.[0]?.salary_min || 0), 0) / negotiations.length) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-5">
        <div className="rounded-xl border border-card-border bg-white p-5 shadow-sm">
          <p className="text-xs text-muted mb-1">Total Candidates</p>
          <p className="text-2xl font-semibold text-foreground">{negotiations.length}</p>
        </div>
        <div className="rounded-xl border border-card-border bg-white p-5 shadow-sm">
          <p className="text-xs text-muted mb-1">Avg Fit Score</p>
          <p className="text-2xl font-semibold text-foreground">{avgFit}%</p>
        </div>
        <div className="rounded-xl border border-card-border bg-white p-5 shadow-sm">
          <p className="text-xs text-muted mb-1">Acceptance Rate</p>
          <p className="text-2xl font-semibold text-foreground">{acceptanceRate}%</p>
        </div>
        <div className="rounded-xl border border-card-border bg-white p-5 shadow-sm">
          <p className="text-xs text-muted mb-1">Avg Salary Min</p>
          <p className="text-2xl font-semibold text-foreground">${avgSalary.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="rounded-xl border border-card-border bg-white shadow-sm">
          <div className="border-b border-card-border px-6 py-4">
            <h2 className="text-sm font-semibold text-foreground">Monthly Pipeline Growth</h2>
          </div>
          <div className="p-6">
            <div className="flex items-end gap-3 h-52">
              {monthlyData.map((d) => (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="flex gap-1.5 w-full items-end justify-center" style={{ height: "100%" }}>
                    <div className="w-4 rounded-t-sm bg-accent/70 transition-all" style={{ height: `${(d.matches / maxMonthly) * 100}%` }} />
                    <div className="w-4 rounded-t-sm bg-accent/30 transition-all" style={{ height: `${(d.interviews / maxMonthly) * 100}%` }} />
                  </div>
                  <span className="text-[10px] text-muted mt-1">{d.month}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-card-border/60">
              <div className="flex items-center gap-2"><div className="h-2.5 w-2.5 rounded-sm bg-accent/70" /><span className="text-xs text-muted">Matches</span></div>
              <div className="flex items-center gap-2"><div className="h-2.5 w-2.5 rounded-sm bg-accent/30" /><span className="text-xs text-muted">Interviews</span></div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-card-border bg-white shadow-sm">
          <div className="border-b border-card-border px-6 py-4">
            <h2 className="text-sm font-semibold text-foreground">Candidate Fit Scores</h2>
          </div>
          <div className="p-6 space-y-4">
            {negotiations.map((n) => (
              <div key={n.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-foreground">{n.candidate?.[0]?.title || "Candidate"}</span>
                  <span className="text-sm font-semibold text-foreground">{n.fit_score || 0}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${(n.fit_score || 0) >= 70 ? "bg-green-500" : (n.fit_score || 0) >= 50 ? "bg-yellow-500" : "bg-red-400"}`} style={{ width: `${n.fit_score || 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-card-border bg-white shadow-sm p-6">
        <h2 className="text-sm font-semibold text-foreground mb-5">Pipeline Status Distribution</h2>
        <div className="grid grid-cols-5 gap-4">
          {["active", "matched", "scheduled", "completed", "rejected"].map((status) => {
            const count = negotiations.filter((n) => n.status === status).length;
            const pct = negotiations.length ? Math.round((count / negotiations.length) * 100) : 0;
            return (
              <div key={status} className="text-center">
                <div className="relative h-24 w-full rounded-lg bg-gray-100 overflow-hidden flex items-end justify-center">
                  <div className={`w-full transition-all rounded-t-sm ${
                    status === "active" ? "bg-blue-500" : status === "matched" ? "bg-green-500" : status === "scheduled" ? "bg-purple-500" : status === "completed" ? "bg-gray-400" : "bg-red-400"
                  }`} style={{ height: `${pct}%` }} />
                </div>
                <p className="text-xs font-medium text-foreground mt-2 capitalize">{status}</p>
                <p className="text-xs text-muted">{count} ({pct}%)</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
