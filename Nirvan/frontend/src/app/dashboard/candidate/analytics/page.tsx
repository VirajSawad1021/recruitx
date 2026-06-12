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
  recruiter: { company: string }[] | null;
};

const monthlyData = [
  { month: "Jan", matches: 0, interviews: 0 },
  { month: "Feb", matches: 0, interviews: 0 },
  { month: "Mar", matches: 0, interviews: 0 },
  { month: "Apr", matches: 0, interviews: 0 },
  { month: "May", matches: 0, interviews: 0 },
  { month: "Jun", matches: 0, interviews: 0 },
];

export default function CandidateAnalytics() {
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push("/auth"); return; }
        
        const { data: candidate } = await supabase.from("candidates").select("id").eq("profile_id", user.id).single();
        if (candidate) {
          const { data: negoData } = await supabase
            .from("negotiations")
            .select("id, status, fit_score, created_at, recruiter:recruiters(company)")
            .eq("candidate_id", candidate.id)
            .order("created_at", { ascending: false });
          if (negoData && negoData.length > 0) {
            setNegotiations(negoData);
          }
        }
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" /></div>;

  if (negotiations.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-card-border bg-white p-12 text-center max-w-xl mx-auto mt-8 shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
          <svg className="h-7 w-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v5.25c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 013 18.375v-5.25zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125v-9.75zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v14.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-foreground">No Live Matches Yet</h3>
        <p className="mt-2 text-xs text-muted max-w-sm mx-auto leading-relaxed">
          Your analytics will populate once your agent matches and initiates negotiations with recruiters. Make sure you activate your agent in settings!
        </p>
        <div className="mt-6">
          <Link href="/dashboard/candidate/settings" className="rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent/90 transition-all shadow-sm">
            Activate Agent in Settings &rarr;
          </Link>
        </div>
      </div>
    );
  }

  const maxMonthly = Math.max(...monthlyData.map((d) => Math.max(d.matches, d.interviews)), 1);
  const avgFit = negotiations.length ? Math.round(negotiations.reduce((a, n) => a + (n.fit_score || 0), 0) / negotiations.length) : 0;
  const successRate = negotiations.length ? Math.round((negotiations.filter((n) => n.status !== "rejected").length / negotiations.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-5">
        <div className="rounded-xl border border-card-border bg-white p-5 shadow-sm">
          <p className="text-xs text-muted mb-1">Total Matches</p>
          <p className="text-2xl font-semibold text-foreground">{negotiations.length}</p>
        </div>
        <div className="rounded-xl border border-card-border bg-white p-5 shadow-sm">
          <p className="text-xs text-muted mb-1">Avg Fit Score</p>
          <p className="text-2xl font-semibold text-foreground">{avgFit}%</p>
        </div>
        <div className="rounded-xl border border-card-border bg-white p-5 shadow-sm">
          <p className="text-xs text-muted mb-1">Success Rate</p>
          <p className="text-2xl font-semibold text-foreground">{successRate}%</p>
        </div>
        <div className="rounded-xl border border-card-border bg-white p-5 shadow-sm">
          <p className="text-xs text-muted mb-1">Interviews</p>
          <p className="text-2xl font-semibold text-foreground">{negotiations.filter((n) => n.status === "scheduled").length}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="rounded-xl border border-card-border bg-white shadow-sm">
          <div className="border-b border-card-border px-6 py-4">
            <h2 className="text-sm font-semibold text-foreground">Monthly Activity</h2>
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
            <h2 className="text-sm font-semibold text-foreground">Fit Score Breakdown</h2>
          </div>
          <div className="p-6 space-y-4">
            {negotiations.map((n) => (
              <div key={n.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-foreground">{n.recruiter?.[0]?.company || "Unknown"}</span>
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
        <h2 className="text-sm font-semibold text-foreground mb-5">Status Distribution</h2>
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
