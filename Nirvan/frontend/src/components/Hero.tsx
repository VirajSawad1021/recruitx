"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

function AgentMessage({ text, role, delay }: { text: string; role: "candidate" | "recruiter"; delay: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const isCandidate = role === "candidate";

  return (
    <motion.div
      initial={false}
      animate={visible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 16, scale: 0.95 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={`flex ${isCandidate ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`max-w-[88%] rounded-2xl p-3.5 ${
          isCandidate
            ? "rounded-bl-sm bg-accent/5 border border-accent/10"
            : "rounded-br-sm bg-background border border-card-border"
        }`}
      >
        <p className={`text-xs leading-relaxed ${isCandidate ? "text-accent-dark font-medium" : "text-foreground"}`}>{text}</p>
        <p className={`mt-1.5 text-[10px] font-medium ${isCandidate ? "text-accent/40" : "text-muted/60"}`}>
          {isCandidate ? "Candidate Agent · You" : "Recruiter Agent · Stripe"}
        </p>
      </div>
    </motion.div>
  );
}

function TypingIndicator({ side }: { side: "left" | "right" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`flex items-center gap-2.5 px-1 py-2.5 ${side === "right" ? "justify-end" : ""}`}
    >
      <div className="flex items-center gap-1">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
      <span className="text-[11px] font-medium text-muted/60">Agent negotiating...</span>
    </motion.div>
  );
}

function ConfirmationBadge({ delay }: { delay: number }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-2 rounded-lg bg-accent/10 border border-accent/15 px-3 py-2"
    >
      <svg className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
      <span className="text-xs font-semibold text-accent-dark">Meeting booked · Pre-brief sent</span>
    </motion.div>
  );
}

function AnimatedHeading() {
  const words = "Where agents negotiate, so humans only meet when it matters".split(" ");

  return (
    <motion.h1
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.035, delayChildren: 0.3 } },
      }}
      className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-foreground"
    >
      {words.map((word, i) => {
        const isGradient = i >= 3;
        return (
          <motion.span
            key={i}
            variants={{
              hidden: { opacity: 0, y: 30, rotateX: -40, filter: "blur(6px)" },
              visible: {
                opacity: 1,
                y: 0,
                rotateX: 0,
                filter: "blur(0px)",
                transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
              },
            }}
            className={`inline-block ${isGradient ? "text-gradient" : ""}`}
          >
            {word}
            {i < words.length - 1 && "\u00A0"}
          </motion.span>
        );
      })}
    </motion.h1>
  );
}

const candidateMessages = [
  { text: "Remote: confirmed. Salary: looking at $95k–$110k. 3yrs Python verified on GitHub. Start: Aug 2026. Good alignment.", delay: 1400 },
  { text: "Appreciate the honesty — green flag. Strong mutual fit. Recommend scheduling.", delay: 5400 },
];

const recruiterMessages = [
  { text: "Hi — Senior Backend role, Series A, 12 engineers. Fully remote. Band: $85k–$105k. Worth a deeper look?", delay: 500 },
  { text: "We can work in that range. One thing to flag: Glassdoor mention of crunch during a launch — was one-time, not the norm.", delay: 3800 },
];

export default function Hero() {
  const [candidateRound, setCandidateRound] = useState(0);
  const [recruiterRound, setRecruiterRound] = useState(0);
  const [candidateTyping, setCandidateTyping] = useState(false);
  const [recruiterTyping, setRecruiterTyping] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    recruiterMessages.forEach((msg, i) => {
      timers.push(setTimeout(() => setRecruiterTyping(true), msg.delay - 300));
      timers.push(setTimeout(() => {
        setRecruiterTyping(false);
        setRecruiterRound(i + 1);
      }, msg.delay));
    });

    candidateMessages.forEach((msg, i) => {
      timers.push(setTimeout(() => setCandidateTyping(true), msg.delay - 300));
      timers.push(setTimeout(() => {
        setCandidateTyping(false);
        setCandidateRound(i + 1);
      }, msg.delay));
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  const showConfirmation = candidateRound >= candidateMessages.length;
  const showScore = recruiterRound >= recruiterMessages.length && candidateRound >= candidateMessages.length;

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-white to-subtle">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 -top-32 h-[700px] w-[700px] rounded-full bg-accent/4 blur-[180px] animate-breathe" />
        <div className="absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full bg-accent-gradient/4 blur-[160px] animate-breathe" style={{ animationDelay: "2.5s" }} />
        <div className="absolute -left-32 bottom-32 h-[500px] w-[500px] rounded-full bg-accent/3 blur-[140px] animate-breathe" style={{ animationDelay: "4s" }} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-32 lg:pt-40">
        <div className="mx-auto max-w-4xl text-center">


          <AnimatedHeading />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg"
          >
            Your AI agent handles the negotiation. Verifies skills from your GitHub.
            Checks calendar availability. Books the meeting. Briefs you beforehand.
            You just show up.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <a
              href="/auth"
              className="group relative overflow-hidden rounded-lg bg-foreground px-8 py-3 text-sm font-semibold text-white transition-all hover:scale-105 shadow-lg hover:shadow-xl shadow-black/10"
            >
              <span className="relative z-10">Start for free</span>
              <span className="absolute inset-0 bg-gradient-to-r from-accent to-accent-gradient opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </a>
            <a
              href="#how-it-works"
              className="rounded-lg border border-card-border bg-white/60 backdrop-blur-sm px-8 py-3 text-sm font-semibold text-foreground transition-all hover:border-accent/30 hover:bg-accent/5 hover:shadow-md"
            >
              How it works &nbsp;→
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto mt-24 max-w-5xl"
        >
          <div className="shadow-glow absolute -inset-4 rounded-3xl opacity-60" />

          <div className="relative rounded-2xl border border-card-border bg-white/80 backdrop-blur-xl p-1 shadow-xl shadow-black/[0.03]">
            <div className="flex items-center gap-2 border-b border-card-border bg-subtle/70 px-5 py-3 rounded-t-2xl">
              <motion.span
                className="h-3 w-3 rounded-full bg-red-400/80"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.span
                className="h-3 w-3 rounded-full bg-yellow-400/80"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, delay: 0.3, repeat: Infinity }}
              />
              <motion.span
                className="h-3 w-3 rounded-full bg-green-400/80"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, delay: 0.6, repeat: Infinity }}
              />
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5 }}
                className="ml-4 rounded-md border border-card-border bg-white/80 backdrop-blur-sm px-3 py-1 text-xs font-medium text-muted"
              >
                nirvan.app — Live Agent Negotiation
              </motion.span>
            </div>

            <div className="grid grid-cols-5 divide-x divide-card-border/60">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="col-span-2 space-y-4 p-5"
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.4, type: "spring", stiffness: 200 }}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent"
                  >
                    Y
                  </motion.div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Your Agent</p>
                    <p className="text-xs text-muted/70">Representing you</p>
                  </div>
                </div>

                <div className="space-y-3 min-h-[200px]">
                  {candidateMessages.slice(0, candidateRound).map((msg, i) => (
                    <AgentMessage key={i} text={msg.text} role="candidate" delay={0} />
                  ))}
                  {candidateTyping && <TypingIndicator side="left" />}
                  {showConfirmation && <ConfirmationBadge delay={0} />}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4, duration: 0.6 }}
                className="col-span-2 space-y-4 p-5"
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.6, type: "spring", stiffness: 200 }}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-gradient text-xs font-bold text-white"
                  >
                    R
                  </motion.div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Recruiter Agent</p>
                    <p className="text-xs text-muted/70">Representing Stripe</p>
                  </div>
                </div>

                <div className="space-y-3 min-h-[200px]">
                  {recruiterMessages.slice(0, recruiterRound).map((msg, i) => (
                    <AgentMessage key={i} text={msg.text} role="recruiter" delay={0} />
                  ))}
                  {recruiterTyping && <TypingIndicator side="right" />}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.8, duration: 0.5 }}
                className="space-y-4 bg-background/50 p-5"
              >
                <h4 className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">Fit Score</h4>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: showScore ? 1 : 0 }}
                  transition={{ duration: 0.5, type: "spring", stiffness: 180, damping: 12 }}
                  className="flex flex-col items-center"
                >
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: showScore ? 1 : 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl font-bold text-gradient"
                  >
                    92%
                  </motion.span>
                  <span className="text-xs text-muted/70 mt-0.5">Strong match</span>
                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-card-border/60">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: showScore ? "92%" : "0%" }}
                      transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full bg-gradient-to-r from-accent to-accent-gradient"
                    />
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: showScore ? 1 : 0, y: showScore ? 0 : 10 }}
                  transition={{ delay: 0.8 }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <svg className="h-3.5 w-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className="text-muted/80">Dealbreakers cleared</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <svg className="h-3.5 w-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className="text-muted/80">Skills verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <svg className="h-3.5 w-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className="text-muted/80">Salary aligned</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
