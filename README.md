# CV Online

CV de una sola página generado desde un único `resume.json`: produce **web** (tema propio, glassmorphism, claro/oscuro) y **PDF** a la vez. Basado en [JSON Resume](https://jsonresume.org/).

**Demo:** https://felipegarciavidal.github.io/CVO/

## Cómo funciona

`resume.json` es el dato. `build.mjs` genera dos salidas:

- la **web** con `theme.js` (`render(resume)` → HTML) → `dist/index.html`
- el **PDF** imprimiendo un tema de JSON Resume con Puppeteer → `dist/<Nombre>.pdf`

Editas el JSON y se actualizan ambos. `theme.js` cumple el contrato de JSON Resume, así que también es compatible con `resumed`.

## Estructura

```
resume.json                    # datos (única fuente de la verdad)
theme.js                       # tema de la web: render(resume) → HTML
build.mjs                      # build: web + PDF
.github/workflows/deploy.yml   # CI/CD a GitHub Pages
dist/                          # salida generada (no se versiona)
```

## Uso

Requiere Node 18+ (recomendado 20).

```bash
npm install
npm run build      # → dist/index.html y dist/<Nombre>.pdf
npx serve dist     # previsualizar
```

## Personalización

Todo lo personal vive en `resume.json` (sigue el [esquema de JSON Resume](https://jsonresume.org/schema/)); no hace falta tocar `theme.js`.

- **Secciones y orden:** se admiten las 11 del esquema. Solo se muestran las que tienen datos, y **el orden lo decide el orden de las claves en el JSON**.
- **Foto:** `basics.image` (URL o data URI).
- **Nombre del PDF:** se deriva de `basics.name`.
- **Idioma y textos:** por defecto en español, sobreescribibles vía `meta.language` y `meta.labels` (solo las claves que quieras cambiar):

```json
"meta": {
  "language": "en",
  "labels": { "eyebrow": "Hi, I'm", "download": "Download CV", "present": "Present" }
}
```

- **Tema del PDF:** `npm install jsonresume-theme-<x>` y cambia la constante `PDF_THEME` en `build.mjs`.
- **Paleta de la web:** variables CSS en `:root` / `[data-theme="dark"]` dentro de `theme.js`.

## Despliegue

GitHub Actions construye y publica en cada push a `main`. Basta con activar una vez **Settings → Pages → Source: GitHub Actions**. Queda en `https://<usuario>.github.io/<repo>/`.

## Créditos

[JSON Resume](https://jsonresume.org/) · [`jsonresume-theme-even-es`](https://github.com/felipegarciavidal/jsonresume-theme-even-es) (PDF) · [Puppeteer](https://pptr.dev/) — Licencia MIT.
