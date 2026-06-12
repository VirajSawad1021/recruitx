"use client";

import React from "react";
import Link from "next/link";
import SteeringDock from "./SteeringDock";

interface PlaybackDrawerProps {
  selectedCard: any | null;
  drawerTab: "playback" | "insights";
  setDrawerTab: (tab: "playback" | "insights") => void;
  messages: any[];
  loading: boolean;
  onClose: () => void;
  onSteer: (instruction: string) => Promise<void>;
  isSteering?: boolean;
}

export default function PlaybackDrawer({
  selectedCard,
  drawerTab,
  setDrawerTab,
  messages,
  loading,
  onClose,
  onSteer,
  isSteering = false,
}: PlaybackDrawerProps) {
  if (!selectedCard) return null;

  const isMock = String(selectedCard.id).startsWith("kb-");

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer Wrapper */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white/95 backdrop-blur-2xl border-l border-slate-200/80 shadow-2xl transition-all duration-500 transform translate-x-0 flex flex-col h-full overflow-hidden animate-slide-in">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎬</span>
              <h2 className="text-lg font-bold text-slate-800">
                A2A Negotiation Playback
              </h2>
              <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent animate-pulse-subtle">
                Live Session
              </span>
            </div>
            <p className="text-xs text-muted">
              Reviewing AI negotiation for{" "}
              <strong className="text-slate-700">
                {selectedCard.candidate_name}
              </strong>{" "}
              &rarr;{" "}
              <span className="text-slate-600">{selectedCard.company}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all shadow-sm focus:outline-none"
          >
            ✕
          </button>
        </div>

        {/* Candidate Card Summary Row in Drawer */}
        <div className="px-6 py-4 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center font-bold text-accent">
              {selectedCard.candidate_name[0]}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Candidate Agent Fit
              </h4>
              <p className="text-xs text-muted">{selectedCard.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="block text-[10px] uppercase font-bold text-slate-400">
                Fit Score
              </span>
              <span className="text-sm font-black text-accent">
                {selectedCard.fit_score}%
              </span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] uppercase font-bold text-slate-400">
                Status
              </span>
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  selectedCard.status === "scheduled"
                    ? "bg-purple-100 text-purple-700 border border-purple-200"
                    : selectedCard.status === "active"
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : selectedCard.status === "matched"
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                {selectedCard.status === "scheduled"
                  ? "Interview Scheduled"
                  : selectedCard.status === "active"
                    ? "Active Dialogue"
                    : selectedCard.status === "matched"
                      ? "Selected & Hired"
                      : selectedCard.status === "sourcing"
                        ? "Sourcing Stage"
                        : "Process Finished"}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Selector Inside Drawer */}
        <div className="flex border-b border-slate-100 bg-slate-50/30 p-1 m-4 rounded-xl border">
          <button
            onClick={() => setDrawerTab("playback")}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              drawerTab === "playback"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            🎬 Playback Dialogue
          </button>
          <button
            onClick={() => setDrawerTab("insights")}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              drawerTab === "insights"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            📊 Decision Insights
          </button>
        </div>

        {/* Drawer Body Area */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 min-h-0 space-y-6">
          {drawerTab === "playback" ? (
            /* Dialogue Tab */
            <div className="space-y-6">
              {/* Inject Steering Dock right inside the dialogue section to give it premium dashboard utility */}
              {selectedCard.status === "active" && (
                <SteeringDock
                  negotiationId={selectedCard.id}
                  candidateName={selectedCard.candidate_name}
                  onSteer={onSteer}
                  isSteering={isSteering}
                />
              )}

              <div className="space-y-4">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  💬 Agent Dialogue Transcript:
                </span>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                    <p className="text-xs text-muted">
                      Reading backend agent archives...
                    </p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-20 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <span className="text-2xl">📭</span>
                    <p className="text-xs text-slate-500 font-medium mt-2">
                      No messages stored in pipeline database yet.
                    </p>
                    <p className="text-[10px] text-muted mt-1">
                      Activate the agent to initiate the first conversation.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-4">
                    {messages.map((msg, index) => {
                      const isSystem = msg.sender_role === "system";
                      const isRecruiter = msg.sender_role === "recruiter";

                      if (isSystem) {
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-center my-2"
                          >
                            <span className="text-center text-[10px] md:text-xs text-slate-500/80 bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200/50 shadow-sm max-w-[85%] italic">
                              {msg.content}
                            </span>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={index}
                          className={`flex flex-col space-y-1 ${
                            isRecruiter ? "items-end" : "items-start"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 px-1.5">
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider ${
                                isRecruiter
                                  ? "text-blue-600"
                                  : "text-purple-600"
                              }`}
                            >
                              {isRecruiter
                                ? `${selectedCard.company} Agent`
                                : `${selectedCard.candidate_name}'s Agent`}
                            </span>
                            <span className="text-[8px] text-slate-400">
                              {msg.created_at
                                ? new Date(msg.created_at).toLocaleTimeString(
                                    [],
                                    { hour: "2-digit", minute: "2-digit" },
                                  )
                                : "Now"}
                            </span>
                          </div>

                          <div
                            className={`p-3.5 text-xs text-slate-800 leading-relaxed shadow-sm rounded-2xl max-w-[85%] border transition-all ${
                              isRecruiter
                                ? "bg-blue-50/90 border-blue-100 rounded-tr-none hover:bg-blue-50"
                                : "bg-purple-50/90 border-purple-100 rounded-tl-none hover:bg-purple-50"
                            }`}
                          >
                            {/* Match highlights */}
                            {msg.content.includes("[AGREED]") ||
                            msg.content.includes("agreement reached") ? (
                              <div className="space-y-2">
                                <p>{msg.content.replace("[AGREED]", "")}</p>
                                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                                  🤝 AGREED TERMS LOCKED
                                </span>
                              </div>
                            ) : msg.content.includes("[IMPASSE]") ? (
                              <div className="space-y-2">
                                <p>{msg.content.replace("[IMPASSE]", "")}</p>
                                <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded border border-red-200">
                                  ⚠️ NEGOTIATION IMPASSE
                                </span>
                              </div>
                            ) : (
                              msg.content
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Insights Tab */
            <div className="space-y-6">
              {/* Mathematical Weights Visual Cards */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  📊 Fit Logic & Match Weights
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {/* Weight Card 1 */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                        <span>Dealbreakers</span>
                        <span className="text-slate-600 bg-slate-100 px-1 rounded">
                          30% wt
                        </span>
                      </div>
                      <p className="text-xs font-extrabold text-slate-800 mt-2">
                        Clear Pass
                      </p>
                    </div>
                    <div className="mt-3">
                      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: "100%" }}
                        />
                      </div>
                      <span className="text-[9px] font-bold text-emerald-600 mt-1 block">
                        100% Score (0 Triggered)
                      </span>
                    </div>
                  </div>

                  {/* Weight Card 2 */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                        <span>Skills Overlap</span>
                        <span className="text-slate-600 bg-slate-100 px-1 rounded">
                          25% wt
                        </span>
                      </div>
                      <p className="text-xs font-extrabold text-slate-800 mt-2">
                        {selectedCard.candidate_name === "Zoro"
                          ? "Strong Tech Match"
                          : selectedCard.candidate_name === "Sanji"
                            ? "Adequate Overlap"
                            : "Good Fit"}
                      </p>
                    </div>
                    <div className="mt-3">
                      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full ${
                            selectedCard.candidate_name === "Zoro"
                              ? "bg-emerald-500"
                              : "bg-amber-500"
                          }`}
                          style={{
                            width:
                              selectedCard.candidate_name === "Zoro"
                                ? "90%"
                                : "70%",
                          }}
                        />
                      </div>
                      <span className="text-[9px] font-bold text-slate-500 mt-1 block">
                        {selectedCard.candidate_name === "Zoro"
                          ? "90% Score (Go/gRPC)"
                          : selectedCard.candidate_name === "Sanji"
                            ? "70% Score (PyTorch)"
                            : "80% Score"}
                      </span>
                    </div>
                  </div>

                  {/* Weight Card 3 */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                        <span>Salary Overlap</span>
                        <span className="text-slate-600 bg-slate-100 px-1 rounded">
                          20% wt
                        </span>
                      </div>
                      <p className="text-xs font-extrabold text-slate-800 mt-2">
                        Budget Guardrail
                      </p>
                    </div>
                    <div className="mt-3">
                      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: "85%" }}
                        />
                      </div>
                      <span className="text-[9px] font-bold text-slate-500 mt-1 block">
                        85% Range Overlap
                      </span>
                    </div>
                  </div>

                  {/* Weight Card 4 */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                        <span>Priorities</span>
                        <span className="text-slate-600 bg-slate-100 px-1 rounded">
                          15% wt
                        </span>
                      </div>
                      <p className="text-xs font-extrabold text-slate-800 mt-2">
                        Remote Prefs
                      </p>
                    </div>
                    <div className="mt-3">
                      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: "95%" }}
                        />
                      </div>
                      <span className="text-[9px] font-bold text-slate-500 mt-1 block">
                        95% Aligned (Hybrid)
                      </span>
                    </div>
                  </div>

                  {/* Weight Card 5 */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-3 flex flex-col justify-between col-span-2 sm:col-span-1">
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                        <span>Culture Signals</span>
                        <span className="text-slate-600 bg-slate-100 px-1 rounded">
                          10% wt
                        </span>
                      </div>
                      <p className="text-xs font-extrabold text-slate-800 mt-2">
                        Growth Vector
                      </p>
                    </div>
                    <div className="mt-3">
                      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-indigo-500"
                          style={{ width: "80%" }}
                        />
                      </div>
                      <span className="text-[9px] font-bold text-slate-500 mt-1 block">
                        80% Core Values
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Math Explanation Graph/Visual */}
              <div className="rounded-xl bg-indigo-900 text-white p-4 space-y-2.5 shadow-md">
                <span className="text-[9px] font-extrabold uppercase bg-white/20 px-2 py-0.5 rounded tracking-wider font-semibold">
                  Behind-the-Scenes Math Formulas
                </span>
                <p className="text-xs leading-relaxed text-indigo-100/90 font-mono">
                  FitScore = (Dealbreaker * 0.30) + (SkillsMatch * 0.25) +
                  (SalaryOverlap * 0.20) + (PriorityAlignment * 0.15) +
                  (CultureSignals * 0.10)
                </p>
                <p className="text-[10px] text-indigo-200/80">
                  If any hard dealbreaker triggers (e.g. candidate salary
                  requirements exceed recruiter ceiling AND dealbreaker is set
                  to true), the Dealbreaker variable drops to 0, resulting in
                  automatic immediate impasse execution.
                </p>
              </div>

              {/* Audit Logs / Timeline of Compromises */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  📖 Playback Decision Timeline & Compromises
                </h3>

                <div className="relative border-l-2 border-slate-100 pl-4 space-y-4 ml-2">
                  {selectedCard.candidate_name === "Zoro" ? (
                    <>
                      <div className="relative">
                        <div className="absolute -left-[23px] mt-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
                        <h4 className="text-xs font-bold text-slate-800">
                          Must-Have Skill Verification Verified
                        </h4>
                        <p className="text-[10px] text-muted">
                          Zoro&apos;s agent verified Go and gRPC expertise
                          against repositories. Skills match score: 90%.
                        </p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-[23px] mt-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-indigo-500 shadow-sm" />
                        <h4 className="text-xs font-bold text-slate-800">
                          Salary Budget Concession Approved
                        </h4>
                        <p className="text-[10px] text-muted">
                          Recruiter&apos;s agent standard budget ceiling flexed
                          from $115k to $118k, protecting target ceiling
                          guardrails while securing peak match.
                        </p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-[23px] mt-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-purple-500 shadow-sm" />
                        <h4 className="text-xs font-bold text-slate-800">
                          Remote Policy Aligned
                        </h4>
                        <p className="text-[10px] text-muted">
                          Both agents aligned on hybrid remote scheduling (2
                          days remote onsite requirement) dynamically.
                        </p>
                      </div>
                    </>
                  ) : selectedCard.candidate_name === "Sanji" ? (
                    <>
                      <div className="relative">
                        <div className="absolute -left-[23px] mt-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
                        <h4 className="text-xs font-bold text-slate-800">
                          Skills Weight Evaluated
                        </h4>
                        <p className="text-[10px] text-muted">
                          Evaluated NLP & PyTorch project files. Standard match
                          met: 70%.
                        </p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-[23px] mt-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-indigo-500 shadow-sm" />
                        <h4 className="text-xs font-bold text-slate-800">
                          Salary Cap Negotiation Defended
                        </h4>
                        <p className="text-[10px] text-muted">
                          Recruiter agent stubborn threshold applied. Standard
                          budget cap of $95,000 defended, refusing further flex
                          under strict rules.
                        </p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-[23px] mt-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-purple-500 shadow-sm" />
                        <h4 className="text-xs font-bold text-slate-800">
                          Agreed Terms Validated
                        </h4>
                        <p className="text-[10px] text-muted">
                          Final compromise accepted by Candidate agent at
                          $95,000 with hybrid policy terms locked.
                        </p>
                      </div>
                    </>
                  ) : selectedCard.candidate_name === "Luffy" ? (
                    <>
                      <div className="relative">
                        <div className="absolute -left-[23px] mt-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
                        <h4 className="text-xs font-bold text-slate-800">
                          DevOps Scanned
                        </h4>
                        <p className="text-[10px] text-muted">
                          Scanned Docker & CI/CD expertise. Base target matched
                          completely.
                        </p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-[23px] mt-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-indigo-500 shadow-sm" />
                        <h4 className="text-xs font-bold text-slate-800">
                          Mentoring Allowance Flexed
                        </h4>
                        <p className="text-[10px] text-muted">
                          Recruiter agent added $1,000 learning budget
                          allowance, satisfying Candidate learning priorities.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="relative">
                        <div className="absolute -left-[23px] mt-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
                        <h4 className="text-xs font-bold text-slate-800">
                          Initial Match Scanned
                        </h4>
                        <p className="text-[10px] text-muted">
                          Baseline credentials scanned against recruiter job
                          description parameters.
                        </p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-[23px] mt-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-500 shadow-sm" />
                        <h4 className="text-xs font-bold text-slate-800">
                          Compensation Negotiation Initialized
                        </h4>
                        <p className="text-[10px] text-muted">
                          Active back-and-forth dialogue regarding base floor vs
                          target ceiling started by AI agents.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[10px] text-muted font-mono">
            Audit Log SHA-256: f4b8...e9a2
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
            >
              Close
            </button>
            <Link
              href={isMock ? "#" : `/negotiations/${selectedCard.id}`}
              onClick={onClose}
              className="rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent-dark transition-all shadow-sm"
            >
              {isMock ? "Unlock Audit Trail" : "Open Full Match Room"}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
