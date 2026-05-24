"use client";

/**
 * POUR ME A DRINK — pourmeadrink.com
 * ====================================
 * Next.js App Router page component
 *
 * FILE STRUCTURE:
 * ───────────────
 * app/
 *   page.tsx          ← this file
 *   layout.tsx        ← see layout notes below
 *   globals.css       ← just a reset, fonts are loaded here via @font-face
 * public/
 *   fonts/
 *     AnteCF-Italic.otf
 *     AnteCF-Regular.otf
 *     Hultog-Italic.ttf
 *     Hultog.ttf
 *   images/
 *     cover.jpg
 *   audio/
 *     preview.mp3     ← drop in when ready
 */

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const SMART_LINK = "https://ffm.to/obi-pour-me-a-drink";
const INSTAGRAM = "https://instagram.com/obi";
const DROP_DATE = new Date("2025-06-12T00:00:00");
const PREVIEW_SECS = 30;

const WAVEFORM_HEIGHTS = [
  10, 18, 30, 24, 38, 14, 32, 10, 24, 36, 18, 28, 10, 38, 20, 26, 12, 34, 10,
  24, 32, 14, 22, 36, 10, 26, 16, 12, 30, 20,
];

const CHORUS_LINES = [
  "huh, yeah",
  "pour me a drink",
  "oh that's your man?",
  "who can't afford anything",
  "hmm",
  "thought this was love?",
  "this ain't no more than a fling",
  "go do me a big favour",
  "I'm tired of waiting",
  "do me a favour",
  "pour me a drink",
];

interface Credit {
  role: string;
  name: string;
}

const ARTIST_CREDITS: Credit[] = [
  { role: "Primary Artist", name: "Obi" },
  { role: "Featuring", name: "Promise Kadree" },
  { role: "Featuring", name: "Siah" },
];

const PRODUCTION_CREDITS: Credit[] = [
  { role: "Keyboards", name: "Dr. Leo Soul" },
  { role: "Electric Bass Guitar", name: "Chevelle Frazer-Rose" },
  { role: "Electric Guitar", name: "Sindhu Jamuna" },
  { role: "Tenor Saxophone", name: "Reuben Abela-Adeyemi" },
  { role: "Guest Vocals", name: "Sharone Kallinga" },
  { role: "Mixing & Mastering", name: "Reon Vangèr" },
];

const pad = (n: number) => String(Math.max(0, n)).padStart(2, "0");

// ─── HOOKS ───────────────────────────────────────────────────────────────────

function useCountdown(dropDate: Date) {
  const [state, setState] = useState({ d: "--", h: "--", m: "--", s: "--" });
  useEffect(() => {
    const tick = () => {
      const diff = dropDate.getTime() - Date.now();
      if (diff <= 0) {
        setState({ d: "00", h: "00", m: "00", s: "00" });
        return;
      }
      setState({
        d: pad(Math.floor(diff / 86400000)),
        h: pad(Math.floor((diff % 86400000) / 3600000)),
        m: pad(Math.floor((diff % 3600000) / 60000)),
        s: pad(Math.floor((diff % 60000) / 1000)),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [dropDate]);
  return state;
}

function useLyricCycle(lines: string[], interval = 1800) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setIdx((i) => (i + 1) % lines.length),
      interval,
    );
    return () => clearInterval(id);
  }, [lines.length, interval]);
  return idx;
}

function useScrollReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("in");
        }),
      { threshold: 0.08 },
    );
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

// ─── PREVIEW PLAYER ──────────────────────────────────────────────────────────

type PlayerState = "idle" | "playing" | "paused" | "done";

function PreviewPlayer() {
  const [state, setState] = useState<PlayerState>("idle");
  const [secs, setSecs] = useState(PREVIEW_SECS);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const intRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secsRef = useRef(PREVIEW_SECS);

  const startTimer = useCallback(() => {
    intRef.current = setInterval(() => {
      secsRef.current -= 1;
      const elapsed = PREVIEW_SECS - secsRef.current;
      setSecs(secsRef.current);
      setProgress((elapsed / PREVIEW_SECS) * 100);
      if (secsRef.current <= 0) {
        clearInterval(intRef.current!);
        setState("done");
        audioRef.current?.pause();
      }
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (intRef.current) {
      clearInterval(intRef.current);
      intRef.current = null;
    }
  }, []);

  const play = useCallback(() => {
    audioRef.current?.play().catch(() => {});
    startTimer();
    setState("playing");
  }, [startTimer]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    stopTimer();
    setState("paused");
  }, [stopTimer]);

  const restart = useCallback(() => {
    stopTimer();
    secsRef.current = PREVIEW_SECS;
    setSecs(PREVIEW_SECS);
    setProgress(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    setState("idle");
  }, [stopTimer]);

  useEffect(() => () => stopTimer(), [stopTimer]);

  const timerLabel = state === "done" ? "— done —" : `0:${pad(secs)}`;

  return (
    <div className="preview-player">
      <audio ref={audioRef} src="/audio/preview.mp3" preload="none" />

      {/* WAVEFORM */}
      <div className="waveform">
        {WAVEFORM_HEIGHTS.map((h, i) => (
          <div
            key={i}
            className={`bar${state === "playing" ? "" : " bar--still"}`}
            style={{ height: h, animationDelay: `${(i * 0.065).toFixed(2)}s` }}
          />
        ))}
      </div>

      {/* PROGRESS */}
      <div className="player-meta">
        <span className="player-time">{timerLabel}</span>
        <div className="prog-track">
          <div className="prog-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* CONTROLS */}
      <div className="player-controls">
        {state === "idle" && (
          <button className="ctrl-btn ctrl-btn--primary" onClick={play}>
            <span className="ctrl-dot" />
            <span>Hear a preview</span>
          </button>
        )}
        {state === "playing" && (
          <button className="ctrl-btn ctrl-btn--ghost" onClick={pause}>
            ⏸ Pause
          </button>
        )}
        {state === "paused" && (
          <>
            <button className="ctrl-btn ctrl-btn--primary" onClick={play}>
              ▶ Resume
            </button>
            <button className="ctrl-btn ctrl-btn--ghost" onClick={restart}>
              ↺ Restart
            </button>
          </>
        )}
        {state === "done" && (
          <button className="ctrl-btn ctrl-btn--ghost" onClick={restart}>
            ↺ Play again
          </button>
        )}
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function PourMeADrink() {
  const countdown = useCountdown(DROP_DATE);
  useScrollReveal();
  const lyricIdx = useLyricCycle(CHORUS_LINES);

  return (
    <>
      <style>{css}</style>

      {/* NAV */}
      <nav>
        <p className="nav-logo">Pour Me A Drink</p>
        <ul className="nav-links">
          <li>
            <a href="#stream">Listen</a>
          </li>
          <li>
            <a href="#lyrics">Lyrics</a>
          </li>
          <li>
            <a href="#credits">Credits</a>
          </li>
        </ul>
      </nav>

      {/* ── HERO ── */}
      <section id="hero">
        <div className="hero-left">
          <p className="hero-eyebrow">New Single — June 12, 2025</p>
          <h1 className="hero-title">
            pour me
            <br />a drink
          </h1>
          <p className="hero-artist">Obi</p>
          <div className="hero-stem" />
          <PreviewPlayer />
        </div>

        <div className="hero-right">
          <div className="ffm-embed hero-embed">
            <iframe
              src={SMART_LINK}
              width="100%"
              height="340"
              frameBorder="0"
              allow="autoplay"
              title="Pour Me A Drink — Pre-save & Stream"
            />
          </div>
        </div>
      </section>

      {/* ── STREAM / COUNTDOWN ── */}
      <section id="stream" className="sec sec--mid">
        <div className="sec-head reveal">
          <p className="sec-label">Out June 12</p>
          <h2 className="sec-title">Listen</h2>
        </div>

        <div className="countdown reveal">
          {(["d", "h", "m", "s"] as const).map((u) => (
            <div key={u} className="cd-box">
              <div className="cd-num">{countdown[u]}</div>
              <div className="cd-lbl">
                {{ d: "Days", h: "Hours", m: "Mins", s: "Secs" }[u]}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LYRICS ── */}
      <section id="lyrics" className="sec sec--paper">
        <div className="sec-head reveal">
          <p className="sec-label">A taste</p>
          <h2 className="sec-title">The words</h2>
        </div>

        <div className="lyric-block reveal">
          {CHORUS_LINES.map((line, i) => (
            <p
              key={i}
              className={[
                "lyric-line",
                i === lyricIdx ? "hi" : "",
                i === lyricIdx - 1 || i === lyricIdx + 1 ? "mid" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {line}
            </p>
          ))}
        </div>

        <p className="release-note reveal">June 12 — out everywhere</p>
      </section>

      {/* ── CREDITS ── */}
      <section id="credits" className="sec sec--mid">
        <div className="sec-head reveal">
          <p className="sec-label">The people</p>
          <h2 className="sec-title">Credits</h2>
        </div>

        <div className="credits-wrap reveal">
          <div className="credits-layout">
            <div className="credits-col">
              <p className="credits-col-title">Artists</p>
              {ARTIST_CREDITS.map((c) => (
                <div key={c.name} className="credit">
                  <p className="credit-role">{c.role}</p>
                  <p className="credit-name">{c.name}</p>
                </div>
              ))}
            </div>
            <div className="credits-col">
              <p className="credits-col-title">Musicians & Production</p>
              {PRODUCTION_CREDITS.map((c) => (
                <div key={c.name} className="credit">
                  <p className="credit-role">{c.role}</p>
                  <p className="credit-name">{c.name}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="credits-footer">
            <div>
              <p className="credit-role">Distribution</p>
              <p className="credit-name" style={{ fontSize: 15 }}>
                Apollo
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p className="credit-role">Label</p>
              <p className="credit-name" style={{ fontSize: 15 }}>
                LightWave
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <p className="footer-logo">Pour Me A Drink</p>
        <ul className="footer-links">
          <li>
            <a href="#stream">Listen</a>
          </li>
          <li>
            <a href="#lyrics">Lyrics</a>
          </li>
          <li>
            <a href="#credits">Credits</a>
          </li>
          <li>
            <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          </li>
        </ul>
        <p className="footer-copy">
          © 2025 Obi / LightWave · pourmeadrink.com · All rights reserved
        </p>
      </footer>
    </>
  );
}

// ─── CSS ─────────────────────────────────────────────────────────────────────

const css = `
@font-face {
  font-family: 'AnteCF';
  src: url('/fonts/AnteCF-Regular.otf') format('opentype');
  font-style: normal; font-weight: 400; font-display: swap;
}
@font-face {
  font-family: 'AnteCF';
  src: url('/fonts/AnteCF-Italic.otf') format('opentype');
  font-style: italic; font-weight: 400; font-display: swap;
}
@font-face {
  font-family: 'Hultog';
  src: url('/fonts/Hultog.ttf') format('truetype');
  font-style: normal; font-weight: 400; font-display: swap;
}
@font-face {
  font-family: 'Hultog';
  src: url('/fonts/Hultog-Italic.ttf') format('truetype');
  font-style: italic; font-weight: 400; font-display: swap;
}

*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

:root {
  --paper:      #F2EAE0;
  --paper-mid:  #E8DDD0;
  --paper-deep: #DDD0C0;
  --ink:        #140C08;
  --wine:       #6B1A2A;
  --wine-h:     #8B2A3A;
  --muted:      #8A7060;
  --border:     rgba(106,26,42,0.18);
  --border-s:   rgba(106,26,42,0.1);
}

html { scroll-behavior: smooth; }

body {
  background: var(--paper);
  color: var(--ink);
  font-family: 'Hultog', Georgia, serif;
  overflow-x: hidden;
}

/* grain */
body::after {
  content:''; position:fixed; inset:0; pointer-events:none; z-index:9000;
  opacity:0.04;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size:180px;
}

/* ── NAV ── */
nav {
  position:fixed; top:0; left:0; right:0; z-index:800;
  display:flex; justify-content:space-between; align-items:center;
  padding:18px 48px;
  background:linear-gradient(to bottom, rgba(242,234,224,0.97) 60%, transparent);
}
.nav-logo { font-family:'AnteCF',serif; font-style:italic; font-size:14px; color:var(--wine); }
.nav-links { display:flex; gap:28px; list-style:none; }
.nav-links a { font-family:'Hultog',serif; font-size:9px; letter-spacing:0.35em; text-transform:uppercase; color:var(--muted); text-decoration:none; transition:color 0.2s; }
.nav-links a:hover { color:var(--ink); }

/* ── HERO ── */
#hero {
  min-height:100vh;
  display:grid;
  grid-template-columns:1fr 1fr;
  align-items:center;
  padding:80px 48px 60px;
  gap:40px;
}

.hero-left { display:flex; flex-direction:column; gap:20px; }
.hero-eyebrow { font-family:'Hultog',serif; font-size:9px; letter-spacing:0.5em; color:var(--wine); text-transform:uppercase; opacity:0; animation:up 0.9s ease 0.1s forwards; }
.hero-title { font-family:'AnteCF',serif; font-style:italic; font-size:clamp(48px,6.5vw,92px); font-weight:400; line-height:0.88; color:var(--ink); opacity:0; animation:up 0.9s ease 0.25s forwards; }
.hero-artist { font-family:'Hultog',serif; font-size:9px; letter-spacing:0.5em; color:var(--muted); text-transform:uppercase; opacity:0; animation:up 0.8s ease 0.4s forwards; }
.hero-stem { width:1px; height:36px; background:linear-gradient(to bottom,var(--wine),transparent); opacity:0; animation:up 0.8s ease 0.5s forwards; }

.hero-right { display:flex; flex-direction:column; align-items:stretch; justify-content:center; gap:16px; opacity:0; animation:up 1s ease 0.4s forwards; }
.cover-img { width:100%; max-width:340px; height:auto; display:block; box-shadow:0 24px 64px rgba(20,12,8,0.22); align-self:center; }
.hero-embed { max-width:340px; align-self:center; }

/* ── PREVIEW PLAYER ── */
.preview-player { display:flex; flex-direction:column; gap:10px; opacity:0; animation:up 0.8s ease 0.6s forwards; }

.waveform { display:flex; align-items:center; gap:3px; height:32px; }
.bar { width:3px; border-radius:1px; background:var(--wine); animation:wav 1.2s ease-in-out infinite; }
.bar--still { animation:none !important; transform:scaleY(0.2) !important; opacity:0.2 !important; }

@keyframes wav {
  0%,100% { transform:scaleY(0.2); opacity:0.2; }
  50% { transform:scaleY(1); opacity:0.75; }
}

.player-meta { display:flex; align-items:center; gap:12px; }
.player-time { font-family:'Hultog',serif; font-size:10px; color:var(--muted); letter-spacing:0.1em; min-width:36px; }
.prog-track { width:120px; height:1px; background:var(--border); position:relative; }
.prog-fill { position:absolute; inset:0; background:var(--wine); width:0%; transition:width 1s linear; }

.player-controls { display:flex; gap:10px; flex-wrap:wrap; }

.ctrl-btn {
  display:inline-flex; align-items:center; gap:10px;
  padding:12px 28px;
  font-family:'Hultog',serif; font-size:9px; letter-spacing:0.3em; text-transform:uppercase;
  cursor:pointer; border:1px solid var(--wine); transition:all 0.25s; position:relative; overflow:hidden;
}
.ctrl-btn--primary { background:transparent; color:var(--ink); }
.ctrl-btn--primary::before { content:''; position:absolute; inset:0; background:var(--wine); transform:scaleX(0); transform-origin:left; transition:transform 0.3s ease; }
.ctrl-btn--primary:hover::before { transform:scaleX(1); }
.ctrl-btn--primary:hover { color:var(--paper); }
.ctrl-btn--primary > * { position:relative; z-index:1; }
.ctrl-btn--ghost { background:transparent; color:var(--wine); }
.ctrl-btn--ghost:hover { background:var(--wine); color:var(--paper); }

.ctrl-dot { width:7px; height:7px; border-radius:50%; background:var(--wine); flex-shrink:0; }
.ctrl-btn--primary:hover .ctrl-dot { background:var(--paper); }


/* ── SECTIONS ── */
.sec { width:100%; display:flex; flex-direction:column; align-items:center; padding:80px 48px; gap:40px; }
.sec--mid { background:var(--paper-mid); }
.sec--paper { background:var(--paper); }

.sec-head { display:flex; flex-direction:column; align-items:center; gap:8px; text-align:center; }
.sec-label { font-family:'Hultog',serif; font-size:8px; letter-spacing:0.55em; color:var(--wine); text-transform:uppercase; }
.sec-title { font-family:'AnteCF',serif; font-style:italic; font-size:clamp(28px,4.5vw,54px); font-weight:400; line-height:1; color:var(--ink); }

.reveal { opacity:0; transform:translateY(20px); transition:opacity 0.8s ease, transform 0.8s ease; }
.reveal.in { opacity:1; transform:none; }

/* ── COUNTDOWN ── */
.countdown { display:flex; border:1px solid var(--border); }
.cd-box { padding:20px 28px; text-align:center; border-right:1px solid var(--border); min-width:80px; }
.cd-box:last-child { border-right:none; }
.cd-num { font-family:'AnteCF',serif; font-size:36px; color:var(--ink); line-height:1; }
.cd-lbl { font-family:'Hultog',serif; font-size:8px; letter-spacing:0.3em; color:var(--muted); text-transform:uppercase; margin-top:4px; }

/* ── FFM EMBED ── */
.ffm-embed {
  width:100%;
  max-width:420px;
  border:1px solid var(--border);
  overflow:hidden;
  background:var(--paper);
}
.ffm-embed iframe { display:block; }

/* ── LYRICS ── */
.lyric-block { max-width:440px; width:100%; border-left:1px solid var(--wine); padding-left:24px; display:flex; flex-direction:column; gap:2px; }
.lyric-line { font-family:'Hultog',serif; font-size:clamp(13px,1.8vw,17px); color:var(--ink); line-height:1.65; opacity:0.18; transition:opacity 0.5s ease, color 0.5s ease; }
.lyric-line.hi { opacity:1; color:var(--wine); }
.lyric-line.mid { opacity:0.38; }
.release-note { font-family:'Hultog',serif; font-size:9px; letter-spacing:0.35em; text-transform:uppercase; color:var(--muted); }

/* ── CREDITS ── */
.credits-wrap { width:100%; max-width:700px; display:flex; flex-direction:column; }
.credits-layout { display:grid; grid-template-columns:1fr 1fr; border:1px solid var(--border); }
.credits-col { padding:36px; display:flex; flex-direction:column; gap:24px; border-right:1px solid var(--border); }
.credits-col:last-child { border-right:none; }
.credits-col-title { font-family:'Hultog',serif; font-size:8px; letter-spacing:0.5em; color:var(--wine); text-transform:uppercase; padding-bottom:14px; border-bottom:1px solid var(--border-s); }
.credit { display:flex; flex-direction:column; gap:3px; }
.credit-role { font-family:'Hultog',serif; font-size:8px; letter-spacing:0.35em; color:var(--muted); text-transform:uppercase; }
.credit-name { font-family:'AnteCF',serif; font-style:italic; font-size:16px; color:var(--ink); line-height:1.25; }
.credits-footer { padding:18px 36px; border:1px solid var(--border); border-top:none; display:flex; justify-content:space-between; align-items:center; }

/* ── FOOTER ── */
footer { background:var(--paper-deep); border-top:1px solid var(--border); padding:28px 48px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px; }
.footer-logo { font-family:'AnteCF',serif; font-style:italic; font-size:15px; color:var(--wine); }
.footer-links { display:flex; gap:22px; list-style:none; }
.footer-links a { font-family:'Hultog',serif; font-size:9px; letter-spacing:0.25em; text-transform:uppercase; color:var(--muted); text-decoration:none; transition:color 0.2s; }
.footer-links a:hover { color:var(--ink); }
.footer-copy { font-family:'Hultog',serif; font-size:9px; color:var(--muted); letter-spacing:0.08em; width:100%; text-align:center; padding-top:14px; border-top:1px solid var(--border-s); }

/* ── ANIMATIONS ── */
@keyframes up {
  from { opacity:0; transform:translateY(18px); }
  to   { opacity:1; transform:translateY(0); }
}

/* ── RESPONSIVE ── */
@media (max-width:768px) {
  nav { padding:16px 20px; }
  #hero { grid-template-columns:1fr; padding:80px 20px 48px; gap:32px; }
  .hero-left { align-items:center; text-align:center; }
  .ctrl-btn { align-self:center; }
  .hero-right { order:-1; }
  .cover-img { max-width:280px; }
  .hero-embed { max-width:100%; width:100%; }
  .sec { padding:60px 20px; gap:28px; }
  .credits-layout { grid-template-columns:1fr; }
  .credits-col { border-right:none; border-bottom:1px solid var(--border); }
  .credits-col:last-child { border-bottom:none; }
  .countdown { flex-wrap:wrap; }
  .cd-box { flex:1; min-width:64px; }
  footer { flex-direction:column; text-align:center; }
}
`;
