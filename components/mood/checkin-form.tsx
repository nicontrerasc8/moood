"use client";

import { useState, useEffect } from "react";

const moods = [
  {
    value: "very_good",
    label: "MUY BIEN",
    sublabel: "Radiante y lleno de energía",
    emoji: "😄",
    color: "#F5B942",
    bg: "linear-gradient(135deg, #FFF3C4 0%, #FFE082 100%)",
    pill: "#F5B942",
    glow: "rgba(245,185,66,0.35)",
    text: "#7A4A00",
    ring: "#F5B942",
  },
  {
    value: "good",
    label: "BIEN",
    sublabel: "Con buen ánimo y tranquilo",
    emoji: "😊",
    color: "#5BBD72",
    bg: "linear-gradient(135deg, #D4F5DC 0%, #A8E6B4 100%)",
    pill: "#5BBD72",
    glow: "rgba(91,189,114,0.35)",
    text: "#1B5E30",
    ring: "#5BBD72",
  },
  {
    value: "normal",
    label: "NORMAL",
    sublabel: "Ni bien ni mal, neutro",
    emoji: "😐",
    color: "#3BAFB2",
    bg: "linear-gradient(135deg, #D0F4F4 0%, #9DE4E6 100%)",
    pill: "#3BAFB2",
    glow: "rgba(59,175,178,0.35)",
    text: "#0D4B4D",
    ring: "#3BAFB2",
  },
  {
    value: "bad",
    label: "MAL",
    sublabel: "Me siento algo apagado",
    emoji: "😟",
    color: "#E8614F",
    bg: "linear-gradient(135deg, #FFE0DC 0%, #FFBDB5 100%)",
    pill: "#E8614F",
    glow: "rgba(232,97,79,0.35)",
    text: "#6A1E10",
    ring: "#E8614F",
  },
  {
    value: "very_bad",
    label: "MUY MAL",
    sublabel: "Difícil, necesito apoyo",
    emoji: "😢",
    color: "#9B72CC",
    bg: "linear-gradient(135deg, #EDE0FF 0%, #D5BAFF 100%)",
    pill: "#9B72CC",
    glow: "rgba(155,114,204,0.35)",
    text: "#3A1566",
    ring: "#9B72CC",
  },
] as const;

type MoodValue = (typeof moods)[number]["value"];

export function CheckinForm() {
  const [selected, setSelected] = useState<MoodValue | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedMood = moods.find((m) => m.value === selected) ?? null;

  function handleSubmit() {
    if (!selectedMood) return;
    setSubmitted(true);
  }

  function resetForm() {
    setSelected(null);
    setSubmitted(false);
  }

  if (submitted && selectedMood) {
    return (
      <div
        className="checkin-card confirmation-card"
        style={{ "--mood-color": selectedMood.color, "--mood-glow": selectedMood.glow } as React.CSSProperties}
      >
        <style>{styles}</style>
        <div className="confirm-inner">
          <div className="confirm-emoji-wrap">
            <span className="confirm-emoji">{selectedMood.emoji}</span>
            <div className="confirm-ring" />
            <div className="confirm-ring confirm-ring-2" />
          </div>
          <p className="confirm-title" style={{ color: selectedMood.text }}>
            ¡Anotado!
          </p>
          <p className="confirm-sub">
            Registraste que te sientes{" "}
            <strong style={{ color: selectedMood.color }}>{selectedMood.label.toLowerCase()}</strong> hoy.
          </p>
          <button type="button" onClick={resetForm} className="confirm-btn" style={{ background: selectedMood.color }}>
            Registrar de nuevo
          </button>
        </div>
      </div>
    );
  }

  // Get the active mood for the background tint
  const activeMood = hoveredIdx !== null ? moods[hoveredIdx] : selectedMood;

  return (
    <div
      className={`checkin-card main-card ${mounted ? "mounted" : ""}`}
      style={{
        "--mood-color": activeMood?.color ?? "#CBD5E1",
        "--mood-glow": activeMood?.glow ?? "rgba(203,213,225,0.2)",
        "--mood-bg": activeMood?.bg ?? "linear-gradient(135deg,#F8FAFC 0%,#F1F5F9 100%)",
      } as React.CSSProperties}
    >
      <style>{styles}</style>

      {/* Decorative background blob */}
      <div className="blob" />

      {/* Header */}
      <div className="card-header">
        <div className="badge-row">
          <span className="badge-dot" />
          <span className="badge-text">Check-In Diario</span>
        </div>
        <h2 className="card-title">¿Cómo te<br />sientes hoy?</h2>
        <p className="card-sub">Toca una opción y registra tu estado de ánimo.</p>
      </div>

      {/* Mood options */}
      <div className="moods-list">
        {moods.map((mood, idx) => {
          const isSelected = selected === mood.value;
          const isHovered = hoveredIdx === idx;
          return (
            <button
              key={mood.value}
              type="button"
              onClick={() => setSelected(mood.value)}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              aria-pressed={isSelected}
              className={`mood-btn ${isSelected ? "mood-selected" : ""}`}
              style={{
                "--btn-bg": mood.bg,
                "--btn-color": mood.color,
                "--btn-glow": mood.glow,
                "--btn-text": mood.text,
                "--btn-ring": mood.ring,
                animationDelay: `${idx * 60}ms`,
              } as React.CSSProperties}
            >
              <span className="mood-emoji-wrap">
                <span className="mood-emoji">{mood.emoji}</span>
              </span>
              <span className="mood-info">
                <span className="mood-label">{mood.label}</span>
                <span className="mood-sublabel">{mood.sublabel}</span>
              </span>
              <span className={`mood-check ${isSelected ? "visible" : ""}`}>
                <svg viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7l3.5 3.5 5.5-6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
          );
        })}
      </div>

      {/* Submit */}
      <div className="card-footer">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedMood}
          className={`submit-btn ${selectedMood ? "submit-active" : ""}`}
          style={{
            "--submit-color": selectedMood?.color ?? "#94A3B8",
            "--submit-glow": selectedMood?.glow ?? "rgba(148,163,184,0.3)",
          } as React.CSSProperties}
        >
          <span>Registrar estado</span>
          <svg viewBox="0 0 20 20" fill="none" className="submit-arrow">
            <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');

  .checkin-card {
    font-family: 'Sora', sans-serif;
    position: relative;
    width: 100%;
    max-width: 420px;
    margin: 0 auto;
    border-radius: 2.5rem;
    overflow: hidden;
    background: #FDFAF6;
    border: 1.5px solid rgba(0,0,0,0.07);
    box-shadow:
      0 2px 0 rgba(255,255,255,0.9) inset,
      0 30px 60px rgba(15,23,42,0.10),
      0 0 0 0px var(--mood-color);
    transition: box-shadow 0.4s ease;
  }

  .main-card.mounted {
    animation: cardReveal 0.55s cubic-bezier(0.22,1,0.36,1) both;
  }

  @keyframes cardReveal {
    from { opacity: 0; transform: translateY(18px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
  }

  /* Animated background blob */
  .blob {
    position: absolute;
    top: -80px;
    right: -80px;
    width: 280px;
    height: 280px;
    border-radius: 50%;
    background: var(--mood-bg, linear-gradient(135deg,#F8FAFC,#E2E8F0));
    opacity: 0.55;
    transition: background 0.5s ease, opacity 0.4s ease;
    filter: blur(48px);
    pointer-events: none;
    z-index: 0;
  }

  /* Header */
  .card-header {
    position: relative;
    z-index: 1;
    padding: 2rem 2rem 1.25rem;
  }

  .badge-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 1rem;
  }

  .badge-dot {
    display: block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--mood-color, #CBD5E1);
    transition: background 0.4s ease;
    box-shadow: 0 0 0 3px var(--mood-glow, transparent);
  }

  .badge-text {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #94A3B8;
  }

  .card-title {
    font-size: clamp(1.6rem, 5vw, 2rem);
    font-weight: 800;
    line-height: 1.2;
    color: #0F172A;
    margin: 0 0 0.6rem;
    letter-spacing: -0.02em;
  }

  .card-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.875rem;
    color: #64748B;
    margin: 0;
    line-height: 1.6;
  }

  /* Moods */
  .moods-list {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding: 0 1.25rem;
  }

  .mood-btn {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    padding: 0.75rem 1rem;
    border-radius: 1.25rem;
    border: 1.5px solid transparent;
    background: var(--btn-bg);
    cursor: pointer;
    text-align: left;
    transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1);
    position: relative;
    overflow: hidden;
    animation: slideIn 0.4s cubic-bezier(0.22,1,0.36,1) both;
    border-color: rgba(0,0,0,0.06);
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-14px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .mood-btn:hover {
    border-color: var(--btn-color);
    transform: translateX(4px);
    box-shadow: 4px 4px 0 var(--btn-glow);
    filter: brightness(1.04);
  }

  .mood-btn.mood-selected {
    border-color: var(--btn-color);
    transform: translateX(4px);
    box-shadow: 4px 4px 0 var(--btn-glow), 0 0 0 3px var(--btn-glow);
    filter: brightness(1.04);
  }

  .mood-emoji-wrap {
    position: relative;
    z-index: 1;
    flex-shrink: 0;
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: rgba(255,255,255,0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }

  .mood-btn:hover .mood-emoji-wrap,
  .mood-btn.mood-selected .mood-emoji-wrap {
    transform: scale(1.15) rotate(-5deg);
  }

  .mood-emoji {
    display: block;
    line-height: 1;
  }

  .mood-info {
    position: relative;
    z-index: 1;
    flex: 1;
    min-width: 0;
  }

  .mood-label {
    display: block;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.14em;
    color: var(--btn-text);
  }

  .mood-sublabel {
    display: block;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.75rem;
    color: var(--btn-text);
    opacity: 0.6;
    margin-top: 2px;
  }

  .mood-check {
    position: relative;
    z-index: 1;
    flex-shrink: 0;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: var(--btn-color);
    display: flex;
    align-items: center;
    justify-content: center;
    transform: scale(0) rotate(-90deg);
    opacity: 0;
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s;
  }

  .mood-check.visible {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }

  .mood-check svg {
    width: 14px;
    height: 14px;
  }

  /* Footer */
  .card-footer {
    position: relative;
    z-index: 1;
    padding: 1.25rem 1.25rem 1.75rem;
  }

  .submit-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 1rem 1.5rem;
    border-radius: 1.35rem;
    border: none;
    font-family: 'Sora', sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    cursor: pointer;
    background: #E2E8F0;
    color: #94A3B8;
    transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
    box-shadow: none;
  }

  .submit-btn.submit-active {
    background: var(--submit-color);
    color: white;
    box-shadow:
      0 10px 30px var(--submit-glow),
      0 4px 0 rgba(0,0,0,0.12);
    transform: translateY(-1px);
  }

  .submit-btn.submit-active:hover {
    transform: translateY(-3px);
    box-shadow:
      0 16px 36px var(--submit-glow),
      0 4px 0 rgba(0,0,0,0.12);
  }

  .submit-btn.submit-active:active {
    transform: translateY(0px);
    box-shadow: 0 4px 0 rgba(0,0,0,0.12);
  }

  .submit-arrow {
    width: 18px;
    height: 18px;
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }

  .submit-btn.submit-active:hover .submit-arrow {
    transform: translateX(3px);
  }

  /* Confirmation */
  .confirmation-card {
    padding: 3rem 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 420px;
    background: #FDFAF6;
  }

  .confirm-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    text-align: center;
    animation: cardReveal 0.5s cubic-bezier(0.22,1,0.36,1) both;
  }

  .confirm-emoji-wrap {
    position: relative;
    width: 90px;
    height: 90px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.5rem;
  }

  .confirm-emoji {
    font-size: 52px;
    line-height: 1;
    position: relative;
    z-index: 2;
    animation: popIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both 0.15s;
  }

  @keyframes popIn {
    from { transform: scale(0.4) rotate(-20deg); opacity: 0; }
    to   { transform: scale(1) rotate(0); opacity: 1; }
  }

  .confirm-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid var(--mood-color);
    opacity: 0.3;
    animation: ringPulse 2s ease-in-out infinite;
  }

  .confirm-ring-2 {
    inset: -10px;
    opacity: 0.15;
    animation-delay: 0.5s;
  }

  @keyframes ringPulse {
    0%, 100% { transform: scale(1); opacity: 0.25; }
    50%       { transform: scale(1.1); opacity: 0.05; }
  }

  .confirm-title {
    font-size: 1.75rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin: 0;
  }

  .confirm-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    color: #64748B;
    margin: 0;
    max-width: 240px;
    line-height: 1.65;
  }

  .confirm-btn {
    margin-top: 0.5rem;
    padding: 0.75rem 1.75rem;
    border-radius: 999px;
    border: none;
    font-family: 'Sora', sans-serif;
    font-size: 0.82rem;
    font-weight: 700;
    color: white;
    cursor: pointer;
    letter-spacing: 0.04em;
    transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
    box-shadow: 0 6px 20px var(--mood-glow);
  }

  .confirm-btn:hover {
    transform: translateY(-2px) scale(1.04);
    box-shadow: 0 10px 28px var(--mood-glow);
  }
`;