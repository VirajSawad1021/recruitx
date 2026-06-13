"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

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
    <motion.div
      layout
      draggable
      onDragStart={(e) => onDragStart(e as any, card.id)}
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`group relative rounded-xl border border-slate-200 bg-white p-4.5 shadow-sm hover:shadow-md hover:border-accent/30 transition-all duration-300 cursor-grab active:cursor-grabbing ${
        card.is_paused ? "ring-1 ring-amber-500/30 bg-amber-50/[0.04]" : ""
      }`}
    >
      {/* Top row: Score tag & Drag handle dots */}
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-1 rounded-full border border-accent/25 bg-gradient-to-r from-accent/[0.08] to-accent-gradient/[0.08] px-2.5 py-0.5 text-[10px] font-bold text-accent shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          Fit Score: {card.fit_score}%
        </span>
        <span className="opacity-0 group-hover:opacity-40 transition-opacity text-slate-400 font-mono text-sm cursor-move select-none">
          ⠿
        </span>
      </div>

      {/* Candidate Profile Details (Premium Layout with Initial Letter Badge) */}
      <div className="flex items-center gap-3 mb-3.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 text-sm font-bold text-accent border border-accent/15 group-hover:scale-105 transition-transform duration-300">
          {card.candidate_name?.[0] || "?"}
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-xs.5 text-slate-800 flex items-center gap-1.5 truncate">
            {card.candidate_name}
            {card.is_paused && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
            )}
          </h3>
          <p className="text-xs text-muted truncate mt-0.5">
            {card.title} at <span className="text-slate-800 font-medium">{card.company}</span>
          </p>
        </div>
      </div>

      {/* Dynamic Body Info matching columns */}
      {colId === "active" && (
        <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-muted space-y-1.5">
          {card.is_paused ? (
            <div className="flex items-center gap-1.5 text-amber-600 font-semibold bg-amber-50/70 border border-amber-100/50 rounded-lg px-2.5 py-1">
              ⏸️ Takeover Mode Active
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-blue-600 font-medium bg-blue-50/60 border border-blue-100/50 rounded-lg px-2.5 py-1 animate-pulse-subtle">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping" />
              <span>AI Negotiator Active</span>
            </div>
          )}
          {card.last_message && (
            <p className="text-slate-500 text-[10px] leading-relaxed line-clamp-2 px-1">
              &ldquo;{card.last_message}&rdquo;
            </p>
          )}
        </div>
      )}

      {colId === "scheduled" && card.meeting_time && (
        <div className="mt-3 pt-3 border-t border-slate-100 text-[11px]">
          <span className="block text-slate-400 text-[9px] uppercase font-bold tracking-wider mb-1">📅 Interview Set:</span>
          <p className="font-semibold text-purple-700 bg-purple-50/70 rounded-lg px-2.5 py-1.5 border border-purple-100">
            {card.meeting_time}
          </p>
        </div>
      )}

      {colId === "matched" && (
        <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] flex justify-between items-center">
          <span className="text-slate-400 font-medium">Agreed Salary:</span>
          <span className="font-bold text-emerald-700 bg-emerald-50/70 px-2.5 py-0.8 rounded-lg border border-emerald-100">
            {card.salary || "$14,000"}
          </span>
        </div>
      )}

      {colId === "rejected" && (
        <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] flex justify-between items-center text-red-600">
          <span className="text-slate-400 font-medium">Outcome:</span>
          <span className="font-bold bg-rose-50 px-2.5 py-0.8 rounded-lg border border-rose-100 text-rose-700">
            {card.reason || "Rejected"}
          </span>
        </div>
      )}

      {/* Skill capsules list */}
      {card.skills && card.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {card.skills.slice(0, 3).map((s: string) => (
            <span key={s} className="rounded-full bg-slate-50 border border-slate-200/50 px-2 py-0.5 text-[9px] font-medium text-slate-500">
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Active Call-To-Action Trigger Button */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        {colId === "sourcing" ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartAgent(card.id);
            }}
            disabled={triggeringAgentId === card.id}
            className="w-full rounded-lg bg-gradient-to-r from-accent to-accent-gradient text-[11px] font-bold text-white py-1.8 hover:opacity-95 disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
          >
            {triggeringAgentId === card.id ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                Initializing...
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
            className={`w-full rounded-lg text-[11px] font-bold py-1.8 transition-all shadow-sm flex items-center justify-center gap-1 border cursor-pointer ${
              card.is_paused
                ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-500"
                : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
            }`}
          >
            {card.is_paused ? "🔄 Resume Agent" : "🎮 Pause & Takeover"}
          </button>
        ) : (
          <Link
            href={isMock ? "#" : `/negotiations/${card.id}`}
            onClick={(e) => e.stopPropagation()}
            className="w-full text-center rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-[11px] font-bold text-slate-700 py-1.8 transition-all block shadow-sm"
          >
            {isMock ? "Review Deal" : "Open Chat Room →"}
          </Link>
        )}
      </div>

      {/* Interactive takeover response draft area */}
      {colId === "active" && card.is_paused && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-3.5 pt-3.5 border-t border-amber-200/60 bg-amber-50/[0.12] rounded-xl p-3 space-y-2.5 border border-amber-100/50"
        >
          <label className="flex items-center gap-1 text-[9px] font-bold text-amber-800 uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            Counteroffer to {card.candidate_name}:
          </label>
          <textarea
            value={takeoverText[card.id] || ""}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.stopPropagation();
              setTakeoverText((prev) => ({ ...prev, [card.id]: e.target.value }));
            }}
            placeholder="Type salary counter or steering message..."
            rows={2}
            className="w-full rounded-lg border border-amber-200 bg-white p-2.5 text-xs text-foreground placeholder:text-muted/40 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none shadow-inner"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSendCustomMessage(card.id);
            }}
            disabled={isSubmitting[card.id] || !takeoverText[card.id]?.trim()}
            className="w-full rounded-lg bg-amber-600 text-[10px] font-bold text-white py-1.8 hover:bg-amber-700 disabled:opacity-50 transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm"
          >
            {isSubmitting[card.id] ? "Transmitting..." : "🚀 Send & Resume AI Loop"}
          </button>
        </div>
      )}
    </motion.div>
  );
}
