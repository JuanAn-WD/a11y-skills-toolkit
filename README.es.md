# a11y-skills-toolkit

[English](README.md)

Skills para agentes de IA (Claude Code, Cursor y Codex) centradas en la **accesibilidad frontend**. No se quedan en una lista de problemas, sino que cubren el ciclo completo:

**auditar las rutas reales → corregir en tu stack actual → volver a escanear para demostrar la corrección → añadir un test de regresión con Playwright + axe para CI**

> **Repositorio:** [JuanAn-WD/a11y-skills-toolkit](https://github.com/JuanAn-WD/a11y-skills-toolkit).

## Instalación (un comando)

```bash
npx skills add JuanAn-WD/a11y-skills-toolkit -a claude-code -a cursor -a codex
```

Este comando usa la CLI de código abierto [`skills`](https://github.com/vercel-labs/skills). Copia **las tres carpetas de skills** completas (con `references/`, `scripts/` y `assets/`) a `.agents/skills/`, que usan Cursor y Codex, y crea enlaces en `.claude/skills/` para Claude Code. Con `-g` se instalan para tu usuario en vez de para el proyecto actual. Instala siempre las tres juntas: el auditor y el implementador leen los archivos compartidos de `a11y-reference`.

Más abajo tienes [otros métodos de instalación](#otros-métodos-de-instalación).

## Qué incluye

| Skill | Cuándo usarla | Qué hace |
| --- | --- | --- |
| `a11y-auditor` | «Audita la accesibilidad de esta app», «¿Esta página cumple WCAG 2.2 AA?» | **Solo lectura.** Detecta el stack, arranca el servidor de desarrollo (o reutiliza uno que ya esté en marcha) y localiza las rutas reales. Las escanea con Playwright + axe-core, hace pruebas de teclado, zoom y reflow, y genera un informe con Pass / Fail / Not tested y evidencia para cada criterio. Al terminar detiene los servidores que haya arrancado. Nunca modifica el código. |
| `a11y-implementer` | «Corrige estos problemas de accesibilidad», «Haz un modal accesible» | Crea o corrige componentes en el stack que ya usas (React/Next, Vue/Nuxt, Angular, Svelte, Tailwind o HTML plano). Prioriza el HTML nativo frente a ARIA y respeta tu diseño. Vuelve a escanear para demostrar cada corrección y te propone un test de regresión. |
| `a11y-reference` | Dudas sobre criterios WCAG, patrones ARIA, la redacción del informe o el contexto legal | Conocimiento y herramientas compartidos: checklist de WCAG 2.2 AA (indica qué se puede automatizar y qué no), patrones ARIA, formato de informe, severidad y notas legales con fecha. Incluye también el escáner multirruta `scan.mjs` y la plantilla de test `a11y.spec.ts`. |

### Cómo informa

- Nunca da un «Cumple AA» genérico. Cada criterio se marca como **Pass**, **Fail** o **Not tested**, con su evidencia: regla, selector, ruta o prueba manual realizada.
- Las herramientas automáticas solo detectan una parte de los fallos WCAG. Por eso, un escaneo limpio se resume así: *«No se han detectado fallos automáticos; N criterios requieren verificación manual.»*
- Usa un solo motor: axe-core, a través de `@axe-core/playwright`. La auditoría de accesibilidad de Lighthouse también se basa en axe-core, así que ejecutar las dos herramientas no amplía la cobertura y las skills no suman sus resultados.
- Las buenas prácticas, como saltarse niveles de encabezado, se señalan como tales y no como fallos WCAG.

## El escáner

`skills/a11y-reference/scripts/scan.mjs` es un script Node ESM que analiza varias rutas en una sola ejecución:

```bash
DEPS=$(mktemp -d)
npm i --prefix "$DEPS" playwright @axe-core/playwright
npx --prefix "$DEPS" playwright install chromium

A11Y_SCAN_DEPS="$DEPS" node skills/a11y-reference/scripts/scan.mjs \
  --base-url http://localhost:5173 --routes /,/login,/checkout \
  --checks keyboard,reflow --out-dir "$DEPS/a11y-report"
```

- Las rutas se indican con `--routes` o en un `--config` JSON. Para páginas con login se usa `--storage-state`; las credenciales se toman de variables de entorno y nunca se guardan en archivos.
- Genera `results.json` y `summary.md`. El código de salida es `0` si no hay violaciones, `1` si las hay y `2` si hay un error de uso o de ejecución.
- `--checks keyboard,reflow` añade comprobaciones heurísticas: foco sin estilo visible, foco posiblemente tapado por otro contenido y scroll horizontal a 320 px. Se marcan como «revisar» y no afectan al código de salida.
- Las dependencias se instalan en una carpeta temporal, así que el `package.json` de tu proyecto no cambia.

## Test de regresión en CI

`skills/a11y-reference/assets/tests/a11y.spec.ts` es una plantilla de Playwright con `@axe-core/playwright`. Incluye una lista de rutas, ejemplos de estados interactivos (un diálogo abierto y la devolución del foco) y una comprobación del indicador de foco. [`examples/github-actions/a11y.yml`](examples/github-actions/a11y.yml) la ejecuta en cada pull request.

## Comparativa

| | Prompt genérico de «revisa la accesibilidad» | Skills de auditoría formal de conformidad | **a11y-skills-toolkit** |
| --- | --- | --- | --- |
| Objetivo | Consejos rápidos | Revisión exhaustiva, criterio a criterio | Ciclo de corrección y verificación en el código |
| Escanea la app en marcha | Rara vez | Depende | Sí: varias rutas con Playwright + axe y autenticación con storageState |
| Modifica el código | Sin método | No suele ser el objetivo | Sí, desde una skill aparte (`a11y-implementer`); el auditor es de solo lectura |
| Demuestra la corrección | No | No es el objetivo | Vuelve a escanear las mismas rutas |
| Deja un test en CI | No | No es el objetivo | Plantilla de Playwright + axe y ejemplo de GitHub Actions |
| Veredictos honestos | Suele decir «parece que cumple» | Sí | Pass / Fail / Not tested por criterio, sin afirmaciones genéricas |

Para ser justos, proyectos como [masuP9/a11y-specialist-skills](https://github.com/masuP9/a11y-specialist-skills) profundizan más en la auditoría y la revisión formal de conformidad. Si lo que necesitas es un informe de auditoría completo, échales un vistazo. Este toolkit es más acotado a propósito: encontrar, corregir, demostrar y evitar regresiones. Los dos enfoques se complementan.

## Contexto legal (no es asesoramiento jurídico)

La Ley Europea de Accesibilidad (EAA) se aplica desde el 28 de junio de 2025. La norma armonizada que se cita actualmente, EN 301 549 V3.2.1, remite a WCAG 2.1 AA. La EN 301 549 V4.1.1, alineada con WCAG 2.2, se publicó en 2026, pero todavía no está citada legalmente; se espera que aparezca más adelante en el Diario Oficial de la UE. Datos revisados en octubre de 2026; las fuentes están en [`severity-and-legal.md`](skills/a11y-reference/references/severity-and-legal.md). Las skills apuntan a WCAG 2.2 AA, que también cubre 2.1 AA.

**Aviso:** estas skills y sus informes son una ayuda técnica. No son asesoramiento jurídico ni una certificación de conformidad. Las pruebas automáticas solo detectan una parte de las barreras de accesibilidad, así que siguen siendo necesarias las pruebas con personas con discapacidad y con tecnologías de apoyo.

## Otros métodos de instalación

Instala siempre **las tres carpetas**. El auditor y el implementador buscan los archivos compartidos en `../a11y-reference/`, así que esa carpeta tiene que estar junto a ellos. Si falta, avisan una vez y pasan a una revisión estática sin el escáner.

### Claude Code

Como plugin, con las tres skills:

```text
/plugin marketplace add JuanAn-WD/a11y-skills-toolkit
/plugin install a11y-skills-toolkit@a11y-skills-toolkit
```

A mano: copia `skills/a11y-auditor`, `skills/a11y-implementer` y `skills/a11y-reference` en `.claude/skills/` (proyecto) o en `~/.claude/skills/` (usuario).

### Codex

Como plugin: el repositorio incluye un marketplace en `.agents/plugins/marketplace.json` y el manifiesto `plugin.json`.

```bash
codex plugin marketplace add JuanAn-WD/a11y-skills-toolkit
```

Después instala `a11y-skills-toolkit` desde `/plugins`.

A mano: copia las tres carpetas en `.agents/skills/` (repositorio) o en `~/.agents/skills/` (usuario).

### Cursor

Copia las tres carpetas en `.cursor/skills/` o en `.agents/skills/` (proyecto), o en `~/.cursor/skills/` (usuario). Cursor también carga las skills de `.claude/skills/` y `.codex/skills/`.

Como plugin local (la raíz del repositorio tiene un `plugin.json` de Agent Plugins): clónalo en `~/.cursor/plugins/local/a11y-skills-toolkit` y reinicia Cursor. Los equipos también pueden importar el repositorio en un marketplace de equipo.

`.cursorrules` es un formato heredado y estas skills no lo usan.

### A mano, para cualquier agente

```bash
git clone https://github.com/JuanAn-WD/a11y-skills-toolkit /tmp/a11y-skills-toolkit
mkdir -p .agents/skills && cp -R /tmp/a11y-skills-toolkit/skills/. .agents/skills/
```

## Desarrollo

```bash
npm run validate       # revisa el frontmatter de cada SKILL.md (name, description) y las rutas que cita
npm run test:scanner   # sirve test/fixtures/site y comprueba que el escáner detecta las violaciones plantadas
```

Consulta [CONTRIBUTING.md](CONTRIBUTING.md) y [CHANGELOG.md](CHANGELOG.md). Licencia: [MIT](LICENSE).
