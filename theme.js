// theme.js — Theme de JSON Resume (totalmente data-driven)
// Exporta render(resume) -> string HTML y pdfFilename(resume) -> nombre del PDF.
// Nada personal está hardcodeado: todo sale del resume.json. Los textos de
// interfaz tienen valores por defecto en español, sobreescribibles vía meta.labels.

const PLACEHOLDER_AVATAR =
  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23b9b3a4'/%3E%3Ccircle cx='100' cy='80' r='36' fill='%23ffffff' opacity='0.9'/%3E%3Cpath d='M48 178c0-32 24-54 52-54s52 22 52 54z' fill='%23ffffff' opacity='0.9'/%3E%3C/svg%3E";

// Textos de interfaz por defecto. Cualquiera puede sobreescribirlos en su
// resume.json mediante "meta": { "labels": { ... } } sin tocar este archivo.
const DEFAULT_LABELS = {
  eyebrow: "Hola, soy",
  download: "Descargar CV",
  themeToggle: "Cambiar tema",
  backToTop: "Volver al inicio",
  photoAlt: "Foto de",
  navHome: "Inicio",
  present: "Actualidad",
  sections: {
    work:         { nav: "Experiencia",   label: "Trayectoria",     title: "Experiencia profesional" },
    volunteer:    { nav: "Voluntariado",  label: "Voluntariado",    title: "Voluntariado" },
    education:    { nav: "Formación",     label: "Formación",       title: "Educación" },
    awards:       { nav: "Premios",       label: "Reconocimientos", title: "Premios y becas" },
    certificates: { nav: "Certificados",  label: "Certificaciones", title: "Certificados" },
    publications: { nav: "Publicaciones", label: "Investigación",   title: "Publicaciones" },
    skills:       { nav: "Skills",        label: "Stack",           title: "Habilidades técnicas" },
    languages:    { nav: "Idiomas",       label: "Idiomas",         title: "Idiomas" },
    interests:    { nav: "Intereses",     label: "Intereses",       title: "Intereses y aficiones" },
    references:   { nav: "Referencias",   label: "Referencias",     title: "Referencias" },
    projects:     { nav: "Proyectos",     label: "Proyectos",       title: "Proyectos" },
  },
};

function mergeLabels(def, over) {
  const out = { ...def, ...over };
  out.sections = { ...def.sections };
  for (const k of Object.keys((over && over.sections) || {})) {
    out.sections[k] = { ...(def.sections[k] || {}), ...over.sections[k] };
  }
  return out;
}

// --- helpers ---------------------------------------------------------------
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

const yr = (d) => (d ? String(d).slice(0, 4) : "");
// Meses abreviados (es). "YYYY-MM" -> "mmm. YYYY"; "YYYY" (sin mes) -> "YYYY".
const MONTHS_ES = ["ene.", "feb.", "mar.", "abr.", "may.", "jun.", "jul.", "ago.", "sep.", "oct.", "nov.", "dic."];
const fmtDate = (d) => {
  if (!d) return "";
  const m = String(d).match(/^(\d{4})-(\d{2})/);
  return m ? `${MONTHS_ES[+m[2] - 1]} ${m[1]}` : yr(d);
};
const range = (start, end, present) => {
  const s = fmtDate(start);
  const e = end ? fmtDate(end) : present;
  return s ? `${s} — ${e}` : e;
};
const pad2 = (n) => String(n).padStart(2, "0");
const linkOrText = (text, url) =>
  url
    ? `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(text)}</a>`
    : esc(text);

// Nombre del PDF derivado del nombre del resume.json (sin hardcodear nada).
export function pdfFilename(resume) {
  const name = ((resume.basics && resume.basics.name) || "cv").trim();
  const slug = name.replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, "_");
  return (slug || "cv") + ".pdf";
}

const ICONS = {
  github:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
  linkedin:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
  orcid:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947 0 .525-.422.947-.947.947-.525 0-.946-.422-.946-.947 0-.516.421-.947.946-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.025-5.325 5.025h-3.919V7.416zm1.444 1.303v7.444h2.297c3.272 0 4.022-2.484 4.022-3.722 0-2.016-1.284-3.722-4.097-3.722h-2.222z"/></svg>',
  email:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
  globe:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
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

// Tarjetas tipo "timeline" (work y volunteer comparten formato)
function timelineEntries(items, roleKey, orgKey, present) {
  return items
    .map((it, i) => {
      const company = [it[orgKey], it.location].filter(Boolean).join(" · ");
      const highlights = (it.highlights || [])
        .map((h) => `<li>${esc(h)}</li>`)
        .join("\n            ");
      return `
      <div class="tl-item reveal" data-delay="${(i % 3) + 1}">
        <div class="tl-card glass">
          <p class="tl-date">${esc(range(it.startDate, it.endDate, present))}</p>
          <h3 class="tl-role">${esc(it[roleKey] || "")}</h3>
          <p class="tl-company">${esc(company)}</p>
          ${it.summary ? `<p class="tl-summary">${esc(it.summary)}</p>` : ""}
          ${highlights ? `<ul class="tl-list">\n            ${highlights}\n          </ul>` : ""}
        </div>
      </div>`;
    })
    .join("");
}

// Tarjeta genérica: fecha (gradiente) + título (opcionalmente enlace) + subtítulo + texto
function infoCard(i, { date, title, url, sub, text }) {
  return `
    <div class="card glass reveal" data-delay="${(i % 2) + 1}">
      ${date ? `<p class="card-date">${esc(date)}</p>` : ""}
      <h3 class="card-title">${linkOrText(title || "", url)}</h3>
      ${sub ? `<p class="card-sub">${esc(sub)}</p>` : ""}
      ${text ? `<p class="card-text">${esc(text)}</p>` : ""}
    </div>`;
}

// Tarjeta tipo "categoría + etiquetas" (skills e interests comparten formato)
function tagCards(items) {
  return items
    .map((it, i) => {
      const tags = (it.keywords || [])
        .map((k) => `<span class="tag">${esc(k)}</span>`)
        .join("");
      return `
      <div class="skill-card glass reveal" data-delay="${(i % 2) + 1}">
        <p class="skill-cat-title">${esc(it.name)}</p>
        <div class="tags">${tags}</div>
      </div>`;
    })
    .join("");
}

function educationCards(items, present) {
  return items
    .map((e, i) =>
      infoCard(i, {
        date: range(e.startDate, e.endDate, present),
        title: [e.studyType, e.area].filter(Boolean).join(" en "),
        url: e.url,
        sub: e.institution,
      })
    )
    .join("");
}

function awardsCards(items) {
  return items
    .map((a, i) =>
      infoCard(i, { date: fmtDate(a.date), title: a.title, url: a.url, sub: a.awarder, text: a.summary })
    )
    .join("");
}

function certificatesCards(items) {
  return items
    .map((c, i) =>
      infoCard(i, { date: fmtDate(c.date), title: c.name, url: c.url, sub: c.issuer })
    )
    .join("");
}

function publicationsCards(items) {
  return items
    .map((p, i) =>
      infoCard(i, {
        date: [p.publisher, fmtDate(p.releaseDate)].filter(Boolean).join(" · "),
        title: p.name,
        url: p.url,
        text: p.summary,
      })
    )
    .join("");
}

function languagesGrid(items) {
  return items
    .map((l, i) => `
      <div class="lang-card glass reveal" data-delay="${(i % 2) + 1}">
        <span class="lang-icon">${ICONS.globe}</span>
        <span class="lang-text">
          <span class="lang-name">${esc(l.language)}</span>
          <span class="lang-fluency">${esc(l.fluency || "")}</span>
        </span>
      </div>`)
    .join("");
}

function referencesCards(items) {
  return items
    .map((r, i) => `
    <div class="card glass reveal" data-delay="${(i % 2) + 1}">
      <p class="ref-text">${esc(r.reference || "")}</p>
      <p class="ref-name">— ${esc(r.name || "")}</p>
    </div>`)
    .join("");
}

function projectsCards(items, present) {
  return items
    .map((p, i) => {
      const dateLine = p.startDate || p.endDate ? range(p.startDate, p.endDate, present) : p.type || "";
      const highlights = (p.highlights || []).map((h) => `<li>${esc(h)}</li>`).join("");
      const tags = (p.keywords || []).map((k) => `<span class="tag">${esc(k)}</span>`).join("");
      return `
    <div class="card glass reveal" data-delay="${(i % 2) + 1}">
      ${dateLine ? `<p class="card-date">${esc(dateLine)}</p>` : ""}
      <h3 class="card-title">${linkOrText(p.name || "", p.url)}</h3>
      ${p.description ? `<p class="card-text">${esc(p.description)}</p>` : ""}
      ${highlights ? `<ul class="tl-list">${highlights}</ul>` : ""}
      ${tags ? `<div class="tags">${tags}</div>` : ""}
    </div>`;
    })
    .join("");
}

// --- render principal ------------------------------------------------------
export function render(resume) {
  const b = resume.basics || {};
  const meta = resume.meta || {};
  const avatar = b.image || PLACEHOLDER_AVATAR;
  const lang = meta.language || "es";
  const L = mergeLabels(DEFAULT_LABELS, meta.labels || {});
  const pdfName = pdfFilename(resume);

  // Registro de TODAS las secciones del schema: a cada clave del resume.json le
  // corresponde un id de ancla y una función de render. Las etiquetas visibles
  // salen de L.sections[clave]. El ORDEN lo decide el orden de las claves en el
  // resume.json (JSON.parse lo conserva).
  const REGISTRY = {
    work:         { id: "experience",   body: (d) => `<div class="timeline">${timelineEntries(d, "position", "name", L.present)}</div>` },
    volunteer:    { id: "volunteer",    body: (d) => `<div class="timeline">${timelineEntries(d, "position", "organization", L.present)}</div>` },
    education:    { id: "education",     body: (d) => educationCards(d, L.present) },
    awards:       { id: "awards",        body: (d) => awardsCards(d) },
    certificates: { id: "certificates",  body: (d) => certificatesCards(d) },
    publications: { id: "publications",  body: (d) => publicationsCards(d) },
    skills:       { id: "skills",        body: (d) => `<div class="skills-grid">${tagCards(d)}</div>` },
    languages:    { id: "languages",     body: (d) => `<div class="lang-grid">${languagesGrid(d)}</div>` },
    interests:    { id: "interests",     body: (d) => `<div class="skills-grid">${tagCards(d)}</div>` },
    references:   { id: "references",    body: (d) => referencesCards(d) },
    projects:     { id: "projects",      body: (d) => projectsCards(d, L.present) },
  };

  const sectionDefs = Object.keys(resume)
    .map((key) => {
      const def = REGISTRY[key];
      const labels = L.sections[key];
      const data = resume[key];
      if (!def || !labels || !Array.isArray(data) || data.length === 0) return null;
      return { id: def.id, nav: labels.nav, label: labels.label, title: labels.title, body: def.body(data) };
    })
    .filter(Boolean);

  const navHtml = [`<a href="#hero" class="menu-item">${esc(L.navHome)}</a>`]
    .concat(sectionDefs.map((s) => `<a href="#${s.id}" class="menu-item">${esc(s.nav)}</a>`))
    .join("\n      ");

  const sectionsHtml = sectionDefs
    .map((s, idx) => `
<section id="${s.id}">
  <div class="wrap">
    <div class="reveal">
      <p class="section-label">${pad2(idx + 1)} — ${esc(s.label)}</p>
      <h2 class="section-title">${esc(s.title)}</h2>
    </div>
    ${s.body}
  </div>
</section>`)
    .join("\n");

  const spyIds = JSON.stringify(["hero", ...sectionDefs.map((s) => s.id)]);

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
  .wrap { max-width: 1080px; margin: 0 auto; padding: 0 32px; position: relative; z-index: 2; }

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

  nav { position: fixed; top: 18px; left: 50%; transform: translateX(-50%); z-index: 100; max-width: calc(100vw - 36px); border-radius: 999px;
    background: var(--nav-bg); backdrop-filter: saturate(180%) blur(20px); -webkit-backdrop-filter: saturate(180%) blur(20px);
    border: 1px solid var(--glass-border); box-shadow: var(--glass-shadow); transition: background .5s ease, border-color .5s ease; }
  .nav-inner { display: flex; align-items: center; padding: 7px 8px; overflow-x: auto; scrollbar-width: none; }
  .nav-inner::-webkit-scrollbar { display: none; }
  .nav-links { display: flex; gap: 2px; align-items: center; }
  .nav-links a.menu-item { text-decoration: none; color: var(--text-soft); font-size: 13.5px; font-weight: 500; padding: 8px 13px; border-radius: 999px; white-space: nowrap; transition: color .25s, background .25s, box-shadow .25s; }
  .nav-links a.menu-item:hover { color: var(--text); background: var(--accent-soft); }
  .nav-links a.menu-item.active { color: var(--accent); background: var(--accent-soft); box-shadow: inset 0 0 0 1px var(--accent-soft), 0 0 16px var(--glow); }
  @media (max-width: 900px) { nav { display: none; } }

  .theme-toggle { position: fixed; top: 18px; right: 18px; z-index: 101; width: 42px; height: 42px; border-radius: 50%;
    background: var(--nav-bg); border: 1px solid var(--glass-border);
    backdrop-filter: saturate(180%) blur(20px); -webkit-backdrop-filter: saturate(180%) blur(20px); box-shadow: var(--glass-shadow);
    color: var(--text-soft); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .25s; }
  .theme-toggle:hover { color: var(--accent); box-shadow: 0 0 18px var(--glow); border-color: var(--accent); transform: translateY(-1px); }
  .theme-toggle svg { width: 18px; height: 18px; }

  section { padding: 96px 0; position: relative; }
  .section-label { display: inline-block; font-size: 12px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; margin-bottom: 14px; background: linear-gradient(90deg, var(--accent), var(--accent-2)); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .section-title { font-size: 28px; font-weight: 700; letter-spacing: -.02em; margin-bottom: 34px; line-height: 1.2; }
  .glass { background: var(--glass-bg); border: 1px solid var(--glass-border); backdrop-filter: blur(16px) saturate(160%); -webkit-backdrop-filter: blur(16px) saturate(160%); box-shadow: var(--glass-shadow); border-radius: 16px; }

  #hero { min-height: 100vh; display: flex; align-items: center; padding-top: 130px; padding-bottom: 60px; }
  .hero-grid { display: flex; align-items: center; gap: 52px; }
  @media (max-width: 820px) { .hero-grid { flex-direction: column; align-items: flex-start; gap: 30px; } }
  .avatar { width: 200px; height: 200px; border-radius: 50%; flex-shrink: 0; padding: 5px; position: relative; background: linear-gradient(135deg, var(--accent), var(--accent-2)); box-shadow: 0 0 44px var(--glow); animation: avFloat 6s ease-in-out infinite; }
  @keyframes avFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
  .avatar img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block; border: 4px solid var(--bg-base); background: var(--glass-bg); }
  @media (max-width: 640px) { .avatar { width: 150px; height: 150px; } }
  .hero-text { min-width: 0; }
  .hero-eyebrow { font-size: 14px; font-weight: 600; margin-bottom: 16px; letter-spacing: .02em; background: linear-gradient(90deg, var(--accent), var(--accent-2)); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .hero-name { font-size: clamp(38px, 7.5vw, 60px); font-weight: 800; letter-spacing: -.04em; line-height: 1.0; margin-bottom: 18px; white-space: nowrap; background: linear-gradient(120deg, var(--text) 30%, var(--accent) 75%, var(--accent-2)); -webkit-background-clip: text; background-clip: text; color: transparent; }
  [data-theme="dark"] .hero-name { filter: drop-shadow(0 0 26px var(--glow)); }
  @media (max-width: 640px) { .hero-name { white-space: normal; } }
  .hero-role { font-size: clamp(18px, 3.6vw, 22px); color: var(--text-soft); font-weight: 500; margin-bottom: 22px; letter-spacing: -.01em; }
  .hero-intro { font-size: 16.5px; color: var(--text-soft); max-width: 600px; margin-bottom: 30px; }
  .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; }
  .btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 22px; border-radius: 11px; font-size: 14.5px; font-weight: 600; text-decoration: none; cursor: pointer; transition: all .28s cubic-bezier(.16,1,.3,1); border: 1px solid transparent; }
  .btn-primary { background: linear-gradient(120deg, var(--accent), var(--accent-2)); color: #fff; box-shadow: 0 4px 20px var(--glow); }
  .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 10px 34px var(--glow); }
  .btn svg { width: 17px; height: 17px; }
  .socials { display: flex; gap: 8px; }
  .social-icon { width: 44px; height: 44px; border-radius: 11px; background: var(--glass-bg); border: 1px solid var(--glass-border); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; color: var(--text-soft); transition: all .28s cubic-bezier(.16,1,.3,1); }
  .social-icon:hover { color: var(--accent); transform: translateY(-3px); box-shadow: 0 0 22px var(--glow); border-color: var(--accent); }
  .social-icon svg { width: 19px; height: 19px; }

  .card { padding: 22px 24px; margin-bottom: 16px; transition: transform .3s ease, box-shadow .3s ease; }
  .card:hover { transform: translateY(-4px); box-shadow: 0 12px 36px var(--glow); }
  .card:last-child { margin-bottom: 0; }
  .card-date { font-size: 13px; font-weight: 600; margin-bottom: 4px; background: linear-gradient(90deg, var(--accent), var(--accent-2)); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .card-title { font-size: 17px; font-weight: 700; letter-spacing: -.01em; }
  .card-title a { color: inherit; text-decoration: none; transition: color .25s; }
  .card-title a:hover { color: var(--accent); }
  .card-sub { font-size: 15px; color: var(--text-soft); margin-top: 2px; }
  .card-text { font-size: 14.5px; color: var(--text-soft); margin-top: 10px; line-height: 1.55; }
  .card .tl-list { margin-top: 10px; }
  .card .tags { margin-top: 12px; }
  .ref-text { font-size: 15px; color: var(--text-soft); font-style: italic; line-height: 1.6; }
  .ref-name { font-weight: 600; color: var(--text); margin-top: 10px; }

  .timeline { position: relative; }
  .tl-item { position: relative; padding: 0 0 22px 30px; border-left: 2px solid var(--glass-border); }
  .tl-item:last-child { padding-bottom: 0; }
  .tl-item::before { content: ''; position: absolute; left: -7px; top: 4px; width: 12px; height: 12px; border-radius: 50%; background: linear-gradient(120deg, var(--accent), var(--accent-2)); box-shadow: 0 0 0 4px var(--bg-base), 0 0 16px var(--glow); }
  .tl-card { padding: 20px 24px; margin-bottom: 4px; transition: transform .3s ease, box-shadow .3s ease; }
  .tl-card:hover { transform: translateX(4px); }
  .tl-date { font-size: 13px; font-weight: 600; letter-spacing: .02em; margin-bottom: 4px; background: linear-gradient(90deg, var(--accent), var(--accent-2)); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .tl-role { font-size: 18px; font-weight: 700; letter-spacing: -.01em; }
  .tl-company { font-size: 15px; color: var(--text-soft); margin-bottom: 12px; font-weight: 500; }
  .tl-summary { font-size: 15px; color: var(--text-soft); margin-bottom: 10px; }
  .tl-list { list-style: none; }
  .tl-list li { position: relative; padding-left: 18px; color: var(--text-soft); font-size: 15px; margin-bottom: 7px; }
  .tl-list li::before { content: '▹'; position: absolute; left: 0; color: var(--accent); }

  .skills-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  @media (max-width: 600px) { .skills-grid { grid-template-columns: 1fr; } }
  .skill-card { padding: 24px; transition: transform .3s ease, box-shadow .3s ease; }
  .skill-card:hover { transform: translateY(-4px); box-shadow: 0 12px 36px var(--glow); }
  .skill-cat-title { font-size: 14px; font-weight: 700; margin-bottom: 14px; color: var(--text); }
  .tags { display: flex; flex-wrap: wrap; gap: 8px; }
  .tag { font-size: 13px; font-weight: 500; padding: 6px 13px; background: var(--accent-soft); color: var(--accent); border: 1px solid transparent; border-radius: 8px; transition: all .25s; }
  .tag:hover { transform: translateY(-2px); border-color: var(--accent); box-shadow: 0 0 14px var(--glow); }

  .lang-grid { display: flex; flex-wrap: wrap; gap: 16px; }
  .lang-card { padding: 16px 22px; display: flex; align-items: center; gap: 13px; transition: transform .3s ease, box-shadow .3s ease; }
  .lang-card:hover { transform: translateY(-4px); box-shadow: 0 12px 36px var(--glow); }
  .lang-icon { color: var(--accent); display: flex; }
  .lang-icon svg { width: 20px; height: 20px; filter: drop-shadow(0 0 6px var(--glow)); }
  .lang-text { display: flex; flex-direction: column; line-height: 1.3; }
  .lang-name { font-weight: 700; font-size: 15.5px; }
  .lang-fluency { font-size: 13px; color: var(--text-soft); }

  footer { padding: 48px 0; border-top: 1px solid var(--glass-border); color: var(--text-faint); font-size: 14px; position: relative; z-index: 2; }
  .footer-bottom { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
  .footer-bottom > span { font-weight: 600; color: var(--text-soft); }
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

  @media print {
    @page { margin: 0; }
    body { background: #fff !important; color: #16231c !important; }
    .bg-fx, .bg-veil, .progress, nav, .theme-toggle, .to-top { display: none !important; }
    .blob, .avatar { animation: none !important; }
    .reveal { opacity: 1 !important; transform: none !important; filter: none !important; }
    section { padding: 16px 0 !important; page-break-inside: avoid; }
    #hero { min-height: auto !important; padding-top: 8px !important; padding-bottom: 8px !important; }
    .hero-name { white-space: normal !important; }
    .glass { background: #f5f2ec !important; box-shadow: none !important; border: 1px solid #d9d3c5 !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
    .hero-name, .hero-eyebrow, .section-label, .tl-date, .card-date {
      background: none !important; -webkit-background-clip: border-box !important; background-clip: border-box !important;
      -webkit-text-fill-color: #2f6043 !important; color: #2f6043 !important; filter: none !important; }
    .hero-name { -webkit-text-fill-color: #16231c !important; color: #16231c !important; }
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
    <div class="nav-links">
      ${navHtml}
    </div>
  </div>
</nav>

<button class="theme-toggle" id="themeToggle" aria-label="${esc(L.themeToggle)}">
  <svg id="iconMoon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
  <svg id="iconSun" style="display:none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
</button>

<section id="hero">
  <div class="wrap">
    <div class="hero-grid" id="heroContent">
      <div class="avatar-wrap reveal">
        <div class="avatar"><img src="${esc(avatar)}" alt="${esc(L.photoAlt)} ${esc(b.name || "")}"></div>
      </div>
      <div class="hero-text reveal" data-delay="1">
        <p class="hero-eyebrow">${esc(L.eyebrow)}</p>
        <h1 class="hero-name">${esc(b.name || "")}</h1>
        <p class="hero-role">${esc(b.label || "")}</p>
        <p class="hero-intro">${esc(b.summary || "")}</p>
        <div class="hero-actions">
          <a href="${esc(pdfName)}" class="btn btn-primary" download="${esc(pdfName)}">${ICONS.download} ${esc(L.download)}</a>
          <div class="socials">
${socials(b, "social-icon")}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
${sectionsHtml}

<footer>
  <div class="wrap footer-bottom">
    <span>${esc(b.name || "")}</span>
    <div class="footer-socials">
${socials(b, "")}
    </div>
  </div>
</footer>

<button class="to-top" id="toTop" aria-label="${esc(L.backToTop)}">${ICONS.arrowUp}</button>

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
  const spyIds = ${spyIds};
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
  const footerEl = document.querySelector('footer');

  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  let scrollY = 0, mouseX = 0, mouseY = 0, ticking = false;
  function onScroll() { scrollY = window.scrollY; if (!ticking) { requestAnimationFrame(update); ticking = true; } }
  function onMouse(e) { mouseX = (e.clientX / window.innerWidth - 0.5); mouseY = (e.clientY / window.innerHeight - 0.5); if (!ticking) { requestAnimationFrame(update); ticking = true; } }
  function update() {
    blobs.forEach(bl => { const depth = parseFloat(bl.dataset.depth) || 0.3; const ty = scrollY * depth; const mx = mouseX * depth * 60; const my = mouseY * depth * 60; bl.style.transform = 'translate(' + mx + 'px,' + (ty + my) + 'px)'; });
    if (heroContent) {
      if (window.innerWidth > 820) {
        heroContent.style.transform = 'translateY(' + (scrollY * 0.18) + 'px)';
        heroContent.style.opacity = Math.max(0, 1 - scrollY / 600);
      } else {
        heroContent.style.transform = '';
        heroContent.style.opacity = '';
      }
    }
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (docH > 0 ? (scrollY / docH) * 100 : 0) + '%';
    toTop.classList.toggle('show', scrollY > 480);
    if (footerEl) {
      const intrude = window.innerHeight - footerEl.getBoundingClientRect().top;
      toTop.style.bottom = (intrude > 0 ? 28 + intrude : 28) + 'px';
    }
    ticking = false;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('mousemove', onMouse, { passive: true });
  window.addEventListener('resize', update);
  update();
</script>

</body>
</html>`;
}

export default render;