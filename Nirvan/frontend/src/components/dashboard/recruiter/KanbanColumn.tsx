"use client";

import React from "react";
import CandidateCard from "./CandidateCard";

interface KanbanColumnProps {
  colId: string;
  title: string;
  icon: string;
  cards: any[];
  colTheme: Record<string, { border: string; bg: string; text: string; accent: string; indicator: string }>;
  draggedOverCol: string | null;
  triggeringAgentId: string | null;
  isSubmitting: Record<string, boolean>;
  takeoverText: Record<string, string>;
  setTakeoverText: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onDragOver: (e: React.DragEvent, colId: string) => void;
  onDrop: (e: React.DragEvent, colId: string) => void;
  onDragStart: (e: React.DragEvent, cardId: string) => void;
  onCardClick: (card: any) => void;
  onStartAgent: (cardId: string) => void;
  onToggleTakeover: (cardId: string) => void;
  onSendCustomMessage: (cardId: string) => void;
}

export default function KanbanColumn({
  colId,
  title,
  icon,
  cards,
  colTheme,
  draggedOverCol,
  triggeringAgentId,
  isSubmitting,
  takeoverText,
  setTakeoverText,
  onDragOver,
  onDrop,
  onDragStart,
  onCardClick,
  onStartAgent,
  onToggleTakeover,
  onSendCustomMessage,
}: KanbanColumnProps) {
  const isOver = draggedOverCol === colId;
  const theme = colTheme[colId];

  return (
    <div
      onDragOver={(e) => onDragOver(e, colId)}
      onDrop={(e) => onDrop(e, colId)}
      className={`flex flex-col min-w-[260px] md:min-w-0 rounded-2xl p-3 border transition-all duration-300 border-l-4 ${theme.border} ${theme.bg} ${
        isOver ? "ring-2 ring-accent/30 ring-dashed bg-accent/5 scale-[1.01]" : ""
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-card-border/80">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <h2 className={`font-semibold text-xs uppercase tracking-wider ${theme.text}`}>{title}</h2>
        </div>
        <span className="rounded-full bg-white border border-card-border text-[10px] font-bold px-2 py-0.5 text-muted shadow-sm">
          {cards.length}
        </span>
      </div>

      {/* Cards Container */}
      <div className="flex-1 space-y-3 min-h-[350px]">
        {cards.map((card) => (
          <CandidateCard
            key={card.id}
            card={card}
            colId={colId}
            colTheme={colTheme}
            triggeringAgentId={triggeringAgentId}
            isSubmitting={isSubmitting}
            takeoverText={takeoverText}
            setTakeoverText={setTakeoverText}
            onDragStart={onDragStart}
            onClick={() => onCardClick(card)}
            onStartAgent={onStartAgent}
            onToggleTakeover={onToggleTakeover}
            onSendCustomMessage={onSendCustomMessage}
          />
        ))}

        {cards.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 border border-dashed border-card-border/60 rounded-xl bg-white/20">
            <p className="text-[11px] text-muted/60">Empty stage</p>
          </div>
        )}
      </div>
    </div>
  );
}
