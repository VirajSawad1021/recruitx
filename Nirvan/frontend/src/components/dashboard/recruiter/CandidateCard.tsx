"use client";

import React from "react";
import Link from "next/link";

interface CandidateCardProps {
  card: any;
  colId: string;
  colTheme: Record<string, { border: string; bg: string; text: string; accent: string; indicator: string }>;
  triggeringAgentId: string | null;
  isSubmitting: Record<string, boolean>;
  takeoverText: Record<string, string>;
  setTakeoverText: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onDragStart: (e: React.DragEvent, cardId: string) => void;
  onClick: () => void;
  onStartAgent: (cardId: string) => void;
  onToggleTakeover: (cardId: string) => void;
  onSendCustomMessage: (cardId: string) => void;
}

export default function CandidateCard({
  card,
  colId,
  colTheme,
  triggeringAgentId,
  isSubmitting,
  takeoverText,
  setTakeoverText,
  onDragStart,
  onClick,
  onStartAgent,
  onToggleTakeover,
  onSendCustomMessage,
}: CandidateCardProps) {
  const isMock = card.id.startsWith("kb-");

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, card.id)}
      onClick={onClick}
      className={`group relative rounded-xl border border-card-border bg-white p-4 shadow-sm hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-300 cursor-grab active:cursor-grabbing hover:border-accent/40 ${
        card.is_paused ? "ring-1 ring-amber-500/40 bg-amber-50/10" : ""
      }`}
    >
      {/* Fit score badge & Drag handle */}
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-accent px-1.5 py-0.5 bg-accent/5 rounded-full border border-accent/10">
          🎯 Fit: {card.fit_score}%
        </span>
        <span className="opacity-0 group-hover:opacity-60 transition-opacity text-xs cursor-move">
          ⠿
        </span>
      </div>

      {/* Candidate Information */}
      <div className="mb-3">
        <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
          {card.candidate_name}
          {card.is_paused && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          )}
        </h3>
        <p className="text-xs text-muted mt-0.5 font-medium">
          {card.title} at <span className="text-foreground">{card.company}</span>
        </p>
      </div>

      {/* Dynamic content inside cards depending on pipeline column */}
      {colId === "active" && (
        <div className="mt-2.5 pt-2.5 border-t border-gray-100 text-[11px] text-muted space-y-1">
          {card.is_paused ? (
            <div className="flex items-center gap-1 text-amber-600 font-semibold bg-amber-50 rounded px-1.5 py-0.5">
              ⏸️ Recruiter Takeover Active
            </div>
          ) : (
            <div className="flex items-center gap-1 text-blue-600 font-medium animate-pulse-subtle">
              <span>🤖 Agent:</span>
              <span className="truncate italic">Negotiating compensation...</span>
            </div>
          )}
          {card.last_message && (
            <p className="text-muted/70 text-[10px]">Last message: {card.last_message}</p>
          )}
        </div>
      )}

      {colId === "scheduled" && card.meeting_time && (
        <div className="mt-2.5 pt-2.5 border-t border-gray-100 text-[11px]">
          <span className="block text-muted text-[10px] uppercase font-bold tracking-wider">📅 Meeting Set:</span>
          <p className="font-semibold text-purple-700 mt-0.5 bg-purple-50 rounded px-2 py-1 border border-purple-100">
            {card.meeting_time}
          </p>
        </div>
      )}

      {colId === "matched" && (
        <div className="mt-2.5 pt-2.5 border-t border-gray-100 text-[11px] flex justify-between items-center">
          <span className="text-muted">Salary:</span>
          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
            {card.salary || "$14,000"}
          </span>
        </div>
      )}

      {colId === "rejected" && (
        <div className="mt-2.5 pt-2.5 border-t border-gray-100 text-[11px] flex justify-between items-center text-red-600">
          <span className="text-muted">Status:</span>
          <span className="font-bold bg-red-50 px-2 py-0.5 rounded border border-red-100">
            {card.reason || "Rejected"}
          </span>
        </div>
      )}

      {/* Skill badges list */}
      {card.skills && card.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {card.skills.slice(0, 3).map((s: string) => (
            <span key={s} className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px] font-medium text-muted">
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Interactive Trigger Buttons */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
        {colId === "sourcing" ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartAgent(card.id);
            }}
            disabled={triggeringAgentId === card.id}
            className="w-full rounded-lg bg-accent text-[11px] font-bold text-white py-1.5 hover:bg-accent-dark disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-1"
          >
            {triggeringAgentId === card.id ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                Starting...
              </>
            ) : (
              "⚡ Start Agent"
            )}
          </button>
        ) : colId === "active" ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleTakeover(card.id);
            }}
            className={`w-full rounded-lg text-[11px] font-bold py-1.5 transition-all shadow-sm flex items-center justify-center gap-1 border ${
              card.is_paused
                ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-500"
                : "bg-white hover:bg-gray-50 text-slate-700 border-gray-200"
            }`}
          >
            {card.is_paused ? "🔄 Resume Agent" : "🎮 Takeover"}
          </button>
        ) : (
          <Link
            href={isMock ? "#" : `/negotiations/${card.id}`}
            onClick={(e) => e.stopPropagation()}
            className="w-full text-center rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 text-[11px] font-bold text-slate-700 py-1.5 transition-all"
          >
            {isMock ? "View Details" : "Open Chat →"}
          </Link>
        )}
      </div>

      {/* Expandable Manual Takeover Typing box */}
      {colId === "active" && card.is_paused && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-3 pt-3 border-t border-amber-200/80 bg-amber-50/50 rounded-lg p-2.5 space-y-2"
        >
          <label className="block text-[10px] font-bold text-amber-800 uppercase tracking-wider">
            💬 Draft response to {card.candidate_name}:
          </label>
          <textarea
            value={takeoverText[card.id] || ""}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.stopPropagation();
              setTakeoverText((prev) => ({ ...prev, [card.id]: e.target.value }));
            }}
            placeholder="Type counteroffer or instructions here..."
            rows={2}
            className="w-full rounded-lg border border-amber-300 bg-white p-2 text-xs text-foreground placeholder:text-muted/40 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSendCustomMessage(card.id);
            }}
            disabled={isSubmitting[card.id] || !takeoverText[card.id]?.trim()}
            className="w-full rounded-lg bg-amber-600 text-[10px] font-bold text-white py-1.5 hover:bg-amber-700 disabled:opacity-50 transition-all flex items-center justify-center gap-1"
          >
            {isSubmitting[card.id] ? "Transmitting..." : "🚀 Send & Resume AI Loop"}
          </button>
        </div>
      )}
    </div>
  );
}
