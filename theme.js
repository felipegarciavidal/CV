// theme.js — Theme de JSON Resume para Felipe
// Exporta render(resume) -> string HTML, siguiendo el contrato de JSON Resume.
// Compatible con `resumed` y con el build.mjs incluido (que también genera el PDF).

const PLACEHOLDER_AVATAR =
  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23b9b3a4'/%3E%3Ccircle cx='100' cy='80' r='36' fill='%23ffffff' opacity='0.9'/%3E%3Cpath d='M48 178c0-32 24-54 52-54s52 22 52 54z' fill='%23ffffff' opacity='0.9'/%3E%3C/svg%3E";

// --- helpers ---------------------------------------------------------------
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

const yr = (d) => (d ? String(d).slice(0, 4) : "");
const range = (start, end) => {
  const s = yr(start);
  const e = end ? yr(end) : "Actualidad";
  return s ? `${s} — ${e}` : e;
};

const ICONS = {
  github:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
  linkedin:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
  email:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
  cap:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1 2.5 3 6 3s6-2 6-3v-5"/></svg>',
  arrowUp:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>',
  download:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
};

// --- builders de cada bloque ----------------------------------------------
function socials(basics, klass) {
  const out = [];
  for (const p of basics.profiles || []) {
    const key = String(p.network || "").toLowerCase();
    if (ICONS[key]) {
      out.push(
        `<a href="${esc(p.url)}" target="_blank" rel="noopener" class="${klass}" aria-label="${esc(p.network)}">${ICONS[key]}</a>`
      );
    }
  }
  if (basics.email) {
    out.push(
      `<a href="mailto:${esc(basics.email)}" class="${klass}" aria-label="Email">${ICONS.email}</a>`
    );
  }
  return out.join("\n");
}

function educationMini(education) {
  if (!education.length) return "";
  const items = education
    .map((e) => {
      const degree = [e.studyType, e.area].filter(Boolean).join(" ");
      const sub = [e.institution, range(e.startDate, e.endDate)]
        .filter(Boolean)
        .join(" · ");
      return `
          <div class="edu-mini">
            ${ICONS.cap}
            <div class="edu-mini-text">
              <span class="edu-mini-degree">${esc(degree)}</span>
              <span class="edu-mini-sub">${esc(sub)}</span>
            </div>
          </div>`;
    })
    .join("");
  return `
        <div class="hero-edu">
          <span class="hero-edu-label">Formación</span>${items}
        </div>`;
}

function workTimeline(work) {
  return work
    .map((w, i) => {
      const company = [w.name, w.location].filter(Boolean).join(" · ");
      const highlights = (w.highlights || [])
        .map((h) => `<li>${esc(h)}</li>`)
        .join("\n            ");
      return `
      <div class="tl-item reveal" data-delay="${(i % 3) + 1}">
        <div class="tl-card glass">
          <p class="tl-date">${esc(range(w.startDate, w.endDate))}</p>
          <h3 class="tl-role">${esc(w.position)}</h3>
          <p class="tl-company">${esc(company)}</p>
          <ul class="tl-list">
            ${highlights}
          </ul>
        </div>
      </div>`;
    })
    .join("");
}

function skillsGrid(skills) {
  return skills
    .map((s, i) => {
      const tags = (s.keywords || [])
        .map((k) => `<span class="tag">${esc(k)}</span>`)
        .join("");
      return `
      <div class="skill-card glass reveal" data-delay="${(i % 2) + 1}">
        <p class="skill-cat-title">${esc(s.name)}</p>
        <div class="tags">${tags}</div>
      </div>`;
    })
    .join("");
}

// --- render principal ------------------------------------------------------
export function render(resume) {
  const b = resume.basics || {};
  const work = resume.work || [];
  const education = resume.education || [];
  const skills = resume.skills || [];
  const avatar = b.image || PLACEHOLDER_AVATAR;
  const lang = (resume.meta && resume.meta.language) || "es";

  return `<!DOCTYPE html>
<html lang="${esc(lang)}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(b.name || "CV")} · ${esc(b.label || "")}</title>
<style>
  :root {
    --bg-base: #f2efe7; --text: #18241d; --text-soft: #555f57; --text-faint: #8b938b;
    --accent: #2f6043; --accent-2: #a6815e; --accent-soft: rgba(47,96,67,.12);
    --glass-bg: rgba(255,255,255,.55); --glass-border: rgba(255,255,255,.75);
    --glass-shadow: 0 8px 32px rgba(40,70,50,.12), inset 0 1px 0 rgba(255,255,255,.6);
    --nav-bg: rgba(255,255,255,.55);
    --blob-1: rgba(47,96,67,.42); --blob-2: rgba(166,129,94,.40); --blob-3: rgba(90,140,100,.34);
    --glow: rgba(47,96,67,.40);
  }
  [data-theme="dark"] {
    --bg-base: #0a130d; --text: #e9e6db; --text-soft: #a7b0a3; --text-faint: #6c7468;
    --accent: #5fb084; --accent-2: #c8a37a; --accent-soft: rgba(95,176,132,.16);
    --glass-bg: rgba(255,255,255,.045); --glass-border: rgba(255,255,255,.10);
    --glass-shadow: 0 8px 32px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.08);
    --nav-bg: rgba(14,24,17,.55);
    --blob-1: rgba(95,176,132,.36); --blob-2: rgba(200,163,122,.32); --blob-3: rgba(70,150,110,.30);
    --glow: rgba(95,176,132,.45);
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background: var(--bg-base); color: var(--text); line-height: 1.65; -webkit-font-smoothing: antialiased;
    overflow-x: hidden; transition: background .5s ease, color .5s ease; }
  ::selection { background: var(--accent); color: #fff; }
  .wrap { max-width: 760px; margin: 0 auto; padding: 0 28px; position: relative; z-index: 2; }

  .bg-fx { position: fixed; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
  .blob { position: absolute; border-radius: 50%; filter: blur(70px); opacity: .9; will-change: transform; }
  .blob.b1 { width: 52vw; height: 52vw; top: -12vw; left: -8vw; background: radial-gradient(circle at 30% 30%, var(--blob-1), transparent 68%); animation: float1 18s ease-in-out infinite; }
  .blob.b2 { width: 46vw; height: 46vw; top: 32vh; right: -14vw; background: radial-gradient(circle at 50% 50%, var(--blob-2), transparent 66%); animation: float2 22s ease-in-out infinite; }
  .blob.b3 { width: 40vw; height: 40vw; bottom: -10vw; left: 22vw; background: radial-gradient(circle at 50% 50%, var(--blob-3), transparent 65%); animation: float3 26s ease-in-out infinite; }
  @keyframes float1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(6vw, 5vh) scale(1.12); } }
  @keyframes float2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-7vw, 4vh) scale(1.08); } }
  @keyframes float3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(4vw, -6vh) scale(1.15); } }
  .bg-veil { position: fixed; inset: 0; z-index: 1; pointer-events: none; background: radial-gradient(ellipse at 50% 0%, transparent 40%, var(--bg-base) 92%); opacity: .5; }

  .progress { position: fixed; top: 0; left: 0; height: 2px; width: 0%; background: linear-gradient(90deg, var(--accent), var(--accent-2)); box-shadow: 0 0 12px var(--glow); z-index: 200; transition: width .1s linear; }

  nav { position: fixed; top: 18px; left: 50%; transform: translateX(-50%); z-index: 100; border-radius: 999px;
    background: var(--nav-bg); backdrop-filter: saturate(180%) blur(20px); -webkit-backdrop-filter: saturate(180%) blur(20px);
    border: 1px solid var(--glass-border); box-shadow: var(--glass-shadow); transition: background .5s ease, border-color .5s ease; }
  .nav-inner { display: flex; align-items: center; gap: 4px; padding: 7px 8px; }
  .nav-logo { font-weight: 700; font-size: 15px; letter-spacing: -.01em; text-decoration: none; color: var(--text); padding: 6px 14px; margin-right: 2px; }
  .nav-logo span { color: var(--accent); text-shadow: 0 0 14px var(--glow); }
  .nav-links { display: flex; gap: 4px; align-items: center; }
  .nav-links a.menu-item { text-decoration: none; color: var(--text-soft); font-size: 14px; font-weight: 500; padding: 8px 16px; border-radius: 999px; transition: color .25s, background .25s, box-shadow .25s; }
  .nav-links a.menu-item:hover { color: var(--text); background: var(--accent-soft); }
  .nav-links a.menu-item.active { color: var(--accent); background: var(--accent-soft); box-shadow: inset 0 0 0 1px var(--accent-soft), 0 0 16px var(--glow); }
  @media (max-width: 640px) { .nav-links a.menu-item { display: none; } }
  .theme-toggle { background: transparent; border: none; border-radius: 999px; width: 38px; height: 38px; cursor: pointer; color: var(--text-soft); display: flex; align-items: center; justify-content: center; transition: all .25s; flex-shrink: 0; margin-left: 2px; }
  .theme-toggle:hover { color: var(--accent); background: var(--accent-soft); }
  .theme-toggle svg { width: 17px; height: 17px; }

  section { padding: 96px 0; position: relative; }
  .section-label { display: inline-block; font-size: 12px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; margin-bottom: 14px; background: linear-gradient(90deg, var(--accent), var(--accent-2)); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .section-title { font-size: 28px; font-weight: 700; letter-spacing: -.02em; margin-bottom: 34px; line-height: 1.2; }
  .glass { background: var(--glass-bg); border: 1px solid var(--glass-border); backdrop-filter: blur(16px) saturate(160%); -webkit-backdrop-filter: blur(16px) saturate(160%); box-shadow: var(--glass-shadow); border-radius: 16px; }

  #hero { min-height: 100vh; display: flex; align-items: center; padding-top: 130px; padding-bottom: 60px; }
  .hero-grid { display: flex; align-items: center; gap: 44px; }
  @media (max-width: 640px) { .hero-grid { flex-direction: column; align-items: flex-start; gap: 30px; } }
  .avatar { width: 190px; height: 190px; border-radius: 50%; flex-shrink: 0; padding: 5px; position: relative; background: linear-gradient(135deg, var(--accent), var(--accent-2)); box-shadow: 0 0 44px var(--glow); animation: avFloat 6s ease-in-out infinite; }
  @keyframes avFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
  .avatar img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block; border: 4px solid var(--bg-base); background: var(--glass-bg); }
  @media (max-width: 640px) { .avatar { width: 150px; height: 150px; } }
  .hero-eyebrow { font-size: 14px; font-weight: 600; margin-bottom: 16px; letter-spacing: .02em; background: linear-gradient(90deg, var(--accent), var(--accent-2)); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .hero-name { font-size: clamp(40px, 8vw, 62px); font-weight: 800; letter-spacing: -.04em; line-height: 1.0; margin-bottom: 18px; background: linear-gradient(120deg, var(--text) 30%, var(--accent) 75%, var(--accent-2)); -webkit-background-clip: text; background-clip: text; color: transparent; }
  [data-theme="dark"] .hero-name { filter: drop-shadow(0 0 26px var(--glow)); }
  .hero-role { font-size: clamp(18px, 3.6vw, 22px); color: var(--text-soft); font-weight: 500; margin-bottom: 22px; letter-spacing: -.01em; }
  .hero-intro { font-size: 16.5px; color: var(--text-soft); max-width: 520px; margin-bottom: 26px; }
  .hero-edu { margin-bottom: 30px; display: flex; flex-direction: column; gap: 11px; }
  .hero-edu-label { font-size: 12px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; background: linear-gradient(90deg, var(--accent), var(--accent-2)); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .edu-mini { display: flex; gap: 11px; align-items: flex-start; }
  .edu-mini > svg { width: 19px; height: 19px; color: var(--accent); flex-shrink: 0; margin-top: 2px; filter: drop-shadow(0 0 6px var(--glow)); }
  .edu-mini-text { display: flex; flex-direction: column; line-height: 1.35; }
  .edu-mini-degree { font-size: 14.5px; font-weight: 600; color: var(--text); }
  .edu-mini-sub { font-size: 13px; color: var(--text-soft); }
  .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; }
  .btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 22px; border-radius: 11px; font-size: 14.5px; font-weight: 600; text-decoration: none; cursor: pointer; transition: all .28s cubic-bezier(.16,1,.3,1); border: 1px solid transparent; }
  .btn-primary { background: linear-gradient(120deg, var(--accent), var(--accent-2)); color: #fff; box-shadow: 0 4px 20px var(--glow); }
  .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 10px 34px var(--glow); }
  .btn-ghost { background: var(--glass-bg); color: var(--text); border-color: var(--glass-border); backdrop-filter: blur(10px); }
  .btn-ghost:hover { border-color: var(--accent); color: var(--accent); transform: translateY(-3px); box-shadow: 0 0 22px var(--glow); }
  .btn svg { width: 17px; height: 17px; }
  .socials { display: flex; gap: 8px; }
  .social-icon { width: 44px; height: 44px; border-radius: 11px; background: var(--glass-bg); border: 1px solid var(--glass-border); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; color: var(--text-soft); transition: all .28s cubic-bezier(.16,1,.3,1); }
  .social-icon:hover { color: var(--accent); transform: translateY(-3px); box-shadow: 0 0 22px var(--glow); border-color: var(--accent); }
  .social-icon svg { width: 19px; height: 19px; }

  .timeline { position: relative; }
  .tl-item { position: relative; padding: 0 0 22px 30px; border-left: 2px solid var(--glass-border); }
  .tl-item:last-child { padding-bottom: 0; }
  .tl-item::before { content: ''; position: absolute; left: -7px; top: 4px; width: 12px; height: 12px; border-radius: 50%; background: linear-gradient(120deg, var(--accent), var(--accent-2)); box-shadow: 0 0 0 4px var(--bg-base), 0 0 16px var(--glow); }
  .tl-card { padding: 18px 20px; margin-bottom: 4px; transition: transform .3s ease, box-shadow .3s ease; }
  .tl-card:hover { transform: translateX(4px); }
  .tl-date { font-size: 13px; font-weight: 600; letter-spacing: .02em; margin-bottom: 4px; background: linear-gradient(90deg, var(--accent), var(--accent-2)); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .tl-role { font-size: 18px; font-weight: 700; letter-spacing: -.01em; }
  .tl-company { font-size: 15px; color: var(--text-soft); margin-bottom: 12px; font-weight: 500; }
  .tl-list { list-style: none; }
  .tl-list li { position: relative; padding-left: 18px; color: var(--text-soft); font-size: 15px; margin-bottom: 7px; }
  .tl-list li::before { content: '▹'; position: absolute; left: 0; color: var(--accent); }

  .skills-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media (max-width: 600px) { .skills-grid { grid-template-columns: 1fr; } }
  .skill-card { padding: 22px; transition: transform .3s ease, box-shadow .3s ease; }
  .skill-card:hover { transform: translateY(-4px); box-shadow: 0 12px 36px var(--glow); }
  .skill-cat-title { font-size: 14px; font-weight: 700; margin-bottom: 14px; color: var(--text); }
  .tags { display: flex; flex-wrap: wrap; gap: 8px; }
  .tag { font-size: 13px; font-weight: 500; padding: 6px 13px; background: var(--accent-soft); color: var(--accent); border: 1px solid transparent; border-radius: 8px; transition: all .25s; }
  .tag:hover { transform: translateY(-2px); border-color: var(--accent); box-shadow: 0 0 14px var(--glow); }

  footer { padding: 56px 0 40px; border-top: 1px solid var(--glass-border); color: var(--text-faint); font-size: 14px; position: relative; z-index: 2; }
  .footer-wrap { display: flex; flex-direction: column; align-items: center; gap: 28px; }
  .footer-bottom { width: 100%; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
  .footer-socials { display: flex; gap: 14px; }
  .footer-socials a { color: var(--text-faint); transition: color .25s; }
  .footer-socials a:hover { color: var(--accent); }
  .footer-socials svg { width: 18px; height: 18px; }

  .to-top { position: fixed; bottom: 28px; right: 28px; z-index: 150; width: 48px; height: 48px; border-radius: 50%; background: var(--glass-bg); border: 1px solid var(--glass-border); backdrop-filter: blur(14px) saturate(160%); -webkit-backdrop-filter: blur(14px) saturate(160%); box-shadow: var(--glass-shadow); color: var(--accent); cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0; transform: translateY(16px); pointer-events: none; transition: opacity .35s ease, transform .35s ease, box-shadow .25s ease; }
  .to-top.show { opacity: 1; transform: translateY(0); pointer-events: auto; }
  .to-top:hover { transform: translateY(-4px); box-shadow: 0 0 26px var(--glow); border-color: var(--accent); }
  .to-top svg { width: 20px; height: 20px; }

  .reveal { opacity: 0; transform: translateY(48px) scale(.97); filter: blur(6px); transition: opacity .8s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.16,1,.3,1), filter .8s cubic-bezier(.16,1,.3,1); }
  .reveal.visible { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
  .reveal[data-delay="1"] { transition-delay: .12s; }
  .reveal[data-delay="2"] { transition-delay: .24s; }
  .reveal[data-delay="3"] { transition-delay: .36s; }

  @media (prefers-reduced-motion: reduce) {
    .reveal { opacity: 1; transform: none; filter: none; }
    .blob, .avatar { animation: none; }
  }

  /* ---------- PDF / PRINT ---------- */
  @media print {
    @page { margin: 0; }
    body { background: #fff !important; color: #16231c !important; }
    .bg-fx, .bg-veil, .progress, nav, .to-top, .footer-wrap > .btn-ghost { display: none !important; }
    .blob, .avatar { animation: none !important; }
    .reveal { opacity: 1 !important; transform: none !important; filter: none !important; }
    section { padding: 16px 0 !important; page-break-inside: avoid; }
    #hero { min-height: auto !important; padding-top: 8px !important; padding-bottom: 8px !important; }
    .hero-grid { gap: 26px !important; }
    .avatar { box-shadow: none !important; }
    .glass { background: #f5f2ec !important; box-shadow: none !important; border: 1px solid #d9d3c5 !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
    .hero-name, .hero-eyebrow, .section-label, .tl-date, .edu-date, .hero-edu-label {
      background: none !important; -webkit-background-clip: border-box !important; background-clip: border-box !important;
      -webkit-text-fill-color: #2f6043 !important; color: #2f6043 !important; filter: none !important; }
    .hero-name { -webkit-text-fill-color: #16231c !important; color: #16231c !important; }
    .tag { box-shadow: none !important; }
    .tl-item::before { box-shadow: 0 0 0 4px #fff !important; }
    footer { border-color: #d9d3c5 !important; }
    a { color: #2f6043 !important; }
  }
</style>
</head>
<body>

<div class="progress" id="progress"></div>

<div class="bg-fx" id="bgfx">
  <div class="blob b1" data-depth="0.25"></div>
  <div class="blob b2" data-depth="0.45"></div>
  <div class="blob b3" data-depth="0.35"></div>
</div>
<div class="bg-veil"></div>

<nav>
  <div class="nav-inner">
    <a href="#hero" class="nav-logo">${esc((b.name || "CV").split(" ")[0])}<span>.</span></a>
    <div class="nav-links">
      <a href="#hero" class="menu-item">Inicio</a>
      <a href="#experience" class="menu-item">Experiencia</a>
      <a href="#skills" class="menu-item">Skills</a>
    </div>
    <button class="theme-toggle" id="themeToggle" aria-label="Cambiar tema">
      <svg id="iconMoon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      <svg id="iconSun" style="display:none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
    </button>
  </div>
</nav>

<section id="hero">
  <div class="wrap">
    <div class="hero-grid" id="heroContent">
      <div class="avatar-wrap reveal">
        <div class="avatar"><img src="${esc(avatar)}" alt="Foto de ${esc(b.name || "")}"></div>
      </div>
      <div class="hero-text reveal" data-delay="1">
        <p class="hero-eyebrow">Hola, soy</p>
        <h1 class="hero-name">${esc(b.name || "")}</h1>
        <p class="hero-role">${esc(b.label || "")}</p>
        <p class="hero-intro">${esc(b.summary || "")}</p>
${educationMini(education)}
        <div class="hero-actions">
          <a href="felipe-cv.pdf" class="btn btn-primary" download>${ICONS.download} Descargar CV</a>
          <div class="socials">
${socials(b, "social-icon")}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section id="experience">
  <div class="wrap">
    <div class="reveal">
      <p class="section-label">01 — Trayectoria</p>
      <h2 class="section-title">Experiencia profesional</h2>
    </div>
    <div class="timeline">
${workTimeline(work)}
    </div>
  </div>
</section>

<section id="skills">
  <div class="wrap">
    <div class="reveal">
      <p class="section-label">02 — Stack</p>
      <h2 class="section-title">Habilidades técnicas</h2>
    </div>
    <div class="skills-grid">
${skillsGrid(skills)}
    </div>
  </div>
</section>

<footer>
  <div class="wrap footer-wrap">
    <button class="btn btn-ghost" onclick="scrollTop()">${ICONS.arrowUp} Volver al inicio</button>
    <div class="footer-bottom">
      <span>© ${new Date().getFullYear()} ${esc((b.name || "").split(" ")[0])}. Hecho con cariño.</span>
      <div class="footer-socials">
${socials(b, "")}
      </div>
    </div>
  </div>
</footer>

<button class="to-top" id="toTop" aria-label="Volver al inicio" onclick="scrollTop()">${ICONS.arrowUp}</button>

<script>
  const themeToggle = document.getElementById('themeToggle');
  const iconMoon = document.getElementById('iconMoon');
  const iconSun = document.getElementById('iconSun');
  let dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    iconMoon.style.display = dark ? 'none' : 'block';
    iconSun.style.display = dark ? 'block' : 'none';
  }
  applyTheme();
  themeToggle.addEventListener('click', () => { dark = !dark; applyTheme(); });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
  }, { threshold: 0.14 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  const navLinks = [...document.querySelectorAll('.nav-links a.menu-item')];
  const spyIds = ['hero', 'experience', 'skills'];
  const spySections = spyIds.map(id => document.getElementById(id)).filter(Boolean);
  const spy = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  spySections.forEach(s => spy.observe(s));

  const blobs = [...document.querySelectorAll('.blob')];
  const heroContent = document.getElementById('heroContent');
  const progress = document.getElementById('progress');
  const toTop = document.getElementById('toTop');
  let scrollY = 0, mouseX = 0, mouseY = 0, ticking = false;
  function onScroll() { scrollY = window.scrollY; if (!ticking) { requestAnimationFrame(update); ticking = true; } }
  function onMouse(e) { mouseX = (e.clientX / window.innerWidth - 0.5); mouseY = (e.clientY / window.innerHeight - 0.5); if (!ticking) { requestAnimationFrame(update); ticking = true; } }
  function update() {
    blobs.forEach(b => { const depth = parseFloat(b.dataset.depth) || 0.3; const ty = scrollY * depth; const mx = mouseX * depth * 60; const my = mouseY * depth * 60; b.style.transform = 'translate(' + mx + 'px,' + (ty + my) + 'px)'; });
    if (heroContent) { heroContent.style.transform = 'translateY(' + (scrollY * 0.18) + 'px)'; heroContent.style.opacity = Math.max(0, 1 - scrollY / 600); }
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (docH > 0 ? (scrollY / docH) * 100 : 0) + '%';
    toTop.classList.toggle('show', scrollY > 480);
    ticking = false;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('mousemove', onMouse, { passive: true });
  update();
  function scrollTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
</script>

</body>
</html>`;
}

export default render;
