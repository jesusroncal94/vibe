# Vibe Coding Management App — Arquitectura de Alto Nivel

**Fecha:** 10 de febrero de 2026  
**Versión:** Iteración 10 — 38 secciones (revisión integral con prácticas Claude Code feb-2026)  

---

## 1. Visión

Una app que orquesta el contexto de múltiples empresas y proyectos para hacer vibe coding efectivo con Claude Code, asegurando que cada solicitud lleve automáticamente la información correcta: herramientas, convenciones, estado del proyecto, y capacidades de validación visual.

---

## 2. Jerarquía de Contexto (3 niveles con herencia + rules modulares)

La resolución es siempre: **Proyecto > Empresa > Fallback**

La novedad clave: cada nivel se materializa como **`.claude/rules/`** con path-scoping, no como un CLAUDE.md monolítico.

### Nivel 1 — Fallback (Best Practices)

El piso de calidad que la app provee por defecto. Se distribuye como **template pack** de rules.

```
Instalado vía: vibe init (copia templates a .claude/rules/fallback/)
O vía plugin: /plugin install @vibe/fallback-rules

.claude/rules/fallback/
├── code-style.md           ← convenciones estándar (linting, naming)
├── git-workflow.md          ← branching, commits convencionales, PRs
├── documentation.md         ← estructura de docs base
├── testing.md               ← estrategia de testing por defecto
├── accessibility.md         ← lineamientos WCAG
└── performance.md           ← budgets de performance frontend
```

### Nivel 2 — Empresa

Lineamientos globales heredados a todos los proyectos. Se comparten vía **symlinks** a un directorio compartido de la empresa.

```
Setup: ln -s ~/shared-claude-rules/acme .claude/rules/enterprise

.claude/rules/enterprise/ (symlink → ~/shared-claude-rules/acme/)
├── tools.md                 ← GitHub, Slack, Figma (herramientas corp.)
├── code-review.md           ← convenciones de code review
├── security-policy.md       ← políticas de seguridad y compliance
├── communication.md         ← estándares de comunicación
└── design-system-base.md    ← design system base (si existe)
```

### Nivel 3 — Proyecto

Configuración específica que complementa o sobreescribe. Con **path-scoping** para que solo se carguen las rules relevantes al código que se está tocando.

```
.claude/rules/project/
├── stack.md                 ← stack técnico y arquitectura (global)
├── business-rules.md        ← reglas de negocio (global)
├── frontend/
│   ├── react.md             ← paths: "src/components/**/*.tsx"
│   ├── styles.md            ← paths: "src/**/*.{css,scss}"
│   └── testing.md           ← paths: "src/**/*.test.tsx"
├── backend/
│   ├── api.md               ← paths: "src/api/**/*.ts"
│   └── database.md          ← paths: "src/db/**/*.ts"
└── ci-cd.md                 ← pipeline específico
```

### Resolución por capacidad (ejemplo)

```
¿Cómo gestiono tareas en Proyecto ABC?
  1. ¿Proyecto lo define? → Sí → Jira con workflow X

¿Cómo gestiono tareas en Proyecto Nuevo?
  1. ¿Proyecto lo define? → No
  2. ¿Empresa lo define?  → Sí → Linear con defaults de empresa

¿Cómo documento en Proyecto Huérfano?
  1. ¿Proyecto lo define? → No
  2. ¿Empresa lo define?  → No
  3. Fallback → Markdown en /docs con estructura estándar
```

---

## 3. Modelo por Capacidades

En lugar de categorizar herramientas, se define qué **capacidades** expone cada una y qué herramienta resuelve cada capacidad por proyecto.

### Capacidades definidas

| Capacidad              | Ejemplos de herramienta               |
|------------------------|---------------------------------------|
| Repositorio de código  | GitHub, GitLab, Bitbucket             |
| Gestión de tareas      | Jira, Trello, Linear, GitHub Issues   |
| Documentación          | Confluence, Notion, Markdown          |
| Code review            | GitHub PRs, GitLab MRs               |
| Diseño                 | Figma, Sketch, Adobe XD              |
| Comunicación           | Slack, Teams, Discord                 |
| CI/CD                  | GitHub Actions, Jenkins, CircleCI     |
| Validación frontend    | Browser Preview MCP, Playwright       |
| Design tokens          | Figma API, Style Dictionary           |
| Monitoring             | Sentry, Datadog, New Relic            |

### Asignación por proyecto (ejemplo)

```
Empresa "Acme Corp"
├── Herramientas globales:
│   ├── Repositorio       → GitHub
│   ├── Comunicación      → Slack
│   └── Diseño            → Figma
│
├── Proyecto ABC
│   ├── Hereda: GitHub, Slack, Figma
│   ├── Gestión de tareas → Jira (workflow: To Do → In Progress → Review → Done)
│   ├── Documentación     → Confluence (espacio: ABC-DOCS)
│   ├── CI/CD             → GitHub Actions
│   └── Validación FE     → Browser Preview MCP + Chromatic
│
└── Proyecto DEF
    ├── Hereda: GitHub, Slack, Figma
    ├── Gestión de tareas → Trello (board: DEF-Board)
    ├── Documentación     → Notion (workspace: DEF)
    ├── CI/CD             → Jenkins
    └── Validación FE     → Browser Preview MCP + Percy
```

---

## 4. Tipos de Contexto

### Estático (cambia poco)

Vive en `CLAUDE.md` (lean router) y `.claude/rules/` (path-scoped) + documentación asociada.

- Stack tecnológico y arquitectura
- Convenciones de código (rules globales y path-scoped)
- Design system (tokens, componentes, patrones)
- UX patterns (flujos, interacciones esperadas)
- Estrategia de testing

### Dinámico (cambia constantemente)

Se sirve vía MCP servers (con `defer_loading`) que consultan herramientas en tiempo real.

- Tickets activos y su estado
- Estado del frontend (componentes renderizados, errores)
- Dependencias entre proyectos
- Métricas de calidad

### Histórico (se acumula y se filtra)

Vive en `.claude/history/` y se inyecta selectivamente por relevancia (scoring engine).

- Decisiones tomadas (ADRs ligeros)
- Resúmenes de sesiones previas
- Errores recurrentes y sus fixes (compound engineering)
- Interacciones cross-tool (tickets → commits → PRs → reviews)
- Convenciones que emergieron del uso

### Planificación (transitorio pero persistente)

Vive en `.claude/plans/` y sobrevive compactions porque es archivo, no contexto.

- Plan activo (active-plan.md) — contrato versionado del trabajo
- TodoWrite progress tracking
- Archivos de planes completados

---

## 5. Building Blocks de Claude Code (actualizado feb-2026)

El ecosistema de extensibilidad de Claude Code ha madurado significativamente. Los building blocks actuales son: **Memory** (CLAUDE.md + rules), **Skills** (unificadas con commands), **Agents** (subagents + Task tool), **Hooks** (12+ eventos, command + prompt types), **MCP Servers**, **Plugins** (distribución), y **Agent SDK** (programático).

### CLAUDE.md — La constitución del agente (lean router)

Best practice 2026: CLAUDE.md NO debe exceder ~150 líneas. Funciona como un **router** que apunta a dónde está la información, no como un repositorio de toda la información. Las instrucciones detalladas van en `.claude/rules/`.

```
proyecto/
├── CLAUDE.md                    ← generado por la app (lean: ~100-150 líneas)
│   ├── Routing: qué docs leer para cada tarea
│   ├── Convenciones críticas (las que aplican SIEMPRE)
│   ├── Skills disponibles (lista para discovery)
│   └── Pointers a .claude/rules/ para detalles
│
├── .claude/
│   ├── rules/                   ← NUEVO: instrucciones modulares con path-scoping
│   │   ├── code-style.md        ← aplica a todo (sin frontmatter)
│   │   ├── security.md          ← aplica a todo
│   │   ├── frontend/
│   │   │   ├── react.md         ← paths: "src/components/**/*.tsx"
│   │   │   └── styles.md        ← paths: "src/**/*.css"
│   │   ├── backend/
│   │   │   ├── api.md           ← paths: "src/api/**/*.ts"
│   │   │   └── database.md      ← paths: "src/db/**/*.ts"
│   │   └── testing.md           ← paths: "**/*.test.*"
│   │
│   ├── docs/
│   │   ├── design-system.md     ← tokens, componentes, convenciones UI
│   │   ├── ux-patterns.md       ← flujos, interacciones esperadas
│   │   ├── architecture.md      ← decisiones técnicas
│   │   └── testing-strategy.md  ← qué se valida y cómo
│   │
│   ├── history/
│   │   ├── decisions/           ← ADRs ligeros (auto-generados)
│   │   ├── sessions/            ← resúmenes de sesiones
│   │   └── patterns/            ← learned-fixes + convenciones emergentes
│   │
│   ├── plans/                   ← NUEVO: Plan Mode artifacts
│   │   └── active-plan.md       ← plan actual (contrato versionado)
│   │
│   ├── skills/                  ← unificado (skills = commands)
│   ├── agents/                  ← subagent definitions
│   │
│   ├── settings.json            ← config de proyecto (hooks, permissions)
│   └── .mcp.json                ← MCP servers del proyecto
```

### .claude/rules/ — Instrucciones modulares con path-scoping

El reemplazo para el CLAUDE.md monolítico. Las rules se cargan con la misma prioridad que CLAUDE.md pero solo cuando son relevantes.

```
Regla sin frontmatter → se carga SIEMPRE (global):
  .claude/rules/code-style.md
  
  # Code Style
  - 2-space indentation
  - Prefer const over let
  - Max line length: 100

Regla con paths → se carga SOLO al trabajar en archivos que matchean:
  .claude/rules/frontend/react.md
  
  ---
  paths:
    - "src/components/**/*.tsx"
    - "src/pages/**/*.tsx"
  ---
  # React Conventions
  - Use functional components with hooks
  - Props interface siempre nombrada como ComponentNameProps
  - Custom hooks en src/hooks/

Nuestra plataforma genera estas rules automáticamente:
├── Desde el Context Engine (jerarquía fallback → empresa → proyecto)
├── Las rules de empresa se comparten vía symlinks:
│   ln -s ~/shared-claude-rules/acme .claude/rules/enterprise
├── Las rules de proyecto son específicas
├── Las rules de fallback vienen como templates del CLI
└── Path-scoping reduce el contexto inyectado en cada sesión
```

### Skills — Unificadas con Commands (Agent Skills Open Standard)

Desde 2025, skills y custom slash commands son el mismo concepto. Una skill crea automáticamente un `/skill-name` command. Siguen el **Agent Skills Open Standard** (compatible con múltiples herramientas AI).

```
.claude/skills/
├── crear-ticket/
│   └── SKILL.md          → skill + /crear-ticket (auto-invocable + manual)
├── documentar-decision/
│   └── SKILL.md          → documenta en Confluence/Notion/Markdown
├── browser-preview/
│   ├── SKILL.md           → loop de validación visual frontend
│   └── scripts/
│       └── capture.sh     → scripts auxiliares
├── component-check/
│   └── SKILL.md          → valida componente contra design system
├── session-summary/
│   └── SKILL.md          → extrae decisiones y resumen al cerrar sesión
├── learned-fix/
│   └── SKILL.md          → registra error recurrente y su solución
└── smart-commit/
    └── SKILL.md          → genera conventional commit message

Frontmatter de una skill (ejemplo):
---
name: browser-preview
description: Launch visual validation loop for frontend components
context: fork                    ← corre en subagent aislado
agent: qa-visual                 ← usa el subagent qa-visual
allowed-tools:                   ← restricción de tools
  - Bash
  - Read
  - "mcp__browser-preview__*"
disable-model-invocation: false  ← Claude puede auto-invocar
hooks:
  PostToolUse:
    - matcher: "mcp__browser-preview__screenshot"
      hooks:
        - type: command
          command: "./scripts/save-baseline.sh"
---

Características clave:
├── context: fork → corre en subagent aislado (no contamina contexto principal)
├── $ARGUMENTS → placeholder para argumentos dinámicos
├── allowed-tools → restricción granular de tools disponibles
├── disable-model-invocation: true → solo se invoca manualmente
├── Progressive disclosure: descripción cargada siempre, contenido bajo demanda
│   "I know Kung Fu" — el contenido se carga solo cuando se activa
└── Hooks inline: hooks scoped al lifecycle de la skill
```

### Agents — Subagents + Task Tool nativo

```
.claude/agents/
├── explorer.md           → investiga codebase (Explore agent type)
├── planner.md            → planificación técnica (Plan agent type)
├── qa-visual.md          → validación frontend con browser preview
├── researcher.md         → búsqueda en docs y web
└── integration.md        → verifica integración entre servicios

Patrón recomendado 2026: Master-Clone > Lead-Specialist
├── En vez de crear subagents ultra-especializados que gatekeepean contexto
├── Poner el contexto clave en CLAUDE.md/.claude/rules/
├── Dejar que el agente principal use Task() para delegar dinámicamente
├── Los subagents custom son para workflows MUY específicos y repetitivos
└── El Task tool nativo crea clones del agente general con contexto limpio

Task Tool nativo:
├── Claude puede crear subagents dinámicamente via Task(...)
├── Cada subagent tiene su propio context window aislado
├── Solo el resultado resumido vuelve al contexto principal
├── Reduce (X + Y) * N tokens a solo Z * N tokens
└── Ideal para: tests paralelos, búsqueda en múltiples archivos, research

TodoWrite Tool nativo:
├── Claude puede crear/actualizar listas de tareas estructuradas
├── Cada tarea: { content, status: pending|in_progress|completed, activeForm }
├── Visible en la UI de Claude Code como progress tracker
└── Integrado con Plan Mode
```

### Plan Mode — Planificación estructurada

```
Plan Mode es nativo en Claude Code:
├── Claude puede entrar en modo planificación explícitamente
├── Genera un plan en .claude/plans/active-plan.md
├── El plan es un contrato versionado para el trabajo
├── ExitPlanMode → presenta plan al usuario para aprobación
├── Después de aprobado → ejecución siguiendo el plan
└── El plan sobrevive compactions (porque está en archivo)

Nuestra plataforma integra Plan Mode:
├── vibe plan → activa Plan Mode con contexto del proyecto inyectado
├── El plan incluye: feature slug, tareas, dependencias, criterios de éxito
├── Combina con TodoWrite para tracking de progreso visible
├── Los plans se archivan en .claude/history/plans/ al completarse
└── Plans como artifacts versionados (no notas ad-hoc)
```

### Hooks — 12+ eventos, command + prompt types

```
Tipos de hooks:
├── type: "command" → ejecuta script bash (determinístico)
├── type: "prompt"  → usa LLM (Haiku) para evaluar (nuevo, flexible)
└── Ambos reciben JSON via stdin con contexto del evento

Eventos del lifecycle completo:

  ┌─── Session Lifecycle ───────────────────────────────┐
  │ Setup           → init/maintenance (vibe init)       │
  │ SessionStart    → inicio de sesión (startup/resume)  │
  │ SessionEnd      → fin de sesión (exit/sigint/error)  │
  └─────────────────────────────────────────────────────┘
  
  ┌─── Conversation Loop ───────────────────────────────┐
  │ UserPromptSubmit → antes de procesar prompt          │
  │ PreToolUse       → antes de ejecutar tool (block/    │
  │                    modify/deny/inject context)       │
  │ PermissionRequest→ cuando Claude pide permiso        │
  │ PostToolUse      → después de tool exitoso           │
  │ PostToolUseFailure → después de tool fallido         │
  │ Notification     → cuando Claude envía alerta        │
  │ Stop             → cuando Claude termina respuesta   │
  └─────────────────────────────────────────────────────┘
  
  ┌─── Subagent Lifecycle ──────────────────────────────┐
  │ SubagentStart    → cuando se crea un subagent        │
  │ SubagentStop     → cuando subagent termina           │
  └─────────────────────────────────────────────────────┘
  
  ┌─── Maintenance ─────────────────────────────────────┐
  │ PreCompact       → antes de compaction automática    │
  │ TaskCompleted    → cuando una tarea se completa      │
  └─────────────────────────────────────────────────────┘

Nuestra plataforma usa hooks para:
├── SessionStart → cargar contexto del proyecto activo + historial relevante
│   (reemplaza el hook "Pre-task" que teníamos antes)
├── PreToolUse (Write|Edit) → validar convenciones de empresa
├── PostToolUse (Write|Edit) → trigger visual regression, auto-format
├── PostToolUseFailure → logging centralizado, registrar en learned-fixes
├── PermissionRequest → auto-aprobar comandos seguros del proyecto
├── Stop → extraer decisiones, resumir sesión, detectar patrones
├── SubagentStop → capturar resultados de subagents
├── PreCompact → guardar checkpoint antes de compaction
├── Notification → forward a Slack/email del dev
└── UserPromptSubmit → inyectar contexto dinámico (fecha, sprint actual)

Prompt hooks (LLM-evaluated):
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Bash",
      "hooks": [{
        "type": "prompt",
        "prompt": "Review this command: $ARGUMENTS. If it could delete data, modify production config, or access secrets, respond with deny. Otherwise allow."
      }]
    }]
  }
}
├── Más flexible que scripts bash para validación semántica
├── Usa Haiku por defecto (rápido y barato)
├── Ideal para: security checks, convention validation
└── Nuestra plataforma genera prompt hooks desde las rules del proyecto

PreToolUse input modification (v2.0.10+):
├── Hooks pueden MODIFICAR el input de tools antes de ejecución
├── Invisible para Claude (no sabe que se modificó)
├── Usos: sandboxing transparente, dry-run flags, secret redaction,
│   auto-corrección de paths, convention enforcement
└── Nuestra plataforma usa esto para inyectar project context
```

### MCP Servers — Activados según proyecto

```
Siempre activos (empresa):
├── github-mcp
├── slack-mcp
└── figma-mcp

Activados por proyecto:
├── jira-mcp            ← Proyecto ABC
├── confluence-mcp      ← Proyecto ABC
├── trello-mcp          ← Proyecto DEF
├── notion-mcp          ← Proyecto DEF
├── browser-preview-mcp ← proyectos frontend
├── design-tokens-mcp   ← proyectos frontend
└── playwright-mcp      ← testing E2E

Naming convention para tools MCP:
  mcp__<server-name>__<action>
  Ejemplo: mcp__browser-preview__screenshot
           mcp__jira__create_ticket
           mcp__figma__get_tokens

Tool Search / Lazy Loading (Anthropic Advanced Tool Use):
├── Por defecto, TODAS las tool definitions se inyectan al contexto
├── Con defer_loading: true → solo se cargan cuando Claude las necesita
├── Reduce de ~50K tokens en tools a ~8K iniciales (85% reducción)
├── Nuestra plataforma configura esto automáticamente:
│   - Siempre cargados: Read, Write, Edit, Bash, Task, project-context
│   - Bajo demanda: browser-preview, design-tokens, jira, slack, figma
└── Configurado en .claude/settings.json del proyecto
```

### Plugins — Distribución y composición

```
Los plugins son el mecanismo oficial de empaquetado y distribución.
Bundlean: skills + agents + hooks + MCP servers + LSP servers + commands.

Nuestra plataforma se distribuye como un plugin + marketplace:

@vibe/marketplace (marketplace.json en GitHub)
├── @vibe/core-plugin
│   ├── skills/: session-summary, learned-fix, smart-commit
│   ├── agents/: explorer, planner, qa-visual
│   ├── hooks: SessionStart (context loading), Stop (session summary)
│   ├── .mcp.json: vibe-context, vibe-history servers
│   └── commands/: switch, status, daily, preview
│
├── @vibe/frontend-plugin
│   ├── skills/: browser-preview, component-check, visual-regression
│   ├── agents/: qa-visual
│   ├── hooks: PostToolUse (visual validation)
│   └── .mcp.json: browser-preview, design-tokens servers
│
├── @vibe/enterprise-plugin (commercial)
│   ├── hooks: audit logging, compliance checks
│   ├── .mcp.json: vault integration
│   └── skills/: data-residency-check
│
└── Template packs por stack:
    ├── @vibe/react-nextjs-template
    ├── @vibe/vue-nuxt-template
    └── @vibe/svelte-kit-template

Instalación:
  /plugin marketplace add vibe-dev/vibe-plugins
  /plugin install core@vibe-dev/vibe-plugins
  /plugin install frontend@vibe-dev/vibe-plugins

Los componentes se MERGEN en .claude/ del proyecto:
├── Skills → .claude/skills/
├── Agents → .claude/agents/
├── Hooks → merged en .claude/settings.json
├── MCP → merged en .claude/.mcp.json
└── No hay namespacing aislado (todo comparte el espacio)

Governance enterprise:
├── strictKnownMarketplaces: restringir a marketplaces aprobados
├── allowManagedHooksOnly: solo hooks aprobados por IT
├── allowedMcpServers / deniedMcpServers: control de MCP servers
└── permissions.deny: bloquear tools específicos
```

### Agent SDK — Acceso programático

```
Para cuando la plataforma necesita ejecutar Claude Code programáticamente
(workers, CI/CD, automation), usamos el Agent SDK oficial:

import { query, ClaudeAgentOptions } from '@anthropic-ai/claude-agent-sdk';

// Worker de visual regression ejecuta Claude programáticamente
const options: ClaudeAgentOptions = {
  allowedTools: ['Read', 'Bash', 'mcp__browser-preview__*'],
  permissionMode: 'acceptEdits',
  mcpServers: {
    'browser-preview': {
      command: 'vibe',
      args: ['mcp', 'browser-preview', '--project', projectId]
    }
  },
  systemPrompt: `You are a visual QA agent. Compare screenshots 
    against baselines and report differences.`
};

for await (const msg of query({
  prompt: 'Run visual regression on all changed components',
  options
})) {
  // Process results
}

Usos en nuestra plataforma:
├── Workers de CI/CD: ejecutar visual regression en containers
├── Session summary automation: extraer decisiones post-sesión
├── Batch operations: actualizar CLAUDE.md en múltiples proyectos
├── Quality audits: validar que el contexto es coherente
└── Background tasks: research paralelo con subagents
```

---

## 6. Integración Frontend — Validación Visual

Este es el diferenciador clave: cerrar el gap de que Claude Code no puede "ver" lo que genera en frontend. Implementado como skill con `context: fork` + PostToolUse hooks + browser-preview MCP server.

### El problema

Claude Code opera sobre archivos y terminal. Cuando genera código frontend (React, Vue, HTML/CSS), no tiene forma nativa de verificar que el resultado visual sea correcto: que los componentes se vean bien, que la UX fluya, que la integración funcione.

### La solución: Loop de Validación Visual (skill + hooks)

```
Implementación: @vibe/frontend-plugin
├── Skills: browser-preview (context: fork), component-check
├── Agents: qa-visual (subagent aislado)
├── Hooks: PostToolUse (Write|Edit) → auto-trigger validación
└── MCP: browser-preview-mcp, design-tokens-mcp (defer_loading: true)

Flujo activado por PostToolUse hook en archivos .tsx/.vue/.css:


```
┌─────────────────────────────────────────────────────────────┐
│                    LOOP DE VALIDACIÓN                        │
│                                                             │
│  ┌──────────┐    ┌──────────────┐    ┌────────────────┐     │
│  │  Claude   │───▶│  Dev Server  │───▶│  Browser MCP   │     │
│  │  Code     │    │  (vite/next) │    │  (Playwright)  │     │
│  │  genera   │    │  renderiza   │    │  screenshot    │     │
│  │  código   │    │              │    │  + interacción │     │
│  └──────────┘    └──────────────┘    └───────┬────────┘     │
│       ▲                                       │              │
│       │          ┌──────────────┐             │              │
│       │          │  Claude      │◀────────────┘              │
│       └──────────│  analiza     │  screenshot                │
│    corrige si    │  (visión)    │  + DOM + accesibilidad     │
│    hay diffs     │  compara vs  │                            │
│                  │  design-     │                            │
│                  │  system.md   │                            │
│                  └──────────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

### Browser Preview MCP Server

MCP Server dedicado que controla un browser headless y expone estas tools:

| Tool                         | Función                                        | Cuándo se usa                              |
|------------------------------|------------------------------------------------|--------------------------------------------|
| `navigate(url)`             | Navegar a URL del dev server                   | Inicio del loop                            |
| `screenshot(selector?)`     | Captura completa o de un componente            | Después de cada cambio                     |
| `interact(action, selector)`| Click, scroll, fill, hover, drag               | Validar flujos de UX                       |
| `get_dom(selector?)`        | Obtener estructura DOM                         | Verificar estructura semántica             |
| `accessibility_audit()`     | Auditoría WCAG automática                      | Cada componente nuevo                      |
| `responsive_check(sizes[])` | Screenshots en múltiples viewports             | Validar responsive design                  |
| `performance_metrics()`     | Core Web Vitals, bundle size                   | Antes de merge                             |
| `visual_diff(baseline, current)` | Comparar screenshots pixel a pixel        | Detectar regresiones visuales              |
| `console_errors()`          | Capturar errores de consola                    | Cada iteración del loop                    |
| `network_requests()`        | Listar llamadas de red y sus respuestas        | Verificar integración con APIs             |

### Design Tokens MCP Server

Acceso dinámico al design system para que Claude compare lo generado contra lo esperado.

| Tool                           | Función                                      |
|--------------------------------|----------------------------------------------|
| `get_tokens(category)`        | Colores, tipografía, spacing, breakpoints     |
| `get_component_spec(name)`    | Props, variantes, estados de un componente    |
| `validate_token_usage(css)`   | Verificar que el CSS usa tokens válidos       |
| `get_icon(name)`              | Obtener ícono del set del proyecto            |
| `get_layout_patterns()`      | Grids, containers, márgenes estándar          |

### Estrategias de Validación (complementarias)

#### A. Screenshot + Visión (loop rápido)

Para iteración rápida. Claude genera, toma screenshot, analiza con visión, corrige.

- Velocidad: alta (segundos por iteración)
- Precisión: ~80% en primera iteración
- Ideal para: desarrollo activo, prototipos

#### B. Visual Regression Testing (calidad)

Comparación pixel a pixel contra baselines aprobados.

- Herramientas: Chromatic, Percy, BackstopJS
- Claude ejecuta tests, analiza diffs, corrige
- Ideal para: antes de merge, CI/CD

#### C. Component Testing (aislado)

Cada componente testeado en aislamiento con todos sus estados.

- Herramientas: Storybook + test runners
- Claude genera stories, valida cada variante
- Ideal para: design systems, componentes compartidos

#### D. E2E Testing (integración)

Flujos completos de usuario validados automaticamente.

- Herramientas: Playwright, Cypress
- Claude escribe y ejecuta tests de flujo
- Ideal para: features completas, happy paths, edge cases

### Contexto por proyecto para frontend

Cada proyecto frontend necesita estos archivos de contexto, distribuidos entre docs (referencia) y rules (instrucciones path-scoped):

```
.claude/docs/                        ← referencia (acceso bajo demanda vía @path)
├── design-system.md
│   ├── Tokens: colores, tipografía, spacing, shadows
│   ├── Componentes: catálogo con props y variantes
│   ├── Patrones de layout: grids, containers
│   └── Iconografía: set de íconos, uso
│
├── ux-patterns.md
│   ├── Flujos principales: login, checkout, dashboard
│   ├── Interacciones: hover, focus, transiciones
│   ├── Feedback: loading, errors, empty states
│   ├── Navegación: menús, breadcrumbs, routing
│   └── Responsive: breakpoints, comportamiento mobile
│
└── testing-strategy.md
    ├── Qué se testea visualmente y qué con unit tests
    ├── Baselines de visual regression
    ├── Cobertura esperada por tipo de componente
    └── Flujos E2E críticos

.claude/rules/frontend/              ← instrucciones (path-scoped, auto-cargadas)
├── react.md                         ← paths: "src/components/**/*.tsx"
│   ├── Estructura de componentes (archivos, naming)
│   ├── Props patterns (interfaces, defaults)
│   └── Hook patterns (custom hooks, memoization)
│
├── styles.md                        ← paths: "src/**/*.{css,scss,module.css}"
│   ├── Styling approach (CSS modules, Tailwind, etc.)
│   ├── Design token usage enforcement
│   └── Responsive patterns
│
├── testing.md                       ← paths: "src/**/*.test.{ts,tsx}"
│   ├── Visual test conventions
│   ├── Component test patterns
│   └── E2E test structure
│
└── performance.md                   ← paths: "src/**/*.{ts,tsx}"
    ├── Performance budgets (bundle size, LCP, CLS)
    ├── Lazy loading patterns
    └── Accesibilidad (WCAG level, aria patterns)

Ventaja del path-scoping: cuando Claude edita un .tsx, solo se cargan
las rules de frontend/react.md. Cuando edita un .test.tsx, se cargan
frontend/testing.md. Reduce el contexto inyectado ~40% vs cargar todo.
```

### El 20% que requiere validación humana

Aspectos subjetivos que la automatización aún no cubre bien:

- Microinteracciones y timing de animaciones
- "Se siente bien" — la sensación general de fluidez
- Coherencia visual con el branding
- Edge cases de responsive en dispositivos reales
- Experiencia con datos reales vs mock data

La app podría integrar un **flujo de review** donde Claude marca lo que necesita validación humana y el desarrollador aprueba/rechaza con feedback que se incorpora al contexto.

---

## 7. Gestión de Contexto e Historial

Claude Code no tiene memoria entre sesiones. Cada conversación arranca de cero. Si ayer se decidió cambiar la arquitectura de autenticación de JWT a sessions, hoy Claude no lo sabe a menos que esté documentado. Multiplicado por múltiples empresas y proyectos, el problema escala rápido.

Hay que resolver cuatro dimensiones distintas:

### 7.1. Contexto conversacional (dentro de una sesión)

Lo que ocurre mientras se trabaja. Claude Code tiene un context window finito que se llena con cada interacción. En sesiones largas, el contexto inicial se degrada ("context rot").

**Mecanismos nativos de Claude Code (actualizados 2026):**

- `/compact` — resume la conversación para liberar espacio. La compaction es también automática cuando el contexto se acerca al límite.
- `claude --resume` / `claude --continue` — retomar sesiones previas
- Sesiones almacenadas en `~/.claude/projects/`
- **Plan Mode** — `.claude/plans/active-plan.md` sobrevive compactions (está en archivo, no en context)
- **TodoWrite** — progress tracker nativo visible en UI
- **PreCompact hook** — nuestra plataforma guarda checkpoint antes de que se compacte
- **context: fork** — skills que corren en subagent aislado no contaminan el contexto principal
- **Background agents** — tareas largas delegadas a subagents no llenan el main context

**Lo que la app agrega:**

Gestión del ciclo de vida de sesiones por proyecto. Cada sesión tiene un alcance (feature, bug, spike) y al terminar, los hallazgos se extraen y persisten automáticamente via hooks.

```
Sesión activa en Proyecto ABC
│
├── Contexto cargado: CLAUDE.md (lean) + rules (path-scoped) + MCP servers
├── Alcance: implementando pricing cards (PROJ-123)
├── Plan: .claude/plans/active-plan.md (sobrevive compactions)
├── Decisiones tomadas durante la sesión:
│   ├── "Usamos CSS Grid en vez de Flexbox para el layout"
│   ├── "El hover effect es scale(1.02) con 200ms ease"
│   └── "El endpoint de precios es /api/v2/pricing"
│
├── PreCompact hook (cuando se auto-compacta):
│   ├── Guarda checkpoint de decisiones pendientes
│   ├── Actualiza .claude/plans/active-plan.md con progreso
│   └── Persiste learned-fixes detectados hasta ahora
│
└── Stop hook (al cerrar sesión):
    ├── Claude resume decisiones    → decisions/
    ├── Claude resume problemas     → sessions/
    └── Si hay cambios arquitec.    → actualiza architecture.md
```

### 7.2. Historial de decisiones (entre sesiones)

La memoria de largo plazo del proyecto. No es el chat completo (demasiado ruido), sino decisiones destiladas que afectan el trabajo futuro.

**Dos tipos de decisiones:**

- **Explícitas** — el dev o Claude dicen "vamos a usar X patrón por Y razón". Fáciles de capturar porque son intencionales.
- **Implícitas** — se toman durante el código sin verbalizarlas. Claude elige un approach, funciona, nadie lo documenta. La próxima sesión, otro Claude podría elegir diferente, creando inconsistencia.

**Estructura de persistencia (ADR ligero + compound engineering):**

```
.claude/history/
├── decisions/
│   ├── 2026-02-08-pricing-layout-css-grid.md
│   ├── 2026-02-07-auth-jwt-to-sessions.md
│   └── 2026-02-05-api-versioning-strategy.md
│
├── sessions/
│   ├── 2026-02-08-pricing-cards.md       ← resumen auto
│   ├── 2026-02-07-auth-refactor.md
│   └── 2026-02-05-api-design.md
│
└── patterns/
    ├── learned-fixes.md                   ← errores recurrentes + soluciones
    └── project-conventions-evolved.md     ← convenciones que emergieron del uso
```

**`learned-fixes.md` (compound engineering):**

Si Claude se equivoca repetidamente con lo mismo (olvidar el `key` prop en un map, configurar mal CORS, importar un módulo incorrecto), la app detecta el patrón y lo agrega al contexto para prevenir reincidencia. Los errores se convierten en aprendizaje persistente.

```
Ejemplo de entrada en learned-fixes.md:

## CORS en API Gateway
- Error: configurar CORS solo en el backend sin habilitarlo en API Gateway
- Fix: siempre configurar CORS en ambos niveles
- Detectado: 3 veces entre 2026-01-15 y 2026-02-01
- Contexto: Proyecto ABC, endpoints nuevos
```

### 7.3. Historial de interacción cross-tool

No solo lo que Claude dijo, sino lo que **hizo** en herramientas externas y qué resultado tuvo. La app actúa como nexo que correlaciona actividad en Jira, GitHub, Slack y el trabajo de Claude.

```
Flujo de interacción rastreable:

Ticket PROJ-123 (Jira)
  ├── Claude lee el ticket
  ├── Claude planifica (Plan subagent)
  ├── Claude implementa (commits: abc123, def456)
  ├── Claude crea PR #45
  ├── Review: "falta test de edge case para valores negativos"
  ├── Claude corrige y pushea
  ├── PR aprobado y mergeado
  └── Aprendizaje extraído:
      → "En este proyecto, PRs requieren tests de edge cases
         explícitos para inputs numéricos"
      → Se agrega a learned-fixes.md
```

**Valor:** La próxima vez que Claude trabaje en algo similar, sabe que el reviewer espera test coverage específico. Este conocimiento no está en ningún `CLAUDE.md` estático; emerge de la interacción real.

### 7.4. Flujo bidireccional: carga y extracción

La información fluye en dos direcciones entre la app y Claude Code.

**Hacia abajo (al iniciar sesión):**

```
La app carga en Claude Code (vía SessionStart hook):
│
├── CLAUDE.md lean router + .claude/rules/ path-scoped
├── Últimas N decisiones relevantes (de decisions/)
├── Resumen de la última sesión en este feature (de sessions/)
├── Errores conocidos y sus fixes (de learned-fixes)
├── Active plan si existe (.claude/plans/active-plan.md)
├── Estado actual del ticket asociado (dinámico, vía MCP)
└── Comentarios recientes del PR si hay uno abierto (dinámico, vía MCP)
```

**Hacia arriba (Stop hook + PreCompact hook):**

```
Claude Code devuelve (extraído por hooks):
│
├── Resumen de decisiones              → decisions/
├── Resumen de la sesión               → sessions/
├── Errores encontrados y fixes        → learned-fixes
├── Si algo contradice rules/CLAUDE.md → flag para revisión humana
├── Progreso de plan                   → actualiza active-plan.md
└── Si una convención emergió          → propuesta para nueva rule
    en .claude/rules/project/ o enterprise/
```

### 7.5. Estrategia de relevancia (scoring)

Con múltiples empresas y proyectos, el historial crece rápido. No se puede inyectar todo en el context window. La app necesita filtrar por relevancia.

**Tres factores:**

- **Recencia** — decisiones recientes pesan más que antiguas
- **Alcance** — si trabajas en frontend, las decisiones de backend pesan menos (salvo APIs compartidas)
- **Impacto** — una decisión arquitectónica pesa más que un fix cosmético

**Sistema de scoring:**

```
relevance_score = (recency × 0.4) + (scope_match × 0.35) + (impact × 0.25)

Ejemplos:

"Migramos a CSS Grid ayer para pricing"
  → recency: alta, scope: frontend/pricing (match), impact: medio
  → score: 0.85 → SE INCLUYE

"Cambiamos caching del backend hace 3 meses"
  → recency: baja, scope: backend (no match), impact: alto
  → score: 0.35 → NO SE INCLUYE (a menos que se toque la API)

"El reviewer siempre pide tests de edge cases"
  → recency: n/a (permanente), scope: global, impact: alto
  → score: 0.90 → SIEMPRE SE INCLUYE
```

### 7.6. Propagación entre niveles (promoción de conocimiento)

El historial de un proyecto puede informar el nivel de empresa, y múltiples empresas pueden enriquecer los fallbacks.

```
Proyecto ABC aprende:
  "Siempre hacer accessibility audit antes de merge"

  ↑ se repite en Proyecto DEF

Empresa Acme adopta:
  "Todos los proyectos hacen accessibility audit pre-merge"

  ↑ se repite en múltiples empresas

Fallback incorpora:
  "Best practice: accessibility audit pre-merge"
```

La app detecta patrones repetidos y sugiere **promociones de conocimiento**: un aprendizaje de proyecto que debería ser política de empresa, o una práctica de empresa que debería ser un fallback universal.

### 7.7. Modelo temporal completo

```
                    PERSISTENCIA

Corto plazo         │  Sesión activa (context window)
(minutos/horas)     │  ├── Conversación en curso
                    │  ├── /compact para liberar espacio
                    │  └── claude --resume para retomar
                    │
Mediano plazo       │  Historial de proyecto
(días/semanas)      │  ├── Resúmenes de sesión
                    │  ├── Decisiones (ADRs ligeros)
                    │  ├── Errores + fixes (compound engineering)
                    │  └── Interacciones cross-tool
                    │
Largo plazo         │  Contexto consolidado
(meses)             │  ├── CLAUDE.md actualizado
                    │  ├── Convenciones evolucionadas
                    │  ├── Patrones promovidos a empresa
                    │  └── Fallbacks enriquecidos

                    RELEVANCIA

Scoring             │  recency × scope_match × impact
                    │  Solo lo relevante entra al context window
                    │  El resto permanece consultable vía MCP
```

---

## 8. Flujo Completo de Trabajo (con hooks y tools nativos)

### Al iniciar sesión

```
1. Dev dice: "voy a trabajar en Proyecto ABC de Acme Corp"
   (o /project:switch acme abc)

2. La app (via SessionStart hook + CLI):
   a. Resuelve jerarquía de contexto (fallback + Acme + ABC)
   b. Genera CLAUDE.md lean (~100-150 líneas, router)
   c. Genera/actualiza .claude/rules/ (modulares, con path-scoping)
   d. Configura .claude/.mcp.json:
      - Empresa: github-mcp, slack-mcp, figma-mcp
      - Proyecto: jira-mcp, confluence-mcp (defer_loading: true)
      - Frontend: browser-preview-mcp, design-tokens-mcp (defer_loading: true)
   e. Carga skills y agents del proyecto + plugins instalados
   f. Filtra historial por relevancia (scoring engine)
      → inyecta últimas decisiones, sesión previa, learned-fixes
   g. Si hay active-plan.md → Claude retoma donde quedó
   h. Claude Code queda listo con contexto completo + memoria

   Hook real (SessionStart):
   {
     "hooks": {
       "SessionStart": [{
         "hooks": [{
           "type": "command",
           "command": "vibe context inject --project $CLAUDE_PROJECT_DIR"
         }]
       }]
     }
   }
```

### Durante el desarrollo

```
3. Dev pide: "implementa el componente de pricing cards"

4. Claude Code:
   a. Lee .claude/rules/frontend/react.md (auto-cargado por path-scoping)
   b. Lee .claude/docs/design-system.md → tokens, variantes
   c. Lee .claude/docs/ux-patterns.md → interacciones esperadas
   d. Consulta learned-fixes via MCP history tool → evita errores conocidos
   e. Crea plan via Plan Mode → .claude/plans/active-plan.md
   f. Genera el código del componente
   
   PostToolUse hook (Write|Edit) → auto-format con Prettier:
   g. Triggerea /project:browser-preview → skill con context: fork
      → Subagent qa-visual toma screenshot via browser-preview MCP
      → Analiza screenshot vs design system
      → Itera si hay discrepancias
   h. Ejecuta visual regression test via skill
   i. Ejecuta accessibility audit via browser-preview MCP
   j. Si pasa todo → /project:smart-commit → commit convencional
   k. Actualiza ticket en Jira via mcp__jira__update_ticket
   l. Si necesita review humano → mcp__slack__send_message

   Hooks reales involucrados:
   ├── PostToolUse (Write|Edit) → prettier + lint
   ├── PostToolUse (mcp__browser-preview__screenshot) → save baseline
   ├── PostToolUseFailure → registrar error en learned-fixes
   └── PermissionRequest (Bash) → auto-aprobar npm test, npm run build
```

### Al cerrar sesión

```
5. Stop hook se activa:
   a. Claude resume decisiones tomadas → .claude/history/decisions/
   b. Claude resume la sesión completa → .claude/history/sessions/
   c. Si detectó errores recurrentes → actualiza learned-fixes
   d. Si una convención nueva emergió → propone regla en .claude/rules/
   e. Si algo contradice CLAUDE.md → flag para revisión humana
   f. TodoWrite: marca tareas completadas en active-plan.md
   g. Registra interacciones cross-tool (tickets, PRs, reviews)

   Hook real (Stop):
   {
     "hooks": {
       "Stop": [{
         "hooks": [{
           "type": "command",
           "command": "vibe session summarize --project $CLAUDE_PROJECT_DIR"
         }]
       }]
     }
   }

   PreCompact hook (antes de compaction automática):
   ├── Guarda checkpoint del estado actual
   ├── Extrae decisiones pendientes antes de que se pierdan
   └── Actualiza .claude/plans/active-plan.md con progreso
```

### Al cambiar de proyecto

```
6. Dev dice: /project:switch acme def

7. La app:
   a. Ejecuta Stop hook del proyecto anterior (summary + cleanup)
   b. Reconfigura .claude/.mcp.json:
      - Desactiva: jira-mcp, confluence-mcp
      - Activa: trello-mcp, notion-mcp
   c. Regenera CLAUDE.md + .claude/rules/ con contexto de DEF
   d. Symlinks de empresa se mantienen (misma empresa)
   e. Carga design system y convenciones de DEF
   f. Filtra historial relevante de DEF
   g. SessionStart hook del nuevo proyecto → inyecta contexto fresco
   h. Claude Code ahora opera con la memoria completa del Proyecto DEF
```

---

## 9. Seguridad y Aislamiento de Datos (con sandbox OS-level)

Multi-empresa implica que los datos de Empresa A nunca deben filtrarse al contexto de Empresa B. Además, Claude Code opera con los mismos permisos que el dev, lo que requiere controles adicionales.

### 9.1. Aislamiento de contexto

```
Empresa A                          Empresa B
┌──────────────────────┐           ┌──────────────────────┐
│ .claude/rules/        │           │ .claude/rules/        │
│ .claude/history/     │           │ .claude/history/     │
│ .claude/skills/      │           │ .claude/skills/      │
│ .claude/.mcp.json    │           │ .claude/.mcp.json    │
│ Credenciales         │    ✕      │ Credenciales         │
│ Learned fixes        │◄──┼──────▶│ Learned fixes        │
│ Decisiones           │    ✕      │ Decisiones           │
└──────────────────────┘           └──────────────────────┘
         │                                    │
         ▼                                    ▼
┌──────────────────────┐           ┌──────────────────────┐
│ .claude/rules/fallback│           │ .claude/rules/fallback│
│ (sin datos sensibles,│◄─────────▶│ (sin datos sensibles,│
│  solo best practices)│    ✓      │  solo best practices)│
└──────────────────────┘           └──────────────────────┘
```

Regla: la única capa compartida entre empresas es el fallback de best practices, que por definición no contiene información de negocio. Las rules de empresa se comparten solo vía symlinks a directorios de la empresa específica.

### 9.2. Sandbox OS-level de Claude Code

```
Claude Code usa sandbox nativo del OS (desde oct 2025):
├── Linux: bubblewrap (containerización con network namespace)
├── macOS: sandbox-exec (seatbelt profiles dinámicos)
├── Reduce permission prompts en 84%
└── Ambos cubren: filesystem isolation + network isolation

Nuestra plataforma COOPERA con el sandbox:
├── Todo lo que Claude necesita está EN el proyecto (.claude/)
├── Lo que está fuera → accesible solo vía MCP servers
│   (MCP servers corren FUERA del sandbox como procesos separados)
├── Generamos .claude/settings.json con permissions apropiados:
│   {
│     "permissions": {
│       "allow": [
│         "Read(.claude/**)",
│         "Write(.claude/history/**)",
│         "Bash(vibe:*)",
│         "Bash(npm test*)",
│         "Bash(npm run build*)"
│       ],
│       "deny": [
│         "Read(.env)",
│         "Read(**/.env.*)",
│         "Bash(rm -rf:*)",
│         "Bash(curl:*)"
│       ]
│     }
│   }
└── MCP servers se pueden sandboxear individualmente con srt:
    srt --allow-write=".claude/baselines" \
        --deny-write="src" \
        vibe mcp browser-preview
```

### 9.3. Gestión de credenciales

```
Estrategia por capas:
├── Secrets vault (HashiCorp Vault, 1Password, AWS Secrets Manager)
├── Al hacer /project:switch → inyecta env vars correctas via hook
├── MCP servers se autentican con env vars (nunca hardcoded)
├── Rotación automática con TTL
├── Principio de mínimo privilegio por MCP server
└── NUNCA en filesystem plano (.env bloqueado en permissions.deny)

SessionStart hook inyecta credenciales:
  vibe context inject --project $CLAUDE_PROJECT_DIR
  → Consulta vault → obtiene credenciales
  → Escribe a CLAUDE_ENV_FILE (variable de SessionStart)
  → MCP servers leen de env vars
  → Al hacer switch → vars se limpian y reemplazan
```

### 9.4. Managed settings para enterprise

```
Las organizaciones pueden desplegar configuración centralizada:
├── managed-settings.json (desplegado via MDM/Ansible/Group Policy)
├── Aplica a todos los devs de la organización
├── No se puede override por el dev

Controles enterprise:
{
  "strictKnownMarketplaces": [
    "vibe-dev/vibe-plugins"        ← solo plugins aprobados
  ],
  "allowManagedHooksOnly": true,   ← solo hooks aprobados por IT
  "allowedMcpServers": [
    "github-mcp", "slack-mcp", "vibe-*"
  ],
  "deniedMcpServers": [
    "filesystem"                    ← no acceso directo al FS
  ],
  "permissions": {
    "deny": [
      "WebFetch",                   ← no fetch a URLs arbitrarias
      "Bash(docker run:*)",
      "Bash(curl:*)"
    ]
  }
}
```

### 9.5. Sanitización del historial

Los learned-fixes y decisiones pueden contener información sensible:

- Se almacenan por proyecto y nunca se promueven sin sanitización
- La promoción entre niveles filtra datos sensibles (API keys, URLs internas)
- Resúmenes de sesión cifrados at-rest
- Al eliminar proyecto/empresa: crypto-shredding completo
- Prompt hooks pueden validar que output no contenga secrets

### 9.6. Auditoría

```
Registro inmutable de quién accedió a qué contexto y cuándo.
Implementado via hooks (PostToolUse, PermissionRequest):

[2026-02-10 09:15] SessionStart → project: acme/abc, mcp: github, slack, jira
[2026-02-10 09:16] Read → CLAUDE.md, .claude/rules/frontend/react.md
[2026-02-10 09:20] mcp__jira__read_ticket → PROJ-123
[2026-02-10 09:45] Write → src/components/PricingCard.tsx
[2026-02-10 10:30] mcp__github__create_pr → PR #45
[2026-02-10 11:00] SessionEnd → context cleared, summary generated

Enterprise: audit logs enviados a SIEM externo via hook.
```

---

## 10. Onboarding y Bootstrap (plugin-based)

¿Cómo se da de alta una nueva empresa o proyecto? La velocidad de setup es crítica para la adopción. El onboarding ahora se basa en **plugins** y **template packs** instalables.

### 10.1. Bootstrap de empresa

```
vibe enterprise init "Acme Corp"

Wizard interactivo (CLI o Web UI):
  1. Herramientas globales:
     ├── ¿Repositorio? → GitHub (org: acme-corp)
     ├── ¿Comunicación? → Slack (workspace: acme)
     ├── ¿Diseño? → Figma (team: acme-design)
     └── ¿Otras? → (agregar más)

  2. Credenciales (vault-backed):
     ├── GitHub PAT → almacenado en vault (nunca en filesystem)
     ├── Slack token → vault
     └── Figma API key → vault

  3. Convenciones (o usar fallbacks):
     ├── Branching strategy: → Trunk Based (fallback)
     ├── Commit format: → Conventional Commits (fallback)
     ├── Code review: → ¿Definir custom o usar fallback?
     └── Linting/formatting: → ¿Definir custom o usar fallback?

  4. La app genera:
     ├── Perfil de empresa en ~/.vibe/db/
     ├── Credenciales registradas en vault
     ├── Directorio compartido de rules:
     │   ~/shared-claude-rules/acme/
     │   ├── tools.md
     │   ├── code-review.md
     │   ├── security-policy.md
     │   └── communication.md
     ├── MCP server configs base para herramientas globales
     └── Opción: crear marketplace privado de empresa:
         github.com/acme-corp/claude-plugins/.claude-plugin/marketplace.json
```

### 10.2. Bootstrap de proyecto

```
cd ~/work/acme-corp/web-app
vibe project init

Wizard interactivo:
  1. Tipo de proyecto:
     ├── Frontend (React, Vue, Svelte, etc.)
     ├── Backend (Node, Python, Go, etc.)
     ├── Fullstack
     └── Mobile / Otro

  2. Stack (auto-detectado si ya existe código):
     ├── Framework: → Next.js 15 (detectado de package.json)
     ├── Styling: → Tailwind CSS (detectado)
     ├── State: → Zustand (detectado)
     └── Testing: → Vitest + Playwright (detectado)

  3. Herramientas (heredar de empresa o override):
     ├── Gestión de tareas: → Jira (hereda empresa) / Trello (override)
     ├── Documentación: → Confluence / Notion / Markdown
     ├── CI/CD: → GitHub Actions / Jenkins
     └── ¿Tiene frontend? → Sí → activar Browser Preview + Design Tokens

  4. Design system (si frontend):
     ├── ¿Importar de Figma? → Sí → conectar Figma API
     ├── ¿Existente? → cargar tokens
     └── ¿Nuevo? → generar template base desde fallback

  5. La app genera:
     ├── .claude/ directory completo:
     │   ├── CLAUDE.md             ← lean router (~100-150 líneas)
     │   ├── rules/
     │   │   ├── fallback/         ← template pack (copiado)
     │   │   ├── enterprise/       ← symlink → ~/shared-claude-rules/acme/
     │   │   └── project/          ← rules específicas del proyecto
     │   ├── docs/                 ← design-system.md, architecture.md, etc.
     │   ├── skills/               ← apropiados para el stack
     │   ├── agents/               ← subagents relevantes
     │   ├── plans/                ← directorio vacío para Plan Mode
     │   ├── history/              ← directorio vacío para historial
     │   ├── settings.json         ← hooks, permissions, config
     │   └── .mcp.json             ← MCP servers activados
     │
     ├── Instala plugins relevantes:
     │   /plugin marketplace add vibe-dev/vibe-plugins
     │   /plugin install core@vibe-dev/vibe-plugins
     │   /plugin install frontend@vibe-dev/vibe-plugins  (si frontend)
     │
     └── Primer commit: "chore: bootstrap vibe project context"
```

### 10.3. Auto-detección (scan inteligente)

Si el proyecto ya tiene código, la app escanea e infiere en paralelo (usando Task subagents):

```
vibe project scan

Detección automática:
├── package.json          → stack frontend, dependencias, scripts
├── Dockerfile            → infraestructura
├── .github/workflows/    → CI/CD existente
├── tsconfig.json         → convenciones TypeScript
├── eslint.config.*       → convenciones de linting
├── .prettierrc           → formatting rules
├── tailwind.config.*     → design tokens existentes
├── .env.example          → variables de entorno necesarias
├── README.md             → documentación existente → alimenta contexto
├── turbo.json / pnpm-workspace.yaml → detección de monorepo
├── Storybook config      → component catalog existente
└── Existing .cursor/rules/ → migración automática de rules de Cursor

Migración de herramientas existentes:
├── .cursorrules / .cursor/rules/ → .claude/rules/ (conversión automática)
├── AGENTS.md → symlink bidireccional con CLAUDE.md
├── .github/copilot-instructions.md → incorporar a .claude/rules/
└── Existing CLAUDE.md → respetar y enriquecer, no sobreescribir
```

### 10.4. Setup hook automático

```
El Setup hook de Claude Code (via --init flag) se integra:

vibe project init ejecuta internamente:
  claude --init  → trigger Setup hook → genera contexto base
  
  Hook de Setup:
  {
    "hooks": {
      "Setup": [{
        "hooks": [{
          "type": "command",
          "command": "vibe context generate --auto-detect"
        }]
      }]
    }
  }

Esto permite que `claude --init` en cualquier proyecto con vibe
genere automáticamente todo el contexto necesario.
```

---

## 11. Colaboración Multi-Desarrollador

Cuando varios devs trabajan en el mismo proyecto con Claude Code simultáneamente, surgen problemas de concurrencia y consistencia.

### 11.1. El problema

```
Dev A (sesión 1):                    Dev B (sesión 2):
"Implementa pricing con CSS Grid"   "Implementa dashboard con Flexbox"
  ├── Decide: CSS Grid para layouts    ├── Decide: Flexbox para layouts
  ├── Genera learned-fix              ├── Genera learned-fix
  └── Guarda decisión                 └── Guarda decisión
                                      
         ¿Conflicto! ¿Grid o Flex?
```

### 11.2. Estrategias de resolución

**Separación por feature/branch:**

Cada dev trabaja en un branch distinto. Las decisiones se asocian al branch, no al proyecto global. Al hacer merge, la app detecta conflictos de decisiones y pide resolución humana.

```
.claude/history/decisions/
├── main/
│   └── 2026-02-05-api-versioning.md        ← decisión global
├── feature/pricing-cards/                   ← branch de Dev A
│   └── 2026-02-08-css-grid-layout.md
└── feature/dashboard-redesign/              ← branch de Dev B
    └── 2026-02-08-flexbox-layout.md
```

**Locking de contexto:**

Para decisiones que afectan al proyecto globalmente (arquitectura, convenciones), la app implementa un lock advisory:

```
Dev A ejecuta: /decide "Usamos CSS Grid para todos los layouts"
  → La app registra la decisión con lock
  → Dev B es notificado: "Dev A decidió: CSS Grid para layouts"
  → El contexto de Dev B se actualiza automáticamente
```

**Merge de historial:**

Al hacer merge de branches, la app:
1. Compara decisiones de ambas ramas
2. Auto-merge las que no conflictúan
3. Flagea las que se contradicen
4. Presenta al equipo para resolución

### 11.3. Contexto compartido vs individual

```
Compartido (proyecto, en repo):        Individual (dev, en ~/.claude/):
├── CLAUDE.md (lean router)            ├── ~/.claude/rules/ (preferencias)
├── .claude/rules/ (todas)             ├── ~/.claude/commands/ (personal)
├── Decisiones globales                ├── Sesiones propias
├── Learned fixes                      └── Historial de interacción
├── Design system
└── Plans y convenciones
```

Las preferencias individuales (en `~/.claude/rules/`) se cargan con menor prioridad que las del proyecto. Las reglas del proyecto son inmutables desde la sesión individual. Un dev puede tener sus propios slash commands en `~/.claude/commands/`, pero las convenciones del proyecto mandan.

---

## 12. Gestión de Costos y Tokens

Claude Code con Opus consume tokens rápidamente. Con múltiples empresas y proyectos, el gasto escala y necesita control. Ahora incluye costos de Agent SDK (CI/CD workers) y prompt hooks (Haiku).

### 12.1. Optimización de contexto inyectado

No todo el contexto necesita ir al context window. La app optimiza qué se carga:

```
Prioridad de carga (con rules path-scoping + tool search):

1. CLAUDE.md lean router                  → siempre (~3K tokens)
2. .claude/rules/ globales                → siempre (~2K tokens)
3. .claude/rules/ path-scoped             → solo las que matchean (~3K)
4. Learned fixes relevantes               → siempre (previene errores)
5. Última sesión del feature actual        → si existe
6. Decisiones recientes (score > 0.7)     → filtrado por relevancia
7. Design system completo                  → solo si tarea es frontend
8. Active plan                             → si existe (.claude/plans/)
9. MCP tool definitions                    → defer_loading para no-esenciales

Progressive disclosure reduce la inyección inicial:
├── CLAUDE.md: de ~8K a ~3K tokens (lean router)
├── Rules path-scoped: solo relevantes (~3K vs ~8K si fueran todas)
├── MCP tools: defer_loading reduce de ~50K a ~3K
├── Skills: solo descripción, contenido bajo demanda
└── Total ahorro: ~55K tokens por sesión
```

### 12.2. Estrategia Opus vs Sonnet vs Haiku

```
Modelo          Uso                          Costo relativo
──────          ───                          ──────────────
Opus 4.5/4.6    Decisiones arquitectónicas   $$$
                Planificación compleja
                Code review profundo
                Resolución de bugs difíciles
                Análisis de screenshots

Sonnet 4.5      Implementación directa       $$
                Fixes simples
                Generación de tests
                Documentación
                Tareas repetitivas
                Background workers (Agent SDK)

Haiku 4.5       Prompt hooks (security,      $
                convention validation)
                Quick classification tasks
                Session summary extraction
                Tool search evaluation

La plataforma configura automáticamente:
├── Prompt hooks usan Haiku (rápido, barato, suficiente para validación)
├── CI/CD workers usan Sonnet via Agent SDK (buen balance costo/calidad)
├── Sesiones interactivas: Opus por defecto, Sonnet para tareas simples
└── El dev puede forzar modelo con configuración del proyecto
```

### 12.3. Tracking de costos (incluyendo Agent SDK + hooks)

```
Dashboard de costos:

Empresa: Acme Corp
├── Proyecto ABC
│   ├── Febrero 2026: $142.50
│   │   ├── Opus (interactivo): $78.00 (12 sesiones)
│   │   ├── Sonnet (interactivo): $34.50 (28 sesiones)
│   │   ├── Sonnet (Agent SDK CI): $18.00 (45 CI runs)
│   │   ├── Haiku (prompt hooks): $2.00 (~800 evaluaciones)
│   │   └── Promedio por feature: $18.30
│   └── Trend: ↓ 12% vs enero (mejor contexto = menos iteraciones)
│
├── Proyecto DEF
│   ├── Febrero 2026: $87.20
│   └── Trend: ↑ 5% (nuevo feature complejo)
│
└── Total empresa: $229.70
    Budget: $300/mes
    Restante: $70.30
```

**Métricas de eficiencia:**
- Tokens por feature completado
- Iteraciones promedio antes de éxito
- Ratio Opus/Sonnet por tipo de task
- Costo por línea de código productivo (merged)

---

## 13. Resiliencia y Modo Degradado

Los MCP servers dependen de servicios externos que pueden fallar. La app debe seguir funcionando.

### 13.1. Niveles de degradación

```
Nivel 0 — Todo funciona:
  Todos los MCP servers activos, contexto completo cargado.

Nivel 1 — MCP server de herramienta caído (ej: Jira no responde):
  ├── Claude Code sigue trabajando
  ├── Skill "crear-ticket" detecta que Jira MCP no responde
  ├── Fallback: crear ticket como archivo local (markdown)
  ├── Cola de sincronización: cuando Jira vuelva, sync pendientes
  └── Notificación al dev: "Jira no disponible, trabajando offline"

Nivel 2 — MCP server de frontend caído (Browser Preview):
  ├── Claude Code genera código normalmente
  ├── No puede validar visualmente
  ├── Fallback: ejecutar tests automatizados (unit, lint, type-check)
  ├── Marcar output como "pendiente de validación visual"
  └── Cuando Browser Preview vuelva, ejecutar validación en lote

Nivel 3 — Múltiples servicios caídos:
  ├── Claude Code trabaja solo con contexto estático (CLAUDE.md + docs)
  ├── Sin acceso a historial dinámico ni herramientas
  ├── Modo "offline productivo": genera código, documenta decisiones
  └── Todo se sincroniza cuando los servicios se restauran
```

### 13.2. Health checks, circuit breakers, y PostToolUseFailure hooks

```
MCP Server Manager + PostToolUseFailure hooks:
├── Health check cada 30 segundos por MCP server activo
├── defer_loading servers: health check solo cuando se activan
├── Circuit breaker: 3 fallos consecutivos → desactivar server
├── Retry con exponential backoff
├── PostToolUseFailure hook: registra fallo + determina fallback
│
│   Hook configuración:
│   {
│     "hooks": {
│       "PostToolUseFailure": [{
│         "matcher": "mcp__*",
│         "hooks": [{
│           "type": "command",
│           "command": "vibe mcp handle-failure --tool $TOOL_NAME"
│         }]
│       }]
│     }
│   }
│
├── Status visible con vibe status:
│
│   MCP Servers Status:
│   ├── github-mcp      ● Online   (latency: 45ms)
│   ├── slack-mcp       ● Online   (latency: 120ms)
│   ├── jira-mcp        ○ Offline  (since 10:15, retrying in 30s)
│   ├── browser-preview  ● Online   (latency: 200ms)  [defer_loading]
│   └── design-tokens    ● Online   (latency: 30ms)   [defer_loading]
│
└── Learned-fix automático: si un MCP server falla frecuentemente,
    se registra en .claude/history/patterns/ para awareness futuro
```

### 13.3. Cola de sincronización

Cuando un servicio se recupera, las acciones pendientes se ejecutan en orden:

```
Jira vuelve online:
  1. Crear ticket PROJ-124 (pendiente desde 10:20)
  2. Actualizar ticket PROJ-123 a "In Review" (pendiente desde 10:35)
  3. Agregar comentario en PROJ-123 (pendiente desde 10:40)
  → Todo sincronizado, notificar al dev
```

---

## 14. Versionado del Contexto

El contexto (CLAUDE.md, `.claude/rules/`, design systems, convenciones) evoluciona. Necesita control de versiones, rollback, y trazabilidad.

### 14.1. Versionado con Git

Todo el directorio `.claude/` vive en el repo del proyecto y se versiona con Git. Esto da automáticamente: historial de cambios, diff entre versiones, rollback, branches, y blame.

```
git log --oneline .claude/

a1b2c3d chore: update design-system tokens from Figma sync
d4e5f6g feat: add learned-fix for CORS configuration
h7i8j9k refactor: promote accessibility audit to enterprise rules
l0m1n2o fix: rollback rules/frontend/react.md — degraded output
p3q4r5s feat: add path-scoped rules for backend/api.md
```

Archivos versionados:
├── CLAUDE.md (lean router)
├── .claude/rules/**/*.md (incluyendo path-scoped)
├── .claude/docs/**/*.md
├── .claude/history/ (decisions, sessions, patterns)
├── .claude/skills/ (incluyendo SKILL.md frontmatter)
├── .claude/agents/*.md
├── .claude/plans/*.md
├── .claude/settings.json (hooks, permissions)
└── .claude/.mcp.json (MCP server configs)

NO versionados (en .gitignore):
├── .claude/baselines/ (binarios, usar Git LFS si se quieren)
├── .claude/cache/
└── Credenciales (siempre en vault, nunca en repo)

### 14.2. Rollback de contexto

Si una actualización del contexto empeora la calidad del output de Claude:

```
/context rollback

La app:
  1. Muestra últimos cambios al contexto con sus métricas:
     ├── a1b2c3d (hace 2h) — design tokens update
     │   Métricas post-cambio: ↓ iteraciones frontend +15%
     ├── d4e5f6g (hace 1d) — learned-fix CORS
     │   Métricas post-cambio: ✓ sin cambio significativo
     └── h7i8j9k (hace 3d) — promote accessibility
         Métricas post-cambio: ✓ mejora en audits

  2. Dev selecciona: rollback a1b2c3d
  3. La app revierte el CLAUDE.md y docs a la versión anterior
  4. Git commit: "revert: rollback design tokens — degraded output"
```

### 14.3. Diff de contexto

Antes de aplicar cambios al contexto, la app muestra qué va a cambiar:

```
/context diff

Cambios pendientes en CLAUDE.md:
  + Convención: usar CSS custom properties en vez de Tailwind para theming
  - Convención: usar Tailwind para todo el styling
  ~ Actualización: design tokens v2.1 → v2.3 (12 tokens cambiados)

¿Aplicar? [sí/no/ver detalle]
```

---

## 15. Métricas y Observabilidad

Sin métricas, no se puede saber si el sistema mejora o empeora con el tiempo.

### 15.1. Métricas de calidad de output

```
Por proyecto:
├── Iteraciones promedio antes de validación exitosa (frontend)
│   ├── Screenshot pass: 1.3 iteraciones (meta: < 2)
│   ├── Visual regression: 1.1 iteraciones
│   └── E2E tests: 1.8 iteraciones
│
├── Tasa de PRs aprobados en primer intento
│   ├── Este mes: 72% (meta: > 80%)
│   └── Trend: ↑ 8% vs mes anterior
│
├── Errores recurrentes (learned-fixes)
│   ├── Nuevos este mes: 3
│   ├── Resueltos (no se repiten): 12
│   └── Tasa de reincidencia: 8% (meta: < 5%)
│
└── Cobertura de contexto
    ├── Decisiones documentadas vs implícitas: 85%/15%
    └── Sesiones con resumen guardado: 94%
```

### 15.2. Métricas de productividad

```
Por proyecto:
├── Features completados por semana
├── Tiempo promedio por feature (con Claude Code)
├── Ratio de código generado vs escrito manualmente
├── Tiempo en validación visual vs codificación
└── Tiempo ahorrado vs baseline (estimado)

Por empresa:
├── Proyectos activos
├── Devs activos
├── Costo total vs features entregados
└── ROI estimado de la herramienta
```

### 15.3. Métricas del sistema de contexto

```
Salud del contexto:
├── Tamaño promedio del CLAUDE.md: 8.2 KB (meta: < 15 KB)
├── Historial de decisiones: 47 entries, 12 activas (score > 0.7)
├── Learned fixes: 15 activos, 3 promovidos a empresa
├── Relevance scoring accuracy:
│   ├── Decisiones incluidas que fueron útiles: 89%
│   └── Decisiones excluidas que se necesitaban: 4%
│
└── Propagación de conocimiento:
    ├── Patrones promovidos proyecto → empresa: 5
    ├── Patrones promovidos empresa → fallback: 1
    └── Rollbacks de contexto este mes: 2
```

### 15.4. Dashboard

La app expone un dashboard con estas métricas, con vistas por empresa, proyecto, dev, y rango de tiempo. Alertas automáticas cuando una métrica se degrada significativamente.

---

## 16. Modelo de Datos y Persistencia

Todo el metadata necesita un hogar. La estrategia es híbrida: Git para contexto versionable, base de datos para metadata operativo.

### 16.1. En Git (versionado, distribuido)

Todo lo que Claude Code consume directamente:

```
proyecto/
├── CLAUDE.md
├── .claude/
│   ├── docs/          ← design-system, architecture, ux-patterns
│   ├── history/       ← decisions, sessions, patterns
│   ├── skills/        ← SKILL.md files
│   ├── commands/      ← slash commands
│   └── agents/        ← subagent definitions
```

Ventajas: versionado nativo, diffs, rollback, funciona offline, cada dev tiene una copia.

### 16.2. En base de datos (operativo, consultable)

Metadata que la app necesita para gestionar el sistema:

```
Entidades principales:

Enterprise
├── id, name, slug
├── credentials_vault_path
├── global_tools: [{ capability, tool, mcp_config }]
├── conventions: { branching, commits, review, ... }
└── created_at, updated_at

Project
├── id, enterprise_id, name, slug
├── type: frontend | backend | fullstack | mobile
├── stack: { framework, language, styling, testing, ... }
├── tools: [{ capability, tool, mcp_config, overrides_enterprise }]
├── credentials_vault_path
├── repo_url, branch_default
└── created_at, updated_at

Developer
├── id, name, email
├── enterprise_memberships: [{ enterprise_id, role }]
├── project_memberships: [{ project_id, role }]
├── preferences: { model_preference, custom_commands, ... }
└── created_at, updated_at

Session
├── id, project_id, developer_id
├── scope: feature | bug | spike | exploration
├── branch, ticket_id
├── started_at, ended_at
├── summary_path (→ git)
├── decisions_extracted: [decision_ids]
├── tokens_used: { opus, sonnet }
└── cost

Decision
├── id, project_id, session_id
├── type: explicit | implicit | promoted
├── title, description
├── scope: component | module | project | enterprise
├── impact: low | medium | high | critical
├── status: active | superseded | rolled_back
├── promoted_to: enterprise_id | null
└── created_at

LearnedFix
├── id, project_id
├── error_pattern, fix_description
├── occurrences: [{ session_id, date }]
├── times_detected, last_detected
├── promoted_to: enterprise_id | null
└── status: active | resolved | promoted

ToolInteraction
├── id, session_id, project_id
├── tool: jira | github | slack | browser_preview | ...
├── action: read | create | update | delete
├── reference: ticket_id | pr_id | commit_sha | ...
├── result: success | failure | pending
├── metadata: { ... }
└── timestamp

CostRecord
├── id, session_id, project_id, enterprise_id
├── model: opus | sonnet
├── tokens_input, tokens_output
├── cost_usd
└── timestamp
```

### 16.3. Sincronización Git ↔ DB

La base de datos es la fuente de verdad para metadata operativo. Git es la fuente de verdad para el contenido del contexto. La app sincroniza en ambas direcciones:

```
Al crear una decisión:
  1. La app crea el archivo .md en .claude/history/decisions/
  2. Git commit automático
  3. Registro en DB con ruta al archivo y metadata

Al consultar decisiones relevantes:
  1. Query a DB con filtros de relevancia (scoring)
  2. Lee los archivos .md de Git para el contenido completo
  3. Inyecta en el contexto de Claude Code
```

---

## 17. Interfaz de la App

La app tiene dos interfaces complementarias: CLI para el flujo de trabajo diario y Web UI para gestión y observabilidad.

### 17.1. CLI (flujo de trabajo)

La interfaz principal del dev. Se integra con Claude Code y se ejecuta desde la terminal.

```
Comandos principales:

vibe switch <empresa> <proyecto>    Cambiar de contexto
vibe bootstrap empresa <nombre>     Setup de nueva empresa
vibe bootstrap proyecto <nombre>    Setup de nuevo proyecto
vibe status                         Estado actual (MCP, herramientas, branch)
vibe context diff                   Ver cambios pendientes al contexto
vibe context rollback               Revertir último cambio de contexto
vibe history decisions              Listar decisiones activas
vibe history sessions               Listar resúmenes de sesiones
vibe metrics                        Métricas rápidas del proyecto
vibe cost                           Resumen de costos del mes
vibe health                         Estado de MCP servers
vibe migrate <tool-from> <tool-to>  Migrar herramienta
```

El CLI también instala los slash commands de Claude Code, así que dentro de Claude Code se usa `/switch`, `/status`, etc.

### 17.2. Web UI (gestión y observabilidad)

Dashboard web para gestión a nivel empresa y observabilidad del sistema.

```
Secciones:

Home
├── Resumen de actividad reciente
├── Alertas (MCP caído, budget cerca del límite, métricas degradadas)
└── Accesos rápidos a proyectos recientes

Empresas
├── Lista de empresas
├── Configuración de herramientas globales
├── Convenciones de empresa
├── Gestión de credenciales (vault UI)
└── Devs asignados y roles

Proyectos
├── Lista de proyectos por empresa
├── Configuración de stack y herramientas
├── Design system viewer (tokens, componentes)
├── Historial de decisiones (timeline visual)
├── Learned fixes activos
└── Estado de MCP servers

Métricas
├── Dashboard por empresa / proyecto / dev
├── Calidad de output (iteraciones, PR approvals)
├── Costos (por empresa, proyecto, modelo)
├── Salud del contexto (tamaño, relevancia, propagación)
└── Tendencias y comparativas

Contexto
├── Editor visual de CLAUDE.md
├── Diff viewer para cambios de contexto
├── Historial de versiones con rollback
├── Promoción de conocimiento (proyecto → empresa → fallback)
└── Gestión de learned-fixes
```

### 17.3. Notificaciones

La app notifica al dev a través del canal que prefiera:

```
Canales:
├── Slack DM      → cambios de contexto, decisiones de otros devs
├── Terminal      → estado de MCP servers, alertas de sesión
├── Web UI        → métricas, costos, alertas de sistema
└── Email digest  → resumen semanal de actividad y métricas
```

---

## 18. Migración de Herramientas

Cuando un proyecto migra de una herramienta a otra (Jira → Linear, Confluence → Notion), el contexto e historial no deben perderse.

### 18.1. Proceso de migración

```
/migrate acme abc task-management jira linear

La app:
  1. Inventario:
     ├── Tickets activos en Jira: 23
     ├── Decisiones que referencian Jira: 8
     ├── Learned-fixes que referencian Jira: 2
     ├── Skills que usan Jira MCP: 1 (crear-ticket)
     └── Interacciones históricas con Jira: 156

  2. Migración de datos (si aplica):
     ├── Exportar tickets activos de Jira
     └── Importar a Linear (con mapping de estados)

  3. Actualización de contexto:
     ├── Proyecto: task-management → linear (en DB)
     ├── MCP servers: desactivar jira-mcp, activar linear-mcp
     ├── Credenciales: agregar Linear API key al vault
     ├── CLAUDE.md: actualizar referencia de Jira a Linear
     └── Skills: crear-ticket ya funciona (polimórfico por capacidad)

  4. Actualización de historial:
     ├── Decisiones: agregar nota "migrado de Jira a Linear"
     ├── Learned-fixes: actualizar referencias si son específicas de Jira
     ├── Interacciones históricas: mantener como están (Jira era la tool)
     └── Nuevas interacciones: registrar con Linear

  5. Verificación:
     ├── Test: /crear-ticket en Linear → funciona
     ├── Test: leer tickets de Linear → funciona
     └── Marcar migración como completada
```

### 18.2. Compatibilidad hacia atrás

El historial mantiene las referencias originales. Si una decisión dice "ver ticket PROJ-123 en Jira", la app puede mostrar un badge indicando que el proyecto migró a Linear y el ticket ahora está en otro ID.

```
Decisión: 2026-02-08-pricing-layout.md
  Referencia original: Jira PROJ-123
  Estado post-migración: → Linear ABC-456 (migrado 2026-02-10)
```

### 18.3. Migración parcial

No todas las migraciones son completas. Un proyecto podría usar Jira para bugs y Linear para features. El modelo por capacidades soporta esto naturalmente:

```
Proyecto ABC:
├── Gestión de tareas (bugs)      → Jira
├── Gestión de tareas (features)  → Linear
└── El skill crear-ticket pregunta: ¿es bug o feature?
    → Rutea al MCP server correcto
```

---

## 19. Arquitectura del Sistema (no es un simple back + front)

Esto no es una app web tradicional con un backend REST y un frontend React. Es una **plataforma de developer tooling** — un ecosistema de piezas que se orquestan juntas.

### 19.1. Las 7 piezas del sistema

**1. CLI Tool (el corazón del flujo diario)**

Lo que el dev usa directamente. No es un wrapper trivial — es un proceso local que orquesta Claude Code, gestiona contexto, interactúa con el vault, y genera archivos. Comparable a `turbo`, `nx`, o el propio `claude` CLI.

```
vibe project switch acme abc
→ no es un HTTP request a un backend
→ es un proceso local que:
   1. Lee config de ~/.vibe/db/ (registry de proyectos)
   2. Consulta vault por credenciales
   3. Genera CLAUDE.md lean + .claude/rules/ (modulares)
   4. Configura .claude/.mcp.json + .claude/settings.json
   5. Instala/actualiza plugins si necesario
   6. Invoca hooks de Setup si es primera vez
```

**2. Context Engine (librería core)**

La lógica central: resuelve jerarquía de contexto (3 niveles), merge en rules modulares con path-scoping, calcula relevancia del historial, genera los archivos que Claude Code consume. Es una **librería**, no un servicio. Lo consumen tanto el CLI como la Web UI.

**3. MCP Servers (procesos independientes)**

Cada MCP server es un proceso aparte que corre **fuera del sandbox** de Claude Code. Algunos ya existen (GitHub, Slack, Playwright), otros se construyen custom (browser preview, design tokens, project context, history). Se configuran en `.claude/.mcp.json` del proyecto.

**4. Web UI + API (gestión y observabilidad)**

App web cuyo rol es de **administración**, no de flujo de trabajo principal. CRUD de empresas/proyectos, dashboard de métricas, gestión de credenciales, visualización de historial. El dev no necesita la web abierta para trabajar día a día.

**5. Plugins (distribución de capabilities)**

La plataforma se distribuye como un **marketplace de plugins**. Cada plugin bundlea skills + agents + hooks + MCP configs. Se instalan con `/plugin install`. Se actualizan automáticamente. Enterprise puede restringir a marketplaces aprobados via `strictKnownMarketplaces`.

**6. Background Workers (procesos asíncronos)**

Procesos que ejecutan trabajo fuera del flujo principal: sincronización de colas, cálculo de métricas, detección de patrones, rotación de credenciales, y tareas pesadas de larga duración.

**7. Agent SDK Integration (programmatic Claude Code)**

Para CI/CD, workers, y automation, usamos el **Claude Agent SDK** (TypeScript/Python) que expone el mismo motor de Claude Code como librería programática. Permite ejecutar agentes con tools, MCP servers, hooks, y permissions controlados.

### 19.2. Cómo se relacionan

```
Developer
    │
    ▼
┌─────────┐     ┌──────────────┐
│  CLI    │────▶│ Context      │ ← librería core, no servicio
│  (vibe) │     │ Engine       │
└────┬────┘     └──────┬───────┘
     │                 │
     │    ┌────────────▼────────────┐
     │    │  Filesystem (.claude/)   │
     │    │  CLAUDE.md (lean router) │
     │    │  rules/ (path-scoped)   │
     │    │  skills/, agents/       │
     │    │  plans/, history/       │
     │    │  settings.json, .mcp.json│
     │    └────────────┬────────────┘
     │                 │
     ▼                 ▼
┌─────────┐     ┌──────────────┐      ┌─────────────────────┐
│ Claude  │◄───▶│ MCP Servers  │      │ Background Workers  │
│ Code    │     │ (fuera del   │      │ (Agent SDK-powered) │
│ (sandbox│     │  sandbox)    │      │ (async, queued)     │
│  activo)│     └──────────────┘      └──────────┬──────────┘
└─────────┘                                       │
                                                  │
     ┌─────────────────────────────┐              │
     │  Web UI + API               │◄─────────────┘
     │  (gestión, métricas,        │
     │   credenciales, job status) │
     └──────────────┬──────────────┘
                    │
     ┌──────────────▼──────────────┐
     │  Persistence Layer          │
     │  ├── SQLite/Postgres (DB)   │
     │  ├── Vault (secrets)        │
     │  ├── BullMQ/Redis (queue)   │
     │  └── Marketplace (GitHub)   │
     └─────────────────────────────┘
```

### 19.3. Decisiones técnicas clave

**¿Monorepo o repos separados?** Monorepo con workspaces (turborepo). Con tantas piezas (CLI, context engine, MCP servers, web UI, workers, plugins), turborepo maneja builds y dependencias. El context engine es un package compartido que importan CLI, Web API, y workers.

**¿TypeScript everywhere?** Claude Code es Node/TS, el Agent SDK tiene TS SDK nativo, los MCP servers se construyen en TS, el CLI natural en TS. La Web UI en Next.js. Un solo lenguaje, tipos compartidos, el context engine como package interno.

**¿Dónde vive la base de datos?** Para un dev solo o equipo pequeño: SQLite local en `~/.vibe/db/` (elimina dependencia de servidor). Para equipos distribuidos: Postgres. La web UI podría correr local (como Storybook o Prisma Studio) o ser un servicio desplegado.

**¿Local-first o cloud-first?** Local-first como default: el dev tiene todo en su máquina (CLI, context engine, DB local, MCP servers). La web UI corre en localhost. Más simple, más privado. Opción cloud para equipos que necesitan colaboración multi-dev real con servidor central.

**¿Cómo se distribuye?** `npm install -g @vibe/cli` instala CLI + context engine. Plugins via marketplace: `/plugin marketplace add vibe-dev/vibe-plugins`. MCP servers como dependencias del CLI. Web UI se levanta con `vibe dashboard`. Skills y hooks se instalan via plugins o se generan con `vibe project init`.

---

## 20. Gestión de Tareas Pesadas y Background Processing

No todas las operaciones son instantáneas. Muchas tareas de esta plataforma son pesadas, toman tiempo, o dependen de servicios externos lentos. Necesitan ejecutarse en background con un sistema de colas, reintentos, y notificaciones.

### 20.1. Identificación de tareas pesadas

```
Tareas por duración estimada:

Instantáneas (< 2s):
├── /switch empresa proyecto          → cambio de contexto local
├── /status                           → lectura de estado
└── Lectura de CLAUDE.md, historial   → filesystem local

Cortas (2s - 30s):
├── Screenshot + análisis visual      → browser preview MCP
├── Crear/actualizar ticket           → API de Jira/Linear
├── Commit + push                     → Git
└── Consulta de design tokens         → Figma API

Medias (30s - 5min):
├── Visual regression test completo   → Chromatic/Percy
├── Suite de E2E tests                → Playwright
├── Bootstrap de proyecto nuevo       → scaffold + APIs + vault
├── Sync de design tokens desde Figma → API + procesamiento
├── Análisis de sesión (post-session) → Claude API para resumir
└── Migración parcial de herramienta  → export/import APIs

Largas (5min - 30min+):
├── Visual regression de toda la app  → cientos de screenshots
├── Migración completa de herramienta → miles de tickets/docs
├── Cálculo de métricas históricas    → procesamiento masivo
├── Reindexación de historial         → re-scoring de decisiones
├── Importación de design system      → Figma API rate-limited
├── Auditoría de seguridad completa   → scan de credenciales + deps
└── Análisis de patrones para         → procesamiento de todo
    promoción de conocimiento             el historial cross-proyecto
```

### 20.2. Arquitectura del sistema de colas

```
┌─────────────────────────────────────────────────────────────────┐
│                     TASK QUEUE SYSTEM                            │
│                                                                 │
│  ┌──────────┐    ┌──────────────┐    ┌───────────────────────┐  │
│  │ Producer │    │    Queue     │    │     Workers           │  │
│  │          │    │              │    │                       │  │
│  │ CLI      │───▶│ ┌──────────┐│    │  ┌─────────────────┐  │  │
│  │ Web UI   │    │ │ Critical ││───▶│  │ Sync Worker     │  │  │
│  │ Hooks    │    │ │ (sync,   ││    │  │ (recovery queue)│  │  │
│  │ Scheduler│    │ │ recovery)││    │  └─────────────────┘  │  │
│  │          │    │ └──────────┘│    │                       │  │
│  │          │    │ ┌──────────┐│    │  ┌─────────────────┐  │  │
│  │          │───▶│ │ Standard ││───▶│  │ Build Worker    │  │  │
│  │          │    │ │ (tests,  ││    │  │ (tests, visual  │  │  │
│  │          │    │ │ analysis)││    │  │  regression)    │  │  │
│  │          │    │ └──────────┘│    │  └─────────────────┘  │  │
│  │          │    │ ┌──────────┐│    │                       │  │
│  │          │───▶│ │ Bulk     ││───▶│  ┌─────────────────┐  │  │
│  │          │    │ │ (migra-  ││    │  │ Bulk Worker     │  │  │
│  │          │    │ │ tions,   ││    │  │ (migrations,    │  │  │
│  │          │    │ │ metrics) ││    │  │  reindex, audit)│  │  │
│  └──────────┘    │ └──────────┘│    │  └─────────────────┘  │  │
│                  └──────────────┘    └───────────┬───────────┘  │
│                                                  │              │
│                                      ┌───────────▼───────────┐  │
│                                      │  Notification Engine  │  │
│                                      │  Terminal, Slack, Web │  │
│                                      └───────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 20.3. Prioridades de cola

```
Cola CRITICAL (procesamiento inmediato, 1 retry rápido):
├── Sincronización post-recovery de MCP server
├── Flush de acciones pendientes (tickets, PRs)
├── Rotación de credenciales próximas a expirar
└── Alertas de seguridad

Cola STANDARD (procesamiento en orden, 3 retries con backoff):
├── Visual regression tests
├── E2E test suites
├── Análisis post-session (extracción de decisiones)
├── Sync de design tokens
├── Bootstrap de proyecto
└── Accessibility audits

Cola BULK (procesamiento en baja prioridad, 5 retries, rate-limited):
├── Migración completa de herramientas
├── Cálculo de métricas históricas
├── Reindexación de historial
├── Análisis de patrones para promoción
├── Importación masiva de design system
└── Auditorías de seguridad completas
```

### 20.4. Implementación técnica

**Para local-first (dev solo o equipo pequeño):**

```
BullMQ + Redis (o BullMQ con IORedis in-memory)
├── Ligero, corre local junto al CLI
├── Dashboard: bull-board embebido en vibe dashboard
├── Workers como procesos hijos del CLI
└── Persistencia de jobs en SQLite si Redis no está disponible

Alternativa ultra-ligera: better-queue con SQLite
├── Sin dependencia de Redis
├── Todo en SQLite
├── Ideal para dev solo
└── Limitado en concurrencia y features
```

**Para cloud/equipo (múltiples devs):**

```
BullMQ + Redis (o AWS SQS + Lambda)
├── Redis central compartido
├── Workers desplegados como servicios
├── Escala horizontal por tipo de worker
└── Dashboard centralizado en Web UI
```

### 20.5. Anatomía de un job

```typescript
// Ejemplo: Visual regression completa del proyecto
interface Job {
  id: string;
  type: 'visual-regression-full';
  priority: 'standard';
  project_id: string;
  enterprise_id: string;
  created_by: string;         // dev que lo inició
  created_at: string;

  // Configuración del job
  config: {
    pages: string[];          // URLs a testear
    viewports: [375, 768, 1024, 1440];
    baseline_branch: 'main';
    compare_branch: 'feature/pricing';
    threshold: 0.1;           // % de diferencia aceptable
  };

  // Estado
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: {
    total: 48;                // total de screenshots
    completed: 32;            // screenshots tomados
    passed: 28;               // sin diferencias
    failed: 4;                // con diferencias
    percentage: 66;
  };

  // Resultado
  result?: {
    summary: string;          // "4 de 48 screenshots con diferencias"
    diffs: DiffResult[];      // detalle por screenshot
    report_url: string;       // link al reporte visual
    duration_ms: number;
  };

  // Reintentos
  attempts: number;
  max_attempts: 3;
  last_error?: string;

  // Notificación
  notify: {
    on_complete: ['terminal', 'slack'];
    on_failure: ['terminal', 'slack', 'email'];
  };
}
```

### 20.6. Sistema de notificaciones por canal

Las tareas en background necesitan notificar al dev cuando terminan, fallan, o requieren atención.

```
┌──────────────────────────────────────────────────────────────┐
│                  NOTIFICATION ENGINE                          │
│                                                              │
│  Evento                Canal(es)           Formato           │
│  ─────                 ─────────           ───────           │
│  Job completado OK     Terminal + Slack    Resumen breve     │
│  Job fallido           Terminal + Slack    Error + acción    │
│  Job requiere input    Terminal (bell)     Prompt inline     │
│  Migración completa    Slack + Email       Reporte completo  │
│  MCP server recovered  Terminal            Status update     │
│  Credential expiring   Slack + Email       Alerta + link     │
│  Pattern detected      Web UI              Sugerencia        │
│  Budget alert          Slack + Email       Costo + forecast  │
│                                                              │
│  Preferencias por dev:                                       │
│  ├── Canal preferido por tipo de notificación                │
│  ├── Horario de "no molestar"                                │
│  ├── Agrupación (digest cada N minutos vs instantáneo)       │
│  └── Filtro por proyecto/empresa                             │
└──────────────────────────────────────────────────────────────┘
```

**Terminal (integración con Claude Code):**

```
Mientras el dev trabaja en Claude Code, las notificaciones
aparecen de forma no intrusiva:

  claude> implementa el componente de pricing cards
  [Claude trabajando...]

  ── Notificación ────────────────────────────────────
  ✓ Visual regression (Proyecto ABC): 44/48 passed, 4 diffs
    → ver reporte: vibe report vr-2026-02-10-001
  ─────────────────────────────────────────────────────

  [Claude continúa trabajando...]
```

**Slack (integración rich):**

```
#proyecto-abc
┌─────────────────────────────────────────────┐
│ 🔄 Visual Regression Report                 │
│                                             │
│ Branch: feature/pricing → main              │
│ Screenshots: 48 total                       │
│ ✓ Passed: 44  ✗ Failed: 4                  │
│                                             │
│ Diffs encontrados:                          │
│ • /pricing → header spacing (+2px)          │
│ • /pricing/enterprise → CTA color           │
│ • /checkout → form alignment                │
│ • /dashboard → sidebar width                │
│                                             │
│ [Ver Reporte] [Aprobar Todos] [Revisar]     │
└─────────────────────────────────────────────┘
```

**Web UI (dashboard de jobs):**

```
Jobs activos:

Estado    Tipo                  Proyecto     Progreso    Inicio
──────    ────                  ────────     ────────    ──────
🔄 Run   Visual regression     ABC          66% (32/48) 10:15
⏳ Queue  E2E test suite        ABC          Pending     10:18
⏳ Queue  Design token sync     DEF          Pending     10:20
✓ Done   Post-session analysis  ABC          100%        10:12
✗ Fail   Jira migration        DEF          Failed @35% 09:45
                                             [Retry] [Logs]
```

### 20.7. Patrones de ejecución

**Fire-and-forget (la mayoría de jobs):**

```
Dev: /validate-visual --full
CLI: → encola job en STANDARD
CLI: → "Visual regression encolada. Te notifico cuando termine."
Dev: sigue trabajando normalmente
[5 min después]
Notificación: "✓ Visual regression completada: 44/48 passed"
```

**Await con timeout (cuando el resultado se necesita para continuar):**

```
Dev: "despliega a staging y corre E2E tests"
Claude Code:
  1. Despliega → job encolado en STANDARD
  2. Espera resultado (timeout: 10 min)
  3. Si completa → analiza resultados y continúa
  4. Si timeout → "Deploy en progreso, te notifico. ¿Sigo con otra cosa?"
```

**Pipeline de jobs (una cadena de tareas dependientes):**

```
/bootstrap proyecto "Acme" "NuevoProyecto"

Pipeline:
  Job 1: Scaffold estructura          [2s]    → inmediato
  Job 2: Configurar credenciales      [5s]    → tras Job 1
  Job 3: Sync design tokens de Figma  [2min]  → tras Job 2
  Job 4: Generar visual baselines     [5min]  → tras Job 3
  Job 5: Correr audit inicial         [3min]  → tras Job 4
  ─────
  Total estimado: ~10 min

El dev recibe:
  "Bootstrap iniciado. Jobs 1-2 completados.
   Jobs 3-5 en background (~10 min).
   Te notifico al completar. Puedes trabajar en otro proyecto."
```

**Batch processing (operaciones masivas):**

```
/migrate acme abc task-management jira linear

Batch:
  Total tickets a migrar: 1,247
  Rate limit de Linear API: 100 req/min
  Estimación: ~15 min

  Progreso:
  ├── Lote 1/13: 100 tickets ✓ (migrados)
  ├── Lote 2/13: 100 tickets ✓ (migrados)
  ├── Lote 3/13: 100 tickets 🔄 (en progreso)
  └── Lotes 4-13: ⏳ (en cola)

  Notificación cada 25%:
  "Migración Jira→Linear: 25% (312/1247 tickets)"
  "Migración Jira→Linear: 50% (623/1247 tickets)"
  "Migración Jira→Linear: 75% (935/1247 tickets)"
  "✓ Migración completada: 1,247 tickets migrados. 3 con warnings."
```

### 20.8. Error handling y reintentos

```
Estrategia por tipo de cola:

CRITICAL:
├── Reintentos: 1, inmediato
├── Si falla: escalamiento a Slack + email + Web UI alert
├── Dead letter queue: sí, revisión manual requerida
└── Timeout: 30 segundos

STANDARD:
├── Reintentos: 3, exponential backoff (5s, 30s, 2min)
├── Si falla: notificación al dev + opción de retry manual
├── Dead letter queue: sí, visible en Web UI
└── Timeout: 10 minutos

BULK:
├── Reintentos: 5, exponential backoff (1min, 5min, 15min, 30min, 1h)
├── Si falla: notificación + reporte parcial de lo completado
├── Dead letter queue: sí, con opción de "continuar desde donde quedó"
├── Timeout: 1 hora
└── Checkpointing: guarda progreso cada N items para resume
```

**Checkpointing para jobs largos:**

```
Migración de 1,247 tickets:
  ├── Checkpoint cada 100 tickets
  ├── Si falla en ticket #534:
  │   ├── Guarda estado: "534 de 1247 completados"
  │   ├── Al reintentar: continúa desde ticket #535
  │   └── No reprocesa los 534 ya migrados
  └── Resultado: resiliencia sin duplicación
```

### 20.9. Cancelación y control

Los devs necesitan poder cancelar, pausar, y priorizar jobs.

```
Comandos de control:

vibe jobs                            Lista jobs activos y recientes
vibe jobs cancel <job-id>            Cancela un job (graceful shutdown)
vibe jobs retry <job-id>             Reintenta un job fallido
vibe jobs pause <job-id>             Pausa un job (si soporta checkpointing)
vibe jobs resume <job-id>            Reanuda un job pausado
vibe jobs priority <job-id> high     Sube prioridad de un job
vibe jobs logs <job-id>              Ver logs del job
vibe jobs clean                      Limpia jobs completados > 7 días
```

### 20.10. Modelo de datos para jobs

```
Job
├── id, type, priority_queue (critical | standard | bulk)
├── enterprise_id, project_id
├── created_by (developer_id)
├── status: queued | running | completed | failed | cancelled | paused
├── progress: { total, completed, percentage, current_step }
├── config: JSON (parámetros específicos del tipo de job)
├── result: JSON (resultado al completar)
├── pipeline_id: (si es parte de un pipeline)
├── pipeline_step: (orden dentro del pipeline)
├── depends_on: [job_ids] (jobs que deben completar antes)
├── checkpoint: JSON (estado para resume)
├── attempts, max_attempts
├── last_error, error_history: []
├── notify_config: { on_complete: [], on_failure: [], on_progress: [] }
├── started_at, completed_at, estimated_completion
├── timeout_ms
└── created_at, updated_at
```

---

## 21. Stack Técnico Completo — Decisiones por Capa

Cada tecnología fue seleccionada evaluando: benchmarks de rendimiento, madurez y soporte activo, tamaño y actividad de la comunidad, compatibilidad con el ecosistema TypeScript, y alineación con la filosofía local-first de la plataforma. Fecha de evaluación: Febrero 2026.

### 21.1. Runtime y Lenguaje

```
Tecnología:     Node.js 22 LTS + TypeScript 5.x
Alternativas:   Bun, Deno
Decisión:       Node.js 22 LTS

Justificación:
├── Estabilidad: Node.js 22 LTS es el runtime más estable y probado
│   en producción. Claude Code, los MCP SDKs, y todo el ecosistema
│   de developer tooling corre sobre Node.js.
├── Compatibilidad: 100% de las dependencias (BullMQ, Drizzle, Next.js,
│   Playwright, MCP SDK) tienen soporte nativo y testeado para Node.js.
├── Bun considerado: ~25% más rápido que Node.js en benchmarks
│   sintéticos de BullMQ (feb 2025). Sin embargo, aún tiene edge cases
│   de incompatibilidad con packages nativos. Para una plataforma de
│   developer tooling donde la estabilidad es crítica, el beneficio
│   de rendimiento no justifica el riesgo.
└── TypeScript everywhere: un solo lenguaje para CLI, core engine,
    MCP servers, Web UI, y workers. Tipos compartidos entre packages.
```

### 21.2. Monorepo

```
Tecnología:     Turborepo 2.x + pnpm workspaces
Alternativas:   Nx, Lerna, Rush
Decisión:       Turborepo + pnpm

Justificación:
├── Performance: Turborepo tiene el caching más rápido para builds
│   incrementales. Con múltiples packages (core, cli, db, queue, web,
│   workers, 4 MCP servers), el build incremental es crítico.
├── Simplicidad: Configuración mínima vs Nx que es más opinionated
│   y pesado. Turbo.json + pnpm-workspace.yaml y listo.
├── pnpm sobre npm/yarn: pnpm usa hard links y content-addressable
│   storage, es 2-3x más rápido en installs y usa ~50% menos disco
│   que npm. Perfecto para monorepo con muchos packages.
└── Comunidad: Turborepo (Vercel) está en desarrollo activo con
    releases mensuales. Es el estándar de facto para monorepos TS.
```

### 21.3. Base de datos y ORM

```
Tecnología:     Drizzle ORM + SQLite (local) / PostgreSQL (cloud)
Alternativas:   Prisma, TypeORM, Kysely, MikroORM
Decisión:       Drizzle ORM

Justificación:
├── Performance:
│   ├── Drizzle: ~4,600 req/s con ~100ms p95 en benchmarks con
│   │   PostgreSQL y ~370K records (benchmark oficial Drizzle, 2025)
│   ├── Prisma 7 (nov 2025): mejoró significativamente al remover
│   │   el motor Rust, pero Drizzle sigue más rápido en queries
│   │   directas y tiene ~0 overhead de runtime
│   └── Bundle size: Drizzle ~7.4kb min+gzip vs Prisma ~varios MB
│       Crítico para el CLI que debe ser ligero
│
├── SQL-first: Drizzle genera queries que mapean 1:1 a SQL. Para una
│   plataforma de tooling donde necesitamos control fino sobre queries
│   de scoring de relevancia y agregaciones de métricas, SQL-first
│   es preferible sobre la abstracción de Prisma.
│
├── Schema como código: El schema se define en TypeScript puro, sin
│   archivo .prisma separado ni paso de generación. Los tipos se
│   infieren automáticamente. Esto simplifica el DX en el monorepo.
│
├── SQLite nativo: Drizzle tiene soporte de primera clase para SQLite
│   (via better-sqlite3), esencial para el modo local-first. Prisma
│   también soporta SQLite pero con más overhead.
│
├── Migraciones: Drizzle Kit genera SQL de migración, dando control
│   total. En producción esto es preferible vs migraciones "mágicas".
│
├── Serverless-ready: Sin binarios nativos, sin motor externo.
│   Funciona en cualquier entorno sin configuración.
│
└── Trade-off aceptado: Prisma tiene mejor DX para principiantes,
    mejor documentación, y Prisma Studio para explorar datos. Drizzle
    Studio existe pero es menos pulido. Para este proyecto donde
    el equipo tiene experiencia SQL, el trade-off es aceptable.
```

### 21.4. Cola de Tareas

```
Tecnología:     BullMQ 5.x + Redis (cloud) / better-queue + SQLite (local)
Alternativas:   RabbitMQ, Agenda, Bee-Queue, pgboss, AWS SQS
Decisión:       BullMQ (cloud), better-queue (local)

Justificación:
├── BullMQ (modo cloud/equipo):
│   ├── Es la cola de referencia para Node.js, procesando billones
│   │   de jobs diarios en miles de empresas
│   ├── Features que necesitamos nativamente:
│   │   ├── Prioridades por cola (critical, standard, bulk)
│   │   ├── FlowProducer para pipelines de jobs dependientes
│   │   ├── Rate limiting por cola
│   │   ├── Reintentos con exponential backoff
│   │   ├── Eventos en tiempo real (QueueEvents)
│   │   └── Concurrencia configurable por worker
│   ├── Dashboard: bull-board proporciona UI para gestión de jobs
│   ├── Performance: ~6,000+ jobs/s en Node.js, ~7,500+ con Bun
│   │   (benchmark BullMQ feb 2025)
│   └── Compatible con Dragonfly (drop-in Redis replacement, usa
│       todos los CPU cores, más eficiente en memoria)
│
├── better-queue (modo local/dev solo):
│   ├── Sin dependencia de Redis
│   ├── Almacena jobs en SQLite (ya tenemos SQLite para la DB)
│   ├── Suficiente para un dev solo donde la concurrencia es baja
│   └── API compatible: migrar a BullMQ al escalar es straightforward
│
├── RabbitMQ descartado: Demasiado pesado para nuestro caso de uso.
│   Es un message broker completo, no una job queue. Ideal para
│   comunicación entre microservicios polyglot, no para background
│   jobs en un monorepo TypeScript.
│
└── pgboss considerado: Usa PostgreSQL como backend (sin Redis extra).
    Interesante, pero menor comunidad, menos features que BullMQ,
    y no aplica al modo local-first con SQLite.
```

### 21.5. Logging

```
Tecnología:     Pino 9.x
Alternativas:   Winston, Bunyan, Log4js, console
Decisión:       Pino

Justificación:
├── Performance: Pino es 5-10x más rápido que Winston en benchmarks
│   de alto throughput. Usa logging asíncrono en worker threads
│   separados, minimizando el impacto en el event loop principal.
│
├── JSON nativo: Produce JSON estructurado por defecto, ideal para
│   integración con herramientas de observabilidad y para el
│   dashboard de métricas de la Web UI.
│
├── Overhead mínimo: No bloquea el thread principal. Formatea en
│   procesos separados. Crítico para el CLI y los workers donde
│   cada milisegundo cuenta.
│
├── Ecosistema:
│   ├── pino-pretty: output legible en desarrollo
│   ├── pino-http: integración con Express/Fastify para la Web API
│   ├── pino-roll: rotación de logs nativa
│   ├── pino.transport(): transports en worker threads
│   └── Child loggers: contexto jerárquico por módulo/sesión
│
├── Integración: Soporte nativo para OpenTelemetry, lo cual habilita
│   observabilidad avanzada si se necesita en el futuro.
│
└── Winston descartado: Más flexible y configurable, pero el overhead
    de rendimiento no se justifica. Para una plataforma donde el CLI
    y los workers necesitan ser rápidos, Pino es la elección correcta.
    Winston sería adecuado si necesitáramos routing complejo de logs
    a múltiples destinos, pero nuestras necesidades son más simples.
```

### 21.6. CLI Framework

```
Tecnología:     Commander.js + Ink 5 (React para terminal)
Alternativas:   Oclif, Yargs, Clipanion, Clack
Decisión:       Commander.js + Ink

Justificación:
├── Commander.js:
│   ├── El framework CLI más usado en Node.js (>12M weekly downloads)
│   ├── API simple y declarativa para definir comandos y flags
│   ├── TypeScript nativo
│   └── Zero overhead: parsing rápido, sin magia
│
├── Ink 5 (React para terminal):
│   ├── Permite UIs ricas en terminal usando componentes React
│   ├── Ideal para: dashboard de jobs, progress bars, status tables,
│   │   notificaciones inline, wizards de bootstrap
│   ├── Reusa conocimiento de React del equipo
│   ├── Actualización en tiempo real sin flickering
│   └── Componentes como <Box>, <Text>, <Spinner> son declarativos
│
├── Oclif descartado: Más opinionated y pesado. Diseñado para CLIs
│   enterprise con plugins. Para nuestro caso, Commander + Ink da
│   más flexibilidad con menos overhead.
│
└── Clack considerado: Excelente DX para prompts interactivos.
    Se puede usar puntualmente para los wizards de bootstrap
    sin reemplazar Commander como framework base.
    Decisión: Clack como complemento para prompts, no como reemplazo.
```

### 21.7. Notificaciones — Slack

```
Tecnología:     @slack/bolt (Bolt SDK) + Socket Mode
Alternativas:   Incoming Webhooks, @slack/web-api directo
Decisión:       Slack Bolt SDK con Socket Mode

Justificación:
├── Bolt SDK:
│   ├── Framework oficial de Slack para apps, mantenido por Slack
│   ├── Maneja automáticamente: verificación de requests, OAuth,
│   │   event routing, retry logic, y rate limiting
│   ├── Construido sobre Express: familiar para devs Node.js
│   ├── Soporte completo para Block Kit (mensajes rich con botones,
│   │   como los reportes de visual regression con [Aprobar] [Revisar])
│   └── TypeScript nativo desde v4
│
├── Socket Mode (sobre HTTP webhooks):
│   ├── No requiere URL pública: la app se conecta a Slack via
│   │   WebSocket, ideal para setup local-first
│   ├── Bidireccional: puede recibir interacciones (clicks en
│   │   botones de "Aprobar" o "Retry") sin exponer endpoints
│   ├── Más seguro: no necesita ngrok ni port forwarding
│   └── Slack lo recomienda para apps internas de workspace
│
├── Webhooks descartados como mecanismo principal:
│   ├── Slack los marcó como "legacy custom integration" y los está
│   │   deprecando progresivamente
│   ├── Solo soportan enviar mensajes, no recibir interacciones
│   └── Sin verificación de requests ni rate limiting automático
│
├── Futuro: Discord y Teams como canales adicionales
│   ├── Discord: discord.js (SDK maduro y activo)
│   └── Teams: @microsoft/teams-ai (SDK oficial)
│   └── La notification engine abstrae el canal, agregar nuevos
│       canales es implementar una interfaz
│
└── Complemento: @slack/web-api se usa internamente por Bolt
    pero también se puede usar directamente para operaciones
    programáticas simples (enviar mensaje a canal sin setup de app)
```

### 21.8. Configuración del CLI

```
Tecnología:     Cosmiconfig 9.x
Alternativas:   rc, conf, dotenv, custom
Decisión:       Cosmiconfig

Justificación:
├── Estándar de facto: Usado por Prettier, Stylelint, ESLint,
│   Commitlint, y decenas de herramientas del ecosistema JS.
│   Los devs ya esperan poder configurar con .viberc, .vibe.json,
│   vibe.config.ts, o dentro de package.json.
│
├── Multi-formato nativo: JSON, YAML, JS, TS, CJS, MJS. El dev
│   elige el formato que prefiera. Sin configuración extra.
│
├── Búsqueda jerárquica: Busca configuración subiendo por el árbol
│   de directorios. Esto encaja con nuestra jerarquía de contexto:
│   proyecto > empresa > global.
│
├── Async y sync: Soporta ambos modos. El CLI usa sync para arranque
│   rápido, async para operaciones durante la ejecución.
│
├── Caching: Cache interno evita re-leer archivos innecesariamente.
│
├── TypeScript nativo: Soporta .ts y .mts config files directamente.
│
└── Archivos de configuración:
    ├── ~/.config/vibe/config.json      ← configuración global
    ├── .viberc / .vibe.json / vibe.config.ts  ← por proyecto
    └── package.json → "vibe": { ... }   ← inline en package.json
```

### 21.9. Autenticación (Web UI)

```
Tecnología:     Better Auth (self-hosted, open-source)
                Modo local: sin auth (localhost)
Alternativas:   Clerk, Auth.js/NextAuth v5, Supabase Auth, Auth0
Decisión:       Better Auth (cloud) / Sin auth (local)

Justificación:
├── Modo local-first (dev solo): La Web UI corre en localhost.
│   No necesita autenticación. Acceso directo. Esto es el modo
│   por defecto y el que se usa en fases 1-4.
│
├── Modo cloud/equipo (fase 5-6): Necesita auth real.
│   Better Auth seleccionado porque:
│   ├── Open-source y self-hosted: datos de usuario en NUESTRA DB,
│   │   no en un servicio externo. Alineado con la filosofía de
│   │   la plataforma de control total sobre los datos.
│   ├── Framework-agnostic: funciona con Next.js pero no está
│   │   atado a él. Si la Web UI cambia de framework, el auth no
│   │   se rompe.
│   ├── Integración nativa con Drizzle ORM: auto-genera schemas
│   │   de DB usando el mismo ORM que ya usamos. Zero friction.
│   ├── Plugin architecture: MFA, equipos/organizaciones, roles,
│   │   rate limiting, audit logging — todo como plugins opt-in.
│   ├── Email/password nativo: funciona out of the box sin
│   │   configuración extra (punto débil de NextAuth/Auth.js).
│   ├── Crecimiento: $5M en funding (Peak XV + Y Combinator, 2025),
│   │   comunidad creciendo rápidamente.
│   └── Costo: $0. Sin pricing per-MAU como Clerk/Auth0.
│
├── Clerk descartado:
│   ├── Managed service: datos viven en sus servidores
│   ├── Vendor lock-in significativo
│   ├── Pricing per-MAU escala con el número de devs
│   └── Excelente DX pero no alineado con filosofía self-hosted
│
├── NextAuth/Auth.js descartado:
│   ├── En transición (NextAuth → Auth.js), documentación fragmentada
│   ├── CredentialProvider requiere mucho boilerplate
│   └── Better Auth resuelve los mismos problemas con menos friction
│
└── Auth0 descartado:
    ├── Enterprise-oriented, pricing alto
    ├── Managed service (mismo problema que Clerk)
    └── Overkill para una plataforma de developer tooling
```

### 21.10. Visual Regression Testing

```
Tecnología:     Playwright screenshots nativo + pixelmatch
                (self-hosted, sin dependencia externa)
Alternativas:   BackstopJS, Chromatic, Percy, reg-suit, Loki, Happo
Decisión:       Playwright nativo

Justificación:
├── Ya tenemos Playwright: Es el motor del Browser Preview MCP Server.
│   No necesitamos OTRA herramienta. Playwright Test incluye visual
│   comparison nativo con toMatchSnapshot().
│
├── Self-hosted por defecto:
│   ├── Las screenshots se almacenan en Git (baselines)
│   ├── pixelmatch compara localmente, sin enviar datos a servicios
│   │   externos
│   ├── Alineado con la filosofía local-first y de seguridad
│   │   (no enviar screenshots de apps a servicios third-party)
│   └── Costo: $0
│
├── Flujo integrado:
│   ├── Browser Preview MCP → toma screenshot → Playwright compara
│   │   vs baseline → si threshold > 0.1% → reporta diff
│   ├── En CI/CD: Playwright Test corre como test suite normal
│   └── Baselines viven en .claude/baselines/ versionado con Git
│
├── BackstopJS considerado: Buena herramienta open-source, pero
│   agrega otra dependencia cuando Playwright ya hace lo mismo
│   nativamente. BackstopJS usa Playwright/Puppeteer internamente.
│
├── Chromatic/Percy descartados: SaaS con pricing por screenshot.
│   Excelentes para equipos grandes, pero el costo no se justifica
│   cuando Playwright nativo cubre el caso de uso.
│
├── Para equipos que necesiten más: reg-suit como capa adicional.
│   Es open-source, CI-friendly, con storage backends extensibles
│   (S3, GCS) y notificaciones en PRs de GitHub.
│
└── Complementos:
    ├── axe-core: auditoría de accesibilidad (integrado con Playwright)
    ├── Lighthouse CI: performance budgets en CI/CD
    └── pa11y: accessibility auditing adicional
```

### 21.11. Design Tokens Sync

```
Tecnología:     Style Dictionary 4.x + Figma REST API
Alternativas:   Tokens Studio, Theo (Salesforce), custom
Decisión:       Style Dictionary + Figma API

Justificación:
├── Style Dictionary (Amazon):
│   ├── Estándar de facto para transformar design tokens a
│   │   múltiples plataformas (CSS custom properties, SCSS,
│   │   JSON, TypeScript, iOS, Android)
│   ├── Open-source, 12K+ GitHub stars, comunidad activa
│   ├── v4 (2024): reescrito con soporte ESM, async transforms,
│   │   y una API mucho más flexible
│   ├── Extensible: custom transforms, formats, y filters
│   └── CI-friendly: corre como build step, no como servicio
│
├── Figma REST API (directo):
│   ├── Extrae tokens, componentes, y estilos directamente de Figma
│   ├── Sin intermediario: los datos van de Figma → Style Dictionary
│   │   → archivos de tokens en el formato del proyecto
│   └── Rate-limited pero manejable con caching y sync asíncrono
│       (job encolado en STANDARD queue)
│
├── Tokens Studio considerado: Plugin de Figma excelente para
│   gestionar tokens dentro de Figma, pero agrega una capa más.
│   Para la v1, Figma API directo + Style Dictionary es más simple.
│   Se puede integrar Tokens Studio después como fuente alternativa.
│
└── Flujo:
    Figma (source of truth) → Figma API → Style Dictionary transform
    → design-system.md + tokens.css + tokens.ts
    → .claude/docs/design-system.md (para Claude Code)
```

### 21.12. Web UI

```
Tecnología:     Next.js 15 (App Router) + tRPC + Tailwind CSS 4
Alternativas:   Remix, SvelteKit, Nuxt, Astro
Decisión:       Next.js 15

Justificación:
├── Next.js 15:
│   ├── Framework React más maduro y usado para apps full-stack
│   ├── App Router: Server Components para dashboard (menos JS al
│   │   cliente), Server Actions para mutations
│   ├── Turbopack: dev server más rápido que Webpack
│   ├── Soporte perfecto para modo local (next start) y cloud (Vercel)
│   └── Ecosystem: la mayoría de componentes UI soportan Next.js first
│
├── tRPC:
│   ├── API type-safe end-to-end sin code generation
│   ├── Compartido entre Web UI, CLI, y workers dentro del monorepo
│   ├── El CLI puede consumir las mismas queries que la Web UI
│   ├── Eliminamos la necesidad de documentar API endpoints
│   └── Integración nativa con Next.js App Router
│
├── Tailwind CSS 4 (2025):
│   ├── Reescrito con Rust (Lightning CSS), ~10x más rápido en builds
│   ├── Configuración via CSS nativo (sin tailwind.config.js)
│   ├── Composable variants y container queries nativos
│   └── Ideal para dashboard con muchos componentes y variantes
│
├── UI Components: shadcn/ui
│   ├── Componentes copiados al proyecto (no dependencia external)
│   ├── Accesibles (Radix UI), bonitos, customizables
│   ├── Perfecto para: tablas de métricas, formularios de config,
│   │   dashboard de jobs, editor de contexto
│   └── Tailwind CSS nativo
│
└── Complementos:
    ├── Recharts: gráficas de métricas y tendencias
    ├── @tanstack/react-table: tablas complejas de datos
    └── Monaco Editor: editor de CLAUDE.md en la Web UI
```

### 21.13. MCP Servers

```
Tecnología:     @anthropic/mcp-sdk + Playwright (browser preview)
Decisión:       SDK oficial

Justificación:
├── @anthropic/mcp-sdk:
│   ├── SDK oficial de Anthropic para construir MCP servers
│   ├── TypeScript nativo
│   ├── Maneja el protocolo MCP (stdio/SSE), handshake, tool
│   │   registration, y serialización
│   └── Actualizado con cada release del protocolo MCP
│
├── Playwright (para browser-preview MCP):
│   ├── Soporta Chromium, Firefox, y WebKit con una sola API
│   ├── Headless mode para CI/CD y servers
│   ├── API para screenshots, interacción, DOM inspection,
│   │   network interception — todo lo que necesita el MCP
│   ├── Auto-wait: espera automáticamente a que elementos estén
│   │   listos, evitando screenshots de estados incompletos
│   └── Context isolation: cada test/sesión es independiente
│
└── Los 4 MCP servers custom usan el mismo stack:
    ├── browser-preview: @anthropic/mcp-sdk + Playwright
    ├── design-tokens: @anthropic/mcp-sdk + Style Dictionary
    ├── project-context: @anthropic/mcp-sdk + Drizzle (lee DB)
    └── history: @anthropic/mcp-sdk + Drizzle + filesystem
```

### 21.14. Credenciales y Secrets

```
Tecnología:     1Password CLI (local) / HashiCorp Vault (cloud)
                + dotenv-vault como fallback ligero
Alternativas:   AWS Secrets Manager, Doppler, Infisical
Decisión:       1Password CLI (local-first) / Vault (enterprise)

Justificación:
├── 1Password CLI (modo local / equipos pequeños):
│   ├── Muchos devs ya usan 1Password para credenciales personales
│   ├── `op` CLI permite leer secrets programáticamente
│   ├── 1Password Connect: API para acceso automatizado
│   ├── op inject: inyecta secrets en env vars en un solo comando
│   ├── Vaults compartidos por equipo con RBAC
│   └── Costo: incluido en suscripción Teams (~$4/user/mes)
│
├── HashiCorp Vault (modo enterprise / multi-empresa):
│   ├── Self-hosted: control total sobre dónde viven los secrets
│   ├── Dynamic secrets: genera credenciales efímeras para cada sesión
│   ├── Audit logging nativo: quién accedió a qué y cuándo
│   ├── Rotación automática de credenciales
│   ├── Políticas granulares por empresa/proyecto/dev
│   └── Ideal cuando hay compliance requirements
│
├── dotenv-vault como fallback mínimo:
│   ├── Para devs que no quieren setup de vault
│   ├── .env cifrado y versionado con Git
│   ├── Decrypt en runtime con una master key
│   └── Mejor que .env en plaintext, peor que vault real
│
└── El CLI abstrae el backend de secrets:
    vibe config set vault-backend 1password  (default)
    vibe config set vault-backend hashicorp
    vibe config set vault-backend dotenv
    → El context resolver obtiene credenciales sin saber de dónde vienen
```

### 21.15. Testing de la Plataforma

```
Tecnología:     Vitest + Playwright + @testing-library
Decisión:       Vitest (unit/integration) + Playwright (E2E)

Justificación:
├── Vitest:
│   ├── 5-10x más rápido que Jest en ejecución de tests
│   ├── Compatible con la API de Jest (migración trivial)
│   ├── ESM nativo, TypeScript nativo, sin transforms
│   ├── HMR para tests: re-ejecuta solo tests afectados
│   ├── Integración con Turborepo para tests incrementales en CI
│   └── Coverage via v8 (rápido) o Istanbul (detallado)
│
├── Playwright (E2E para Web UI):
│   ├── Ya lo tenemos para browser-preview MCP
│   ├── Cross-browser: Chromium, Firefox, WebKit
│   ├── Trace viewer: debugging visual de tests fallidos
│   └── Integración con Visual Regression (mismo tool)
│
├── @testing-library:
│   ├── Para tests de componentes React en la Web UI
│   ├── Testing por comportamiento, no por implementación
│   └── Estándar en el ecosistema React
│
└── Estructura de tests:
    ├── packages/core/: Vitest (unit tests de context resolver,
    │   scoring engine, capability mapper)
    ├── packages/cli/: Vitest (unit tests de commands, integration
    │   tests con mock de Claude Code)
    ├── packages/queue/: Vitest (unit tests de producers, workers)
    ├── apps/web/: Vitest + @testing-library (componentes) +
    │   Playwright (E2E de dashboard, flows)
    └── mcp-servers/: Vitest (unit tests de tools, integration
        tests con mock de MCP protocol)
```

### 21.16. Resumen de Stack por Capa

```
┌─────────────────────────┬────────────────────────────────────────┐
│ CAPA / FUNCIÓN          │ TECNOLOGÍA                             │
├─────────────────────────┼────────────────────────────────────────┤
│ Runtime                 │ Node.js 22 LTS                         │
│ Lenguaje                │ TypeScript 5.x                         │
│ Monorepo                │ Turborepo 2.x + pnpm                  │
│ CLI framework           │ Commander.js + Ink 5 + Clack (prompts) │
│ CLI configuración       │ Cosmiconfig 9.x                        │
│ Web UI framework        │ Next.js 15 (App Router)                │
│ Web UI styling          │ Tailwind CSS 4 + shadcn/ui             │
│ Web UI API              │ tRPC                                   │
│ Web UI charts           │ Recharts                               │
│ Web UI auth             │ Better Auth (cloud) / ninguno (local)  │
│ Base de datos           │ SQLite (local) / PostgreSQL (cloud)    │
│ ORM                     │ Drizzle ORM                            │
│ Cola de tareas          │ BullMQ + Redis / better-queue + SQLite │
│ Cola dashboard          │ bull-board (embebido en Web UI)        │
│ Logging                 │ Pino 9.x                               │
│ MCP servers             │ @anthropic/mcp-sdk                     │
│ Agent SDK               │ @anthropic-ai/claude-agent-sdk (TS+Py) │
│ Claude Code plugins     │ .claude-plugin/plugin.json (native)    │
│ Browser automation      │ Playwright                             │
│ Visual regression       │ Playwright screenshots + pixelmatch    │
│ Visual regression (CI)  │ reg-suit (opcional, para equipos)      │
│ Accessibility audit     │ axe-core (via Playwright)              │
│ Performance audit       │ Lighthouse CI                          │
│ Design tokens           │ Style Dictionary 4.x + Figma REST API │
│ Notificaciones Slack    │ @slack/bolt (Bolt SDK + Socket Mode)   │
│ Notificaciones Discord  │ discord.js (futuro)                    │
│ Notificaciones Teams    │ @microsoft/teams-ai (futuro)           │
│ Secrets (local)         │ 1Password CLI                          │
│ Secrets (enterprise)    │ HashiCorp Vault                        │
│ Secrets (fallback)      │ dotenv-vault                           │
│ Testing (unit)          │ Vitest                                 │
│ Testing (E2E)           │ Playwright                             │
│ Testing (componentes)   │ @testing-library/react                 │
│ Editor código (Web UI)  │ Monaco Editor                          │
│ Validación schemas      │ Zod                                    │
│ Environment config      │ dotenv + Cosmiconfig                   │
└─────────────────────────┴────────────────────────────────────────┘
```

### 21.17. Estructura del Monorepo

```
vibe/
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
│
├── packages/
│   ├── core/                         ← Context Engine (librería)
│   │   ├── src/
│   │   │   ├── context-resolver/     ← merge de jerarquía 3 niveles
│   │   │   ├── history-manager/      ← decisions, sessions, learned-fixes
│   │   │   ├── relevance-scorer/     ← scoring engine
│   │   │   ├── capability-mapper/    ← modelo por capacidades
│   │   │   ├── template-generator/   ← genera CLAUDE.md, skills, etc.
│   │   │   ├── security/            ← aislamiento, sanitización
│   │   │   └── migration/           ← migración de herramientas
│   │   ├── tests/
│   │   └── package.json
│   │
│   ├── cli/                          ← CLI Tool
│   │   ├── src/
│   │   │   ├── commands/             ← switch, bootstrap, status, jobs, etc.
│   │   │   ├── claude-integration/   ← invoca Claude Code, gestiona sesiones
│   │   │   ├── notifications/        ← terminal notifications (Ink)
│   │   │   └── config/              ← Cosmiconfig setup
│   │   ├── bin/
│   │   │   └── vibe.ts              ← entry point
│   │   └── package.json
│   │
│   ├── db/                           ← Schema + migrations (Drizzle)
│   │   ├── src/
│   │   │   ├── schema/              ← Drizzle table definitions
│   │   │   ├── migrations/          ← SQL migration files
│   │   │   └── seed/                ← fallback best practices
│   │   └── package.json
│   │
│   ├── queue/                        ← Job queue system
│   │   ├── src/
│   │   │   ├── producers/           ← encolar jobs (BullMQ / better-queue)
│   │   │   ├── workers/             ← sync, build, bulk workers
│   │   │   ├── pipelines/           ← definición de pipelines
│   │   │   ├── notifications/       ← notification engine (Slack, etc.)
│   │   │   └── types/               ← job types, configs, results (Zod)
│   │   └── package.json
│   │
│   └── shared/                       ← Tipos y utilidades compartidas
│       ├── src/
│       │   ├── types/               ← Enterprise, Project, Session, Job...
│       │   ├── schemas/             ← Zod schemas para validación
│       │   ├── constants/
│       │   └── utils/
│       └── package.json
│
├── apps/
│   ├── web/                          ← Web UI (Next.js 15)
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   ├── enterprises/
│   │   │   ├── projects/
│   │   │   ├── metrics/
│   │   │   ├── jobs/                ← dashboard de jobs (bull-board)
│   │   │   ├── context/             ← editor, diff, rollback
│   │   │   └── api/trpc/            ← tRPC routes
│   │   ├── components/              ← shadcn/ui components
│   │   └── package.json
│   │
│   └── workers/                      ← Background workers (procesos)
│       ├── src/
│       │   ├── sync-worker.ts        ← recovery queue
│       │   ├── build-worker.ts       ← tests, visual regression
│       │   ├── bulk-worker.ts        ← migrations, reindex
│       │   ├── metrics-worker.ts     ← cálculo periódico
│       │   ├── pattern-worker.ts     ← detección para promoción
│       │   └── credential-worker.ts  ← rotación de credenciales
│       └── package.json
│
├── mcp-servers/
│   ├── browser-preview/              ← Playwright headless
│   │   ├── src/
│   │   │   ├── tools/               ← navigate, screenshot, interact...
│   │   │   └── server.ts
│   │   └── package.json
│   │
│   ├── design-tokens/                ← Style Dictionary + Figma API
│   │   ├── src/
│   │   │   ├── tools/               ← get_tokens, component_spec...
│   │   │   └── server.ts
│   │   └── package.json
│   │
│   ├── project-context/              ← estado dinámico del proyecto
│   │   ├── src/
│   │   │   ├── tools/               ← get_decisions, get_sessions...
│   │   │   └── server.ts
│   │   └── package.json
│   │
│   └── history/                      ← consulta de historial lazy
│       ├── src/
│       │   ├── tools/               ← search_decisions, get_fixes...
│       │   └── server.ts
│       └── package.json
│
├── templates/
│   ├── fallback/                     ← best practices por defecto
│   │   ├── claude-md/
│   │   ├── skills/
│   │   ├── commands/
│   │   └── agents/
│   ├── stacks/                       ← templates por stack
│   │   ├── nextjs/
│   │   ├── react-vite/
│   │   ├── node-express/
│   │   └── python-fastapi/
│   └── industries/                   ← ajustes por industria
│
└── docs/                             ← documentación
    ├── architecture.md
    ├── getting-started.md
    ├── cli-reference.md
    └── contributing.md
```

---

## 22. Fases de Construcción (plugin-first delivery)

No se puede construir todo de golpe. La secuencia respeta las dependencias y maximiza el valor en cada fase. Cada fase produce **plugins instalables** — no solo código.

### Fase 1 — Fundación + Core Plugin (el mínimo que da valor)

```
Duración estimada: 2-3 semanas
Valor: vibe init + switch funciona, Claude Code tiene contexto correcto
Entregable: @vibe/core-plugin v0.1

Construir:
├── packages/shared       ← tipos base, schemas
├── packages/db           ← schema + SQLite (Drizzle ORM)
├── packages/core         ← context-resolver (merge de 3 niveles)
│                           + rules-generator (genera .claude/rules/)
│                           + claude-md-generator (lean router ≤150 líneas)
│                           + budget-manager (token accounting)
├── packages/cli          ← vibe init, vibe switch, vibe status
├── plugins/core/         ← @vibe/core-plugin
│   ├── skills/: session-summary, learned-fix, smart-commit
│   ├── hooks: SessionStart (context inject), Stop (session summary)
│   ├── .mcp.json: vibe-context, vibe-history servers
│   └── commands/: switch, status, daily
├── templates/fallback/   ← rules fallback pack
└── mcp-servers/context   ← vibe-context MCP server

Resultado:
  vibe init --enterprise acme     → scaffolds .claude/ completo
  vibe switch acme abc            → CLAUDE.md + rules generados
  /plugin install core@vibe       → hooks + skills activos
  → Claude Code productivo con contexto correcto y multi-empresa
```

### Fase 2 — Memoria + Plan Mode (compound engineering)

```
Duración estimada: 2-3 semanas
Valor: Claude Code tiene "memoria" entre sesiones, planes persistentes
Entregable: @vibe/core-plugin v0.2

Construir:
├── packages/core         ← history-manager + relevance-scorer
├── mcp-servers/history   ← vibe-history MCP server
├── packages/cli          ← vibe session list, vibe decision search
├── plugins/core/         ← actualizar hooks:
│   ├── Stop hook → extrae decisiones + session summary
│   ├── PreCompact hook → checkpoint antes de compaction
│   └── UserPromptSubmit hook → inyecta contexto dinámico
└── Integración con Git   ← versionado de .claude/history/

Resultado:
  Stop hook → decisiones extraídas automáticamente
  SessionStart → historial relevante cargado (scored)
  PreCompact → checkpoint preserva estado antes de compaction
  Plan Mode: .claude/plans/ integrado con vibe plan
  → Claude Code mejora con cada sesión (compound engineering)
```

### Fase 3 — Validación Visual + Frontend Plugin

```
Duración estimada: 3-4 semanas
Valor: Claude Code puede "ver" lo que genera en frontend
Entregable: @vibe/frontend-plugin v0.1

Construir:
├── mcp-servers/browser-preview  ← Playwright headless + tools
├── mcp-servers/design-tokens    ← Figma API integration
├── plugins/frontend/            ← @vibe/frontend-plugin
│   ├── skills/: browser-preview (context: fork), component-check
│   ├── agents/: qa-visual
│   ├── hooks: PostToolUse (Write|Edit) → visual validation
│   └── .mcp.json: browser-preview, design-tokens servers
└── templates/                   ← template packs por stack
    ├── react-nextjs/            ← rules + docs para React/Next.js
    ├── vue-nuxt/
    └── svelte-kit/

Resultado:
  /project:browser-preview → skill con context: fork
  → Subagent qa-visual toma screenshot + analiza vs design system
  → PostToolUse hook auto-valida cada edit en componentes
  → ~80% correcto en primera iteración
```

### Fase 4 — Background Processing + Agent SDK

```
Duración estimada: 2-3 semanas
Valor: tareas largas no bloquean, CI/CD integrado
Entregable: @vibe/ci-action v0.1, workers operativos

Construir:
├── packages/queue        ← BullMQ setup, producers, notification
├── apps/workers          ← workers powered by Agent SDK:
│   ├── visual-regression-worker (Agent SDK + browser-preview MCP)
│   ├── ai-code-review-worker (Agent SDK + parallel subagents)
│   └── metrics-worker (análisis de sesiones)
├── packages/cli          ← vibe jobs, vibe review --ci
├── .github/actions/      ← vibe-dev/setup-action (reusable)
└── Integración Slack     ← Notification hook → Slack

Resultado:
  vibe visual-regression --ci → Agent SDK headless
  vibe review --pr 123        → AI code review con subagents
  GitHub Actions integrado     → vibe-dev/setup-action
  → Dev sigue trabajando, tareas pesadas corren en background
```

### Fase 5 — Web UI + Observabilidad

```
Duración estimada: 3-4 semanas
Valor: visibilidad del sistema, gestión visual, métricas

Construir:
├── apps/web              ← Next.js: dashboard, empresas, proyectos,
│                           métricas, jobs, contexto, rules editor
├── apps/workers          ← pattern-worker, promotion-worker
├── packages/core         ← metrics engine + promotion engine
└── Dashboard UX:
    ├── Token budget visualization
    ├── Session history timeline
    ├── Rules editor visual (con preview de tokens)
    ├── Plan Mode progress tracker
    └── Job queue monitor con logs

Resultado:
  vibe dashboard → abre Web UI local
  Métricas de calidad, productividad, costos
  Editor visual de rules con path-scoping preview
  Dashboard de jobs con logs y retry
```

### Fase 6 — Enterprise + Marketplace

```
Duración estimada: 4-6 semanas
Valor: escala a equipos, compliance, marketplace privado
Entregable: @vibe/enterprise-plugin, marketplace privado

Construir:
├── plugins/enterprise/   ← @vibe/enterprise-plugin
│   ├── hooks: audit logging, compliance checks
│   ├── skills/: data-residency-check
│   └── managed-settings.json template
├── packages/core         ← collaboration (branch decisions, locking)
├── packages/db           ← migrar a Postgres (opcional)
├── Vault integration     ← 1Password/HashiCorp
├── Private marketplace   ← template para empresas
│   ├── strictKnownMarketplaces config
│   ├── allowManagedHooksOnly enforcement
│   └── deniedMcpServers policy
└── Modo cloud            ← deploy de Web UI + API + Workers

Resultado:
  Múltiples devs en mismo proyecto sin conflictos
  Private marketplace por empresa
  Managed settings para governance
  Vault centralizado de credenciales
  → Plataforma lista para producción enterprise
```

### Mapa de dependencias entre fases

```
Fase 1 (Core Plugin)
  │
  ├──▶ Fase 2 (Memory + Plans)
  │       │
  │       ├──▶ Fase 4 (Workers + Agent SDK)
  │       │       │
  │       │       └──▶ Fase 5 (Web UI)
  │       │               │
  │       │               └──▶ Fase 6 (Enterprise)
  │       │
  │       └──▶ Fase 6 (Enterprise) [parcial: managed settings]
  │
  └──▶ Fase 3 (Frontend Plugin)
          │
          └──▶ Fase 4 (Workers) [visual regression via Agent SDK]
```

Fases 2 y 3 pueden construirse en paralelo después de la Fase 1.
Fase 4 requiere Fase 2 (hooks de session) y se beneficia de Fase 3 (visual regression).
Cada fase produce un plugin versionado que se distribuye via marketplace.

---

---

## 23. Context Window Budget Management

El context window de Claude Code es finito (200K tokens estándar, 500K enterprise). Todo lo que la plataforma inyecta — CLAUDE.md, rules, historial, design tokens, learned-fixes — compite por el mismo espacio que el dev necesita para trabajar. Sin gestión activa, el contexto inyectado puede consumir tanto espacio que Claude Code pierde efectividad.

### 23.1. Token budget por componente (optimizado con rules + tool search)

```
Context Window Total: 200,000 tokens (estándar)

Distribución objetivo con rules path-scoping + tool search:
┌────────────────────────────────────────────────────────────────┐
│ Componente                │ Budget máx.  │ % del total         │
├───────────────────────────┼──────────────┼─────────────────────┤
│ Sistema (Claude Code)     │ ~15,000      │ 7.5%  (no control.) │
│ CLAUDE.md (lean router)   │ 3,000        │ 1.5%  (↓ de 8K)    │
│ .claude/rules/ (activas)  │ 5,000        │ 2.5%  (path-scoped) │
│   ├── Globales (siempre)  │ 2,000        │                     │
│   └── Path-scoped (dyn.)  │ 3,000        │  solo las relevantes│
│ Historial relevante       │ 10,000       │ 5%                  │
│   ├── Última sesión       │ 4,000        │                     │
│   ├── Decisiones activas  │ 3,000        │                     │
│   └── Learned fixes       │ 3,000        │                     │
│ Design system (si front.) │ 5,000        │ 2.5%                │
│ MCP tool definitions      │ 3,000        │ 1.5%  (↓ de 10K)   │
│   (con tool search activo)│              │  85% reducción      │
│ Skills descriptions       │ 2,000        │ 1%    (solo names)  │
│ Active plan (si existe)   │ 2,000        │ 1%                  │
│ ─────────────────────────────────────────────────────────────  │
│ Total inyectado           │ ~45,000      │ 22.5% (↓ de 25.5%) │
│ DISPONIBLE PARA TRABAJO   │ ~155,000     │ 77.5% (↑ de 74.5%) │
└────────────────────────────────────────────────────────────────┘

Mejoras vs versión anterior:
├── CLAUDE.md lean (150 líneas ≈ 3K tokens vs 500 líneas ≈ 8K)
├── Rules path-scoped: solo las relevantes se cargan (no todas)
├── Tool search: 50K en tool defs → 3K (defer_loading)
├── Skills progressive disclosure: solo descripción, no contenido
└── Total: ~6K tokens recuperados para trabajo real

Regla de oro: el contexto inyectado nunca debe superar el 25%
del context window. El 75% restante es para el trabajo real.
```

### 23.2. Budget Manager (componente del Context Engine)

```
El Context Engine incluye un BudgetManager que:

1. Mide cada pieza ANTES de inyectar:
   ├── Usa tiktoken (tokenizer de referencia) para contar tokens
   ├── Cada componente tiene un budget máximo asignado
   └── Si un componente excede su budget, se trunca o resume

2. Prioriza con cascada de recorte:
   Si el total inyectado > 25% del window:
   ├── Paso 1: Reducir design system a tokens esenciales
   ├── Paso 2: Reducir historial a solo learned-fixes de alta relevancia
   ├── Paso 3: Comprimir decisiones (solo título + conclusión)
   ├── Paso 4: Desactivar rules path-scoped menos prioritarias
   └── Paso 5: Desactivar MCP servers a defer_loading

3. Progressive disclosure nativo:
   ├── CLAUDE.md: router con pointers (no contenido completo)
   ├── Rules: se cargan por path match, no todas siempre
   ├── Skills: solo descripción cargada, contenido bajo demanda
   │   ("I know Kung Fu" pattern — se carga al activarse)
   ├── Docs: accesibles vía @path o MCP, no pre-cargados
   └── History: consultable vía MCP history tool, no inyectado

4. Métricas de eficiencia:
   ├── Tokens inyectados vs tokens de trabajo por sesión
   ├── % de contexto inyectado que Claude realmente referencia
   ├── Alertas si el budget excede el 25% en una sesión
   └── Recomendaciones: "CLAUDE.md tiene 200 líneas, recomendar split a rules"
```

### 23.3. Estrategia de Tool Search (defer_loading nativo)

```
Claude Code soporta defer_loading nativamente para MCP servers.
Nuestra plataforma lo configura en .claude/.mcp.json:

MCP Servers configurados con defer_loading:
├── Siempre cargados (defer_loading: false):
│   ├── vibe-context (esencial para cualquier tarea)
│   └── herramientas de filesystem (Read, Write, Edit, Bash)
│
├── Carga bajo demanda (defer_loading: true):
│   ├── browser-preview (solo si tarea es frontend)
│   ├── design-tokens (solo si se menciona design/UI)
│   ├── jira/linear (solo si se menciona ticket/issue)
│   ├── slack (solo si se pide notificar)
│   ├── figma (solo si se menciona diseño)
│   └── vibe-history (solo si se busca contexto pasado)
│
└── Resultado: de ~50K tokens en tools a ~3K iniciales
    Claude descubre el resto cuando lo necesita via tool search
```

### 23.4. Compaction awareness (PreCompact hook)

Claude Code implementa compaction automática. La plataforma coopera activamente:

```
Estrategias:
├── PreCompact hook: ANTES de que se compacte, extraer:
│   ├── Decisiones pendientes → .claude/history/decisions/
│   ├── Learned-fixes detectados → .claude/history/patterns/
│   ├── Progreso de active-plan → actualizar TodoWrite
│   └── Context checkpoint → para claude --resume
│
├── CLAUDE.md + rules como ancla: sobreviven compactions
│   porque se recargan. Lo más crítico va en rules, no en chat.
│
├── Plan Mode como ancla: .claude/plans/active-plan.md
│   sobrevive compactions (archivo, no chat).
│   Claude retoma el plan al recargarse.
│
├── Monitoreo del % de contexto usado: vibe status muestra
│   tokens usados / tokens disponibles en el status bar.
│
├── Context resets entre fases: sesiones separadas para
│   planificación (Plan Mode) y ejecución (normal).
│   Cada fase arranca con contexto limpio + plan.
│
└── Nota: Anthropic ofrece 1M tokens en beta para Sonnet 4/4.5
    (tier 4+). Si disponible, el budget manager ajusta
    proporcionalmente. Con 1M, la regla del 25% da ~250K
    tokens de inyección → contextos mucho más ricos.
```

---

## 24. Rate Limiting de APIs Externas

Toda herramienta externa tiene rate limits. Ignorarlos lleva a errores silenciosos, datos incompletos, y experiencias degradadas. La plataforma necesita gestionar esto de forma centralizada.

### 24.1. Mapa de rate limits por servicio

```
┌──────────────────┬────────────────────┬──────────────────────┐
│ Servicio          │ Rate Limit          │ Impacto              │
├──────────────────┼────────────────────┼──────────────────────┤
│ GitHub API (auth) │ 5,000 req/hora      │ PRs, issues, repos   │
│ Jira Cloud        │ ~100 req/min        │ Tickets, búsquedas   │
│ Linear            │ 100 req/min         │ Issues, projects     │
│ Figma REST API    │ ~120 req/min        │ Design tokens, files │
│ Slack Web API     │ ~50 req/min (tier3) │ Mensajes, channels   │
│ Claude API        │ Varía por tier      │ Análisis, resúmenes  │
│ Confluence        │ ~100 req/min        │ Documentación        │
│ Notion API        │ 3 req/segundo       │ Docs, databases      │
│ 1Password CLI     │ Sin rate limit      │ Secrets locales      │
│ HashiCorp Vault   │ Configurable        │ Secrets enterprise   │
└──────────────────┴────────────────────┴──────────────────────┘
```

### 24.2. Rate Limit Manager centralizado

```
Componente: @vibe/core → RateLimitManager

Estrategia por servicio:
├── Token bucket: cada servicio tiene un bucket de tokens
│   que se rellena a su rate específico.
│
├── Pre-flight check: antes de cada request, el manager
│   verifica si hay tokens disponibles. Si no:
│   ├── Cola la request (no la descarta)
│   ├── Aplica backoff con jitter
│   └── Notifica al dev si la espera supera umbral
│
├── Rate limit headers: lee X-RateLimit-Remaining,
│   X-RateLimit-Reset, Retry-After de cada respuesta
│   y ajusta el bucket dinámicamente.
│
├── Batch optimization: agrupa requests cuando es posible.
│   Ejemplo: en vez de 50 llamadas individuales a Jira,
│   usa bulk API si disponible.
│
├── Request deduplication: si dos procesos piden lo mismo
│   dentro de una ventana de 5s, retorna resultado cacheado.
│
└── Distribución entre workers: si hay múltiples workers
    haciendo requests al mismo servicio, el budget se
    reparte para evitar que un worker consuma todo.

Implementación: Bottleneck (npm) como librería base.
Bottleneck es el estándar para rate limiting en Node.js:
├── Soporta clustering (múltiples workers comparten budget)
├── Reservoir con refill automático
├── Priority queuing
├── Integración con Redis para distribuido
└── 3.2M descargas semanales, mantenido activamente
```

### 24.3. Graceful degradation por rate limit

```
Cuando un servicio alcanza su rate limit:

Nivel 1 (espera corta, < 30s):
├── Cola silenciosamente, el dev no nota
└── Log para métricas

Nivel 2 (espera media, 30s – 5min):
├── Notificación al dev: "Figma API rate limited, retrying en 2min"
├── Si es batch job: reduce paralelismo automáticamente
└── Continúa con trabajo que no dependa de ese servicio

Nivel 3 (espera larga o bloqueo, > 5min):
├── Notificación prominente: "GitHub API bloqueado por 15min"
├── Fallback si existe (leer de cache local)
├── Si es migración: pausa el batch, resume automáticamente
└── Dashboard muestra countdown
```

---

## 25. Recuperación de Outputs Erróneos de la IA

Claude no siempre acierta. Un ADR mal formulado, un learned-fix incorrecto, o una decisión arquitectónica inadecuada puede contaminar sesiones futuras si se persiste sin validación.

### 25.1. Niveles de confianza por tipo de output

```
Confianza ALTA (se persiste automáticamente):
├── Errores de compilación corregidos → learned-fix
├── Dependencias instaladas → registradas
├── Tests escritos y pasando → se commitean
└── Configuraciones estándar → se aplican

Confianza MEDIA (se persiste con flag "pending-review"):
├── Decisiones arquitectónicas → ADR marcado como "draft"
├── Convenciones nuevas sugeridas → flag "needs-validation"
├── Refactors estructurales → requieren PR review
└── Design patterns propuestos → marcados como "proposal"

Confianza BAJA (NO se persiste sin aprobación humana):
├── Cambios en convenciones existentes → require override explícito
├── Eliminación de código/features → require confirmación
├── Decisiones que contradicen ADRs previos → alerta de conflicto
└── Promoción de conocimiento proyecto → empresa → requiere review
```

### 25.2. Sistema de cuarentena

```
Cuando se detecta una decisión potencialmente problemática:

1. Detección automática:
   ├── Contradicción con ADRs existentes (comparación semántica)
   ├── Learned-fix que causa regresiones (si el error reaparece)
   ├── Decisión con baja confianza de Claude (cuando Claude
   │   explícitamente indica incertidumbre)
   └── Decisión revertida por otro dev en la misma sesión

2. Proceso de cuarentena:
   ├── El item se mueve a .claude/history/quarantine/
   ├── NO se inyecta en futuras sesiones
   ├── Se notifica al dev: "Decisión X en cuarentena, ¿validar?"
   └── Visible en Web UI con opción de aprobar/rechazar/editar

3. Resolución:
   ├── Aprobar → se mueve a decisiones activas
   ├── Rechazar → se marca como "invalidated", permanece en
   │   historial como referencia negativa ("no hacer esto")
   └── Editar → dev corrige y aprueba la versión corregida

4. Referencia negativa:
   Las decisiones rechazadas se convierten en anti-patterns:
   "No usar X pattern para Y porque Z"
   Esto previene que Claude repita el mismo error.
```

### 25.3. Feedback loop de calidad

```
Métricas de calidad de output de la IA:

Tracking automático:
├── % de ADRs que permanecen activos vs invalidados
├── % de learned-fixes que efectivamente previenen recurrencia
├── % de código generado que pasa review en primer intento
├── Frecuencia de cuarentena por proyecto (indica calidad del contexto)
└── Tasa de contradicciones detectadas

Si la calidad degrada:
├── Alerta: "El proyecto ABC tiene 15% de decisiones en cuarentena
│   esta semana (normal: < 5%)"
├── Diagnóstico: ¿CLAUDE.md desactualizado? ¿Historial contaminado?
│   ¿Contexto insuficiente? ¿Modelo con comportamiento diferente?
└── Acción: revisar y limpiar contexto, actualizar CLAUDE.md,
    purgar decisiones obsoletas
```

---

## 26. Lifecycle y Retención de Datos

Sin políticas de retención, los datos se acumulan indefinitamente. Un proyecto de 6 meses puede generar cientos de sesiones, miles de decisiones, y gigabytes de screenshots de baseline.

### 26.1. Política de retención por tipo de dato

```
┌────────────────────────┬──────────────┬────────────────────────┐
│ Tipo de dato            │ Retención    │ Acción al expirar       │
├────────────────────────┼──────────────┼────────────────────────┤
│ Sesiones (resúmenes)   │ 90 días      │ Archivar (comprimido)  │
│ Decisiones activas     │ Indefinido*  │ Review semestral       │
│ Decisiones invalidadas │ 180 días     │ Eliminar               │
│ Learned-fixes activos  │ Indefinido*  │ Review si 0 ocurrencias│
│                        │              │ en 90 días             │
│ Learned-fixes obsoletos│ 90 días      │ Eliminar               │
│ Screenshots baseline   │ Último + 2   │ Purgar versiones       │
│                        │ previos      │ anteriores             │
│ Visual regression diffs│ 30 días      │ Eliminar (reports en   │
│                        │              │ Git permanecen)        │
│ Logs de jobs           │ 30 días      │ Rotación automática    │
│ Métricas detalladas    │ 90 días      │ Agregar a resúmenes    │
│ Métricas agregadas     │ Indefinido   │ —                      │
│ Audit logs             │ 1 año        │ Archivar cifrado       │
│ Cross-tool interactions│ 90 días      │ Archivar               │
│ Credenciales revocadas │ 0 días       │ Crypto-shredding       │
│                        │              │ inmediato              │
└────────────────────────┴──────────────┴────────────────────────┘

*Indefinido con review periódico: cada 6 meses, las decisiones
 y learned-fixes se revisan. Las que ya no aplican (stack
 cambiado, dependencia eliminada) se marcan como obsoletas.
```

### 26.2. Archivado y purga automática

```
Proceso automatizado (background worker: retention-worker):

Diario:
├── Rotar logs de jobs > 30 días
├── Purgar screenshots de visual regression > 30 días
└── Limpiar jobs completados de la cola > 7 días

Semanal:
├── Archivar sesiones > 90 días (comprimir + mover a archive/)
├── Purgar diffs de visual regression viejos
└── Agregar métricas detalladas > 90 días a resúmenes mensuales

Mensual:
├── Review de decisiones invalidadas > 180 días → eliminar
├── Review de learned-fixes sin ocurrencias en 90 días → marcar
├── Purgar baselines de screenshots que no sean los últimos 3
└── Generar reporte de uso de storage por proyecto

Semestral (trigger manual con sugerencia automática):
├── Review de ADRs activos: ¿siguen aplicando?
├── Review de convenciones: ¿se usan realmente?
├── Review de CLAUDE.md: ¿está actualizado?
└── Reporte de higiene del contexto
```

### 26.3. Gestión de tamaño del repositorio

```
Los archivos en .claude/ viven en Git. Sin gestión,
el repo crece sin control.

Estrategias:
├── .gitignore selectivo:
│   ├── .claude/cache/ → nunca en Git
│   ├── .claude/baselines/ → en Git (necesario para diffs)
│   ├── .claude/history/archive/ → en Git LFS o separado
│   └── .claude/logs/ → nunca en Git
│
├── Git LFS para binarios:
│   ├── Screenshots de baseline → Git LFS
│   ├── Diffs visuales → Git LFS
│   └── Configurable por proyecto
│
├── Alertas de tamaño:
│   ├── .claude/ > 50MB → warning
│   ├── .claude/ > 100MB → alerta + recomendación de purga
│   └── vibe health muestra tamaño por subdirectorio
│
└── Comando de limpieza:
    vibe clean [--aggressive] [--dry-run]
    ├── --dry-run: muestra qué se eliminaría
    ├── default: aplica política de retención
    └── --aggressive: purga todo archivable
```

---

## 27. Modelo de Negocio y Licencia

La elección de modelo de negocio impacta decisiones técnicas (telemetría, multi-tenancy, auth) y la sostenibilidad del proyecto.

### 27.1. Modelo propuesto: Open-Core

```
Modelo: Open-Core (MIT para core, licencia commercial para enterprise)

Tier                  Licencia    Qué incluye
─────                 ────────    ───────────
Community (gratis)    MIT         CLI, Context Engine, templates base,
                                  MCP servers custom, SQLite local,
                                  hasta 3 empresas, 10 proyectos.
                                  Uso individual o equipo pequeño.

Team ($X/dev/mes)     Commercial  Todo Community +
                                  Web UI completa, PostgreSQL support,
                                  métricas avanzadas, colaboración
                                  multi-dev, Slack/Teams integration,
                                  soporte por email.

Enterprise (custom)   Commercial  Todo Team +
                                  SSO/SAML, audit logs avanzados,
                                  data residency configurable,
                                  HashiCorp Vault nativo,
                                  SLA de soporte, onboarding dedicado,
                                  custom MCP servers por contrato.
```

### 27.2. Qué es open-source y qué no

```
Open-source (MIT):
├── packages/core (Context Engine)
├── packages/cli (CLI Tool)
├── packages/db (schema + migrations)
├── packages/shared (tipos)
├── packages/queue (sistema de colas)
├── mcp-servers/* (todos los MCP servers custom)
├── templates/* (todos los templates)
└── apps/workers (background workers)

Source-available / Commercial:
├── apps/web (Web UI con dashboard completo)
├── Módulo de colaboración multi-dev
├── Integración SSO/SAML
├── Audit logging avanzado
├── Módulo de data residency
└── Métricas enterprise (comparativas cross-equipo)

Justificación:
├── El CLI y core abiertos permiten adopción individual sin friccón
├── La Web UI y colaboración son el valor diferencial para equipos
├── Los MCP servers abiertos permiten que la comunidad contribuya
├── Los templates abiertos garantizan calidad del contenido base
└── Modelo probado: Supabase, Cal.com, GitLab, Airbyte usan
    variantes de open-core con éxito
```

### 27.3. Telemetría

```
Telemetría anónima opt-in (siguiendo estándar de Next.js/Turbo):

Qué se recoge (si el usuario opta in):
├── Versión del CLI
├── OS y versión de Node
├── Comandos ejecutados (sin argumentos, sin datos de proyecto)
├── Duración de sesiones
├── Errores de la plataforma (no del código del usuario)
└── Features más usados

Qué NUNCA se recoge:
├── Código fuente
├── Nombres de empresas, proyectos, o archivos
├── Contenido de CLAUDE.md o historial
├── Credenciales o tokens
├── Datos de conversación con Claude
└── Cualquier dato de negocio

Cómo se desactiva:
├── vibe telemetry disable
├── VIBE_TELEMETRY_DISABLED=1
├── .viberc: { "telemetry": false }
└── No se pregunta en cada sesión: una vez configurado, respetado
```

---

## 28. Compatibilidad Cross-Platform

La plataforma debe funcionar en las tres plataformas principales de desarrollo.

### 28.1. Matriz de compatibilidad

```
┌───────────────┬──────────────┬──────────────┬──────────────┐
│ Componente     │ macOS        │ Linux        │ Windows      │
├───────────────┼──────────────┼──────────────┼──────────────┤
│ CLI            │ ✅ Nativo    │ ✅ Nativo    │ ✅ Nativo    │
│ Context Engine │ ✅           │ ✅           │ ✅           │
│ SQLite         │ ✅ better-   │ ✅ better-   │ ✅ better-   │
│                │ sqlite3      │ sqlite3      │ sqlite3      │
│ Redis/BullMQ   │ ✅ brew      │ ✅ apt/snap  │ ⚠️ WSL2 rec. │
│ Playwright     │ ✅           │ ✅           │ ✅           │
│ MCP servers    │ ✅           │ ✅           │ ✅           │
│ Web UI (local) │ ✅           │ ✅           │ ✅           │
│ Git hooks      │ ✅           │ ✅           │ ⚠️ CRLF cfg  │
│ 1Password CLI  │ ✅           │ ✅           │ ✅           │
│ File watchers  │ ✅ FSEvents  │ ✅ inotify   │ ⚠️ chokidar  │
└───────────────┴──────────────┴──────────────┴──────────────┘

⚠️ = funciona con configuración adicional
```

### 28.2. Normalización cross-platform

```
Estrategias implementadas:
├── Paths: usar path.join() y path.resolve() siempre.
│   Nunca hardcodear separadores. Usar pathe (npm) como
│   alternativa cross-platform a path de Node.
│
├── Line endings: .gitattributes forzar LF para archivos
│   generados (.claude/*, CLAUDE.md, skills, etc.)
│
├── File permissions: no depender de chmod en Windows.
│   Usar fs.access() para verificar permisos.
│
├── Shell commands: evitar comandos Unix-only en el CLI.
│   Usar execa (npm) en vez de child_process directo.
│   Detectar shell disponible y adaptar.
│
├── Home directory: usar os.homedir() o env-paths (npm)
│   para ~/.vibe/ (config), ~/.vibe/cache/ (datos locales).
│
├── Redis en Windows: documentar WSL2 como recomendado.
│   Alternativa: better-queue + SQLite (sin Redis).
│   Detectar automáticamente y sugerir la alternativa.
│
└── CI/CD: testear en las 3 plataformas en GitHub Actions.
    Matrix build: [ubuntu-latest, macos-latest, windows-latest].
```

### 28.3. Docker como escape hatch

```
Para entornos complejos o para evitar problemas de compatibilidad:

docker run -it --rm \
  -v $(pwd):/workspace \
  -v ~/.vibe:/home/node/.vibe \
  ghcr.io/vibe/cli:latest \
  vibe switch acme abc

El contenedor incluye:
├── Node.js 22 LTS
├── CLI + Context Engine preinstalados
├── Redis embebido (para BullMQ)
├── Playwright con browsers
└── SQLite

Uso principal: CI/CD pipelines donde instalar todo es costoso.
Para dev diario, preferir instalación nativa.
```

### 28.4. Supply Chain Security (post-Shai Hulud 2025)

Los ataques Shai Hulud de septiembre-noviembre 2025 demostraron que `npm install` es un vector de ejecución remota de código. Como plataforma que se instala globalmente y maneja credenciales, la seguridad de la cadena de suministro es crítica.

```
Hardening del monorepo:

1. Lifecycle scripts deshabilitados por defecto:
   .npmrc:
   ignore-scripts=true
   # Solo habilitar para paquetes explícitamente confiables
   # con --ignore-scripts=false en CI

2. Lockfile estricto:
   ├── pnpm-lock.yaml siempre en Git
   ├── CI usa pnpm install --frozen-lockfile (nunca modifica lock)
   ├── Renovate/Dependabot para updates controlados con auto-merge
   │   solo para patch versions de paquetes confiables
   └── Cooldown de 72h para nuevas versiones major/minor

3. Auditoría automatizada:
   ├── pnpm audit en cada CI run
   ├── Socket.dev o Snyk para análisis de dependencias
   ├── SBOM (Software Bill of Materials) generado en cada release
   └── Alertas automáticas si se detecta dependencia comprometida

4. Provenance y verificación:
   ├── npm provenance habilitado para nuestros paquetes publicados
   ├── Sigstore para firma de artefactos
   ├── Verificar provenance de dependencias críticas
   └── Pin exact versions para dependencias de seguridad

5. Secrets hygiene:
   ├── Nunca en .env files (usar vault o env injection en CI)
   ├── npm tokens con permisos mínimos y rotación automática
   ├── 2FA obligatorio para publish de paquetes @vibe/*
   └── GitHub CODEOWNERS para package.json y lockfiles
```

---

## 29. Integración con CI/CD (Agent SDK-powered)

La plataforma genera contexto para Claude Code y también se integra con pipelines CI/CD. En CI, usamos el **Agent SDK** para ejecutar agentes programáticamente (no Claude Code interactivo).

### 29.1. GitHub Actions (first-class support)

```yaml
# .github/workflows/vibe-checks.yml
# Generado por: vibe project init --ci github-actions

name: Vibe Quality Checks
on:
  pull_request:
    branches: [main, develop]

jobs:
  visual-regression:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: vibe-dev/setup-action@v1  # instala CLI + Agent SDK
      - run: vibe visual-regression --ci
        # Internamente usa Agent SDK:
        # query({ prompt: "Run visual regression...",
        #   options: { allowedTools: ['Read', 'Bash', 'mcp__browser-preview__*'],
        #     permissionMode: 'acceptEdits' }})
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          VIBE_PROJECT: ${{ vars.VIBE_PROJECT }}
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: visual-diffs
          path: .claude/reports/visual-regression/

  context-health:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: vibe-dev/setup-action@v1
      - run: vibe health --ci --fail-on-warning
      # Verifica: CLAUDE.md ≤ 150 líneas, rules válidas,
      # no decisiones huérfanas, learned-fixes válidos,
      # baselines actualizados, plugins up-to-date

  accessibility-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: vibe-dev/setup-action@v1
      - run: vibe audit a11y --ci --threshold 95

  ai-code-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: vibe-dev/setup-action@v1
      - run: vibe review --ci --pr ${{ github.event.pull_request.number }}
        # Usa Agent SDK con subagents paralelos:
        # - Subagent 1: review convenciones (lee .claude/rules/)
        # - Subagent 2: review seguridad
        # - Subagent 3: review performance
        # Resultados combinados → PR comment
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 29.2. Agent SDK en CI vs Claude Code interactivo

```
                    Dev local              CI/CD
                    ─────────              ─────
Runtime:            Claude Code CLI        Agent SDK (programático)
Interactividad:     Sí (terminal)          No (headless)
Permissions:        Prompt al dev          acceptEdits (auto-approve)
Context:            .claude/ completo      .claude/ del repo + env vars
MCP servers:        Locales + empresa      Solo los necesarios
Hooks:              Todos activos          Solo CI-relevant
Plan Mode:          Sí                     No (ejecución directa)
Cost tracking:      Via session            Via Agent SDK usage stats

Agent SDK permite:
├── Ejecutar agentes con tools restringidos
├── Streaming de resultados para logging
├── Subagents paralelos (visual + a11y + security)
├── Timeout y budget control (max_turns, max_tokens)
├── Hook callbacks programáticos (no shell scripts)
└── Session management para multi-step CI jobs
```

### 29.3. Reusable actions publicadas

```
vibe-dev/setup-action@v1
├── Instala Node.js 22 (si no existe)
├── Instala @vibe/cli + Agent SDK
├── Configura cache de pnpm
├── Instala Playwright browsers (si se necesitan)
├── Lee .claude/settings.json del repo para configuración
└── Valida que plugins requeridos estén en el repo

vibe-dev/visual-regression-action@v1
├── Ejecuta visual regression via Agent SDK
├── Genera reporte HTML como artifact
├── Comenta en el PR con resumen y diffs (imágenes)
└── Soporta threshold configurable (default: 0.1% pixel diff)

vibe-dev/ai-review-action@v1
├── Code review automatizado con subagents paralelos
├── Lee .claude/rules/ para aplicar convenciones del proyecto
├── Confidence scoring para filtrar false positives
└── PR comment con findings categorizados
```

### 29.4. Soporte multi-CI

```
vibe project init --ci [github-actions | gitlab-ci | jenkins | circleci]

Genera:
├── Workflow/pipeline files apropiados para el CI
├── Configuración de cache optimizada
├── Jobs paralelos cuando es posible
├── Integration con PR/MR comments
├── Artifact upload para reportes visuales
└── Agent SDK config con API key reference

GitLab CI: genera .gitlab-ci.yml con stages equivalentes
Jenkins: genera Jenkinsfile con parallel stages
CircleCI: genera .circleci/config.yml con orb custom
```

---

## 30. Evolución del Modelo de IA

Cuando Anthropic lanza un nuevo modelo o cambia el comportamiento de Claude Code, los CLAUDE.md, skills, y prompts existentes pueden degradarse. Necesitamos una estrategia de adaptación.

### 30.1. Versionado de compatibilidad de modelo

```
Cada perfil de proyecto incluye compatibilidad de modelo:

.claude/model-compat.json:
{
  "tested_with": "claude-sonnet-4-5-20250929",
  "last_validated": "2026-02-01",
  "known_issues": [],
  "opus_routing_threshold": "architectural",
  "sonnet_compatible": true,
  "haiku_compatible_tasks": ["docs", "simple-fixes"]
}

Cuando se detecta un modelo nuevo disponible:
├── Log: "Nuevo modelo disponible: claude-sonnet-4-6-20260415"
├── No migrar automáticamente: el modelo testeado sigue siendo default
├── Comando: vibe model test [new-model]
│   ├── Ejecuta batería de prompts de validación contra el nuevo modelo
│   ├── Compara outputs con los del modelo actual
│   ├── Genera reporte de diferencias
│   └── Recomienda si es seguro migrar
└── Comando: vibe model upgrade [new-model]
    ├── Actualiza model-compat.json
    ├── Marca decisiones previas como "validated-on-previous-model"
    └── Inicia periodo de observación de 7 días
```

### 30.2. Abstracción de prompts

```
Los prompts y directivas en CLAUDE.md y skills NO deben depender
de comportamiento específico de una versión del modelo.

Buenas prácticas:
├── Escribir instrucciones claras y explícitas, no trucos de prompt
│   que explotan quirks del modelo actual.
│
├── Usar formatos estándar (XML tags, Markdown headers) que son
│   estables entre versiones de Claude.
│
├── Mantener skills con ejemplos concretos de input/output esperado,
│   no instrucciones vagas que diferentes modelos interpretan distinto.
│
├── Separar la "intención" de la "implementación" en los skills:
│   ├── Intención: "Genera un componente React con tipos TypeScript"
│   └── No: "Usa tu capacidad de code generation para..."
│
└── Evaluar skills con test suite:
    Cada skill tiene ejemplos de input y output esperado.
    Al cambiar de modelo, correr los tests valida compatibilidad.
```

### 30.3. Periodo de observación post-upgrade

```
Tras cambiar de modelo:

Días 1-3: Observación activa
├── Métricas de calidad comparadas con baseline del modelo anterior
├── Cuarentena automática más agresiva (threshold más bajo)
├── Log detallado de diferencias observadas
└── Dev recibe resumen diario de comportamiento

Días 4-7: Estabilización
├── Si métricas iguales o mejores: confirmar upgrade
├── Si métricas degradadas: analizar y ajustar contexto
├── Si métricas muy degradadas: rollback automático
└── Actualizar known_issues si se descubren

Después: Operación normal
├── model-compat.json actualizado con fecha de validación
├── Periodo de observación finalizado
└── Baseline de métricas actualizado
```

---

## 31. Documentación de la Plataforma

Sin documentación de calidad, la adopción se estanca. La documentación es producto, no afterthought.

### 31.1. Estructura de documentación

```
docs.vibe.dev (o /docs en el monorepo)

Estructura siguiendo Diátaxis framework (estándar 2024):
├── Tutorials (learning-oriented):
│   ├── getting-started.md — instalación + primera empresa + proyecto
│   ├── first-session.md — tu primera sesión con Claude Code + Vibe
│   ├── adding-history.md — cómo el historial mejora las sesiones
│   └── visual-validation.md — configurar validación frontend
│
├── How-to Guides (task-oriented):
│   ├── switch-projects.md
│   ├── configure-tools.md
│   ├── setup-design-tokens.md
│   ├── migrate-tools.md
│   ├── manage-team.md
│   ├── setup-ci-cd.md
│   ├── custom-mcp-server.md
│   └── troubleshooting.md
│
├── Reference (information-oriented):
│   ├── cli-reference.md — todos los comandos con flags
│   ├── configuration.md — .viberc, CLAUDE.md, settings
│   ├── api-reference.md — tRPC API si aplica
│   ├── schema-reference.md — modelo de datos
│   ├── mcp-tools-reference.md — tools expuestos por cada MCP
│   └── environment-variables.md
│
└── Explanation (understanding-oriented):
    ├── architecture.md — este documento, versión pública
    ├── context-hierarchy.md — por qué 3 niveles
    ├── capability-model.md — por qué capacidades, no herramientas
    ├── history-scoring.md — cómo funciona el relevance scoring
    └── security-model.md — aislamiento, vault, sanitización
```

### 31.2. Docs-as-code

```
Framework: VitePress (estándar 2025 para docs de proyectos TS)

Justificación:
├── Vite-powered: HMR instantáneo, build rápido
├── Vue-based pero no requiere saber Vue
├── Markdown-first con componentes Vue opcionales
├── Search integrado (MiniSearch, local, sin Algolia)
├── Sidebar auto-generado desde estructura de archivos
├── Dark mode, responsive, mobile-first
├── Usado por: Vue, Vite, Rollup, Pinia, VueUse, UnoCSS
└── Deploya en GitHub Pages, Vercel, Netlify, Cloudflare

Integración:
├── Vive en docs/ del monorepo
├── Turbo build incluye docs
├── API reference auto-generada desde tipos TypeScript (typedoc)
├── CLI reference auto-generada desde Commander.js definitions
└── Versioned docs por release major
```

---

## 32. Developer Experience (DX) de Primera Ejecución

Los primeros 5 minutos determinan si alguien adopta la herramienta o la abandona. El setup wizard y los error messages son críticos.

### 32.1. Happy path: primera ejecución

```
$ npm install -g @vibe/cli

$ vibe

  ╭────────────────────────────────────────╮
  │                                        │
  │   Welcome to Vibe 🎵                   │
  │   Vibe coding management platform      │
  │                                        │
  │   Let's set up your environment.       │
  │                                        │
  ╰────────────────────────────────────────╯

  Checking dependencies...
  ✓ Node.js 22.11.0
  ✓ Git 2.43.0
  ✓ Claude Code 2.1.x detected (plugins ✓, hooks ✓, rules ✓)
  ⚠ Redis not found (optional, needed for advanced queue)
    → Using SQLite-based queue instead. This is fine for solo dev.
    → Install Redis later with: brew install redis (macOS)

  ✓ Environment ready!

  ? What would you like to do?
  › Create your first enterprise
    Import existing project
    Explore with demo data
    Read the docs
```

### 32.2. Error messages amigables

```
Principios (siguiendo CLI UX guidelines de Charm/Ink):
├── Dí qué pasó, no solo el código de error
├── Sugiere la acción correctiva
├── Incluye link a docs si el error es complejo
├── Nunca mostrar stack traces a menos que --verbose

Ejemplo bueno:
  ✗ Could not connect to Figma API

  The Figma token for enterprise "Acme" appears to be expired.
  Last successful connection: 2026-01-15

  To fix this:
    1. Generate a new token at https://figma.com/developers
    2. Run: vibe config set acme.figma.token <new-token>

  Docs: https://docs.vibe.dev/how-to/configure-tools#figma

Ejemplo malo:
  Error: FIGMA_API_401_UNAUTHORIZED
  at FigmaClient.request (/usr/local/lib/...)
```

### 32.3. Modo demo

```
vibe demo

Crea una estructura de ejemplo completa sin credenciales reales:
├── Empresa "Demo Corp" con convenciones de ejemplo
├── Proyecto "Demo App" (Next.js, fullstack)
├── Historial simulado con 10 sesiones de ejemplo
├── 5 decisiones ADR de ejemplo
├── 3 learned-fixes de ejemplo
├── Design tokens mock (sin Figma real)
├── CLAUDE.md generado con contexto realista
└── El dev puede explorar todos los comandos sin riesgo

Útil para:
├── Evaluación de la herramienta antes de decidir adoptarla
├── Demos a equipo/management
├── Testing de contribuciones al proyecto
└── Onboarding de nuevos developers al equipo
```

---

## 33. Plugin / Extension System (Claude Code Plugins nativo)

La plataforma se distribuye usando el sistema nativo de **plugins de Claude Code** — no un sistema propietario. Esto permite que skills, agents, hooks, MCP servers, y LSP servers se empaqueten y distribuyan como plugins instalables.

### 33.1. Anatomía de un plugin de la plataforma

```
@vibe/core-plugin/
├── .claude-plugin/
│   └── plugin.json              ← REQUERIDO: manifest del plugin
│       {
│         "name": "vibe-core",
│         "version": "2.1.0",
│         "description": "Core context management for multi-enterprise vibe coding",
│         "author": { "name": "Vibe Dev", "email": "team@vibe.dev" },
│         "commands": ["switch", "status", "daily"],
│         "agents": ["explorer", "planner"],
│         "skills": ["session-summary", "learned-fix", "smart-commit"]
│       }
│
├── commands/                    ← slash commands
│   ├── switch.md                → /project:switch (reconfigura contexto)
│   ├── status.md                → /project:status (estado del proyecto)
│   └── daily.md                 → /project:daily (resumen del día)
│
├── skills/                      ← skills (auto-invocables + manuales)
│   ├── session-summary/
│   │   └── SKILL.md
│   ├── learned-fix/
│   │   └── SKILL.md
│   ├── smart-commit/
│   │   └── SKILL.md
│   └── knowledge-promote/
│       └── SKILL.md
│
├── agents/                      ← subagent definitions
│   ├── explorer.md
│   └── planner.md
│
├── hooks.json                   ← hook configurations
│   {
│     "hooks": {
│       "SessionStart": [{
│         "hooks": [{
│           "type": "command",
│           "command": "${CLAUDE_PLUGIN_ROOT}/scripts/context-inject.sh"
│         }]
│       }],
│       "Stop": [{
│         "hooks": [{
│           "type": "command",
│           "command": "${CLAUDE_PLUGIN_ROOT}/scripts/session-summarize.sh"
│         }]
│       }],
│       "PreCompact": [{
│         "hooks": [{
│           "type": "command",
│           "command": "${CLAUDE_PLUGIN_ROOT}/scripts/pre-compact-checkpoint.sh"
│         }]
│       }]
│     }
│   }
│
├── .mcp.json                    ← MCP server configs
│   {
│     "mcpServers": {
│       "vibe-context": {
│         "command": "vibe",
│         "args": ["mcp", "project-context"]
│       },
│       "vibe-history": {
│         "command": "vibe",
│         "args": ["mcp", "history"]
│       }
│     }
│   }
│
├── scripts/                     ← helper scripts para hooks
│   ├── context-inject.sh
│   ├── session-summarize.sh
│   └── pre-compact-checkpoint.sh
│
├── LICENSE
├── CHANGELOG.md
└── README.md

NOTA: ${CLAUDE_PLUGIN_ROOT} se resuelve al directorio de instalación
del plugin (los plugins se copian a un cache al instalar).
```

### 33.2. Marketplace de la plataforma

```
El marketplace se aloja en un repo de GitHub:

github.com/vibe-dev/vibe-plugins/
├── .claude-plugin/
│   └── marketplace.json
│       {
│         "name": "vibe-plugins",
│         "owner": { "name": "Vibe Dev", "email": "team@vibe.dev" },
│         "metadata": {
│           "description": "Official Vibe platform plugins",
│           "version": "1.0.0",
│           "pluginRoot": "./plugins"
│         },
│         "plugins": [
│           {
│             "name": "core",
│             "source": "./plugins/core",
│             "category": "context-management",
│             "tags": ["essential", "multi-enterprise"]
│           },
│           {
│             "name": "frontend",
│             "source": "./plugins/frontend",
│             "category": "visual-validation",
│             "tags": ["frontend", "testing", "design-system"]
│           },
│           {
│             "name": "enterprise",
│             "source": "./plugins/enterprise",
│             "category": "governance",
│             "tags": ["enterprise", "audit", "compliance"]
│           },
│           {
│             "name": "react-nextjs-template",
│             "source": "./plugins/templates/react-nextjs",
│             "category": "template-pack"
│           }
│         ]
│       }
│
└── plugins/
    ├── core/                ← @vibe/core-plugin
    ├── frontend/            ← @vibe/frontend-plugin
    ├── enterprise/          ← @vibe/enterprise-plugin (commercial)
    └── templates/
        ├── react-nextjs/    ← template pack
        ├── vue-nuxt/
        └── svelte-kit/

Instalación:
  /plugin marketplace add vibe-dev/vibe-plugins
  /plugin install core@vibe-dev/vibe-plugins
  /plugin install frontend@vibe-dev/vibe-plugins
```

### 33.3. Plugins enterprise (private marketplaces)

```
Cada empresa puede tener su propio marketplace privado:

github.com/acme-corp/claude-plugins/ (repo privado)
├── .claude-plugin/
│   └── marketplace.json
│       {
│         "name": "acme-plugins",
│         "plugins": [
│           { "name": "acme-conventions", "source": "./acme-conventions" },
│           { "name": "acme-security", "source": "./acme-security" },
│           { "name": "acme-deploy", "source": "./acme-deploy" }
│         ]
│       }
│
└── acme-conventions/
    ├── .claude-plugin/plugin.json
    ├── rules/                    ← enterprise rules como plugin
    │   ├── code-review.md
    │   ├── security-policy.md
    │   └── architecture-standards.md
    ├── skills/
    │   └── acme-deploy/SKILL.md  ← deploy flow corporativo
    └── hooks.json                ← audit hooks corporativos

Git privado funciona: si `git clone` funciona en tu terminal,
Claude Code puede instalar el plugin.

Governance:
  managed-settings.json desplegado por IT:
  {
    "strictKnownMarketplaces": [
      "vibe-dev/vibe-plugins",
      "acme-corp/claude-plugins"
    ]
  }
  → Los devs solo pueden instalar plugins de estos marketplaces
```

### 33.4. Community extensions

```
El ecosistema abierto permite plugins de terceros:

Tipos de plugins comunitarios:
├── Stack template packs (Ruby, Go, Flutter, Rust, etc.)
├── Domain skill packs (e-commerce, fintech, healthcare)
├── Tool integrations (nuevos MCP servers: Asana, Monday, etc.)
├── CI/CD generators (Buildkite, TeamCity, etc.)
├── Notification channels (Discord hooks, PagerDuty)
├── Report generators (PDF, Confluence, Notion)
└── Vault providers (Doppler, Infisical)

Descubrimiento:
├── /plugin marketplace search <query>
├── Listado en docs.vibe.dev/plugins (curado)
├── awesome-vibe-plugins en GitHub (comunitario)
└── Compatible con awesome-claude-plugins de la comunidad
```

### 33.5. Cómo los plugins se instalan

```
Al instalar, los componentes se MERGEN en .claude/:
├── Skills → .claude/skills/ (directorios copiados)
├── Agents → .claude/agents/ (archivos copiados)
├── Commands → .claude/skills/ (unified with skills)
├── Hooks → merged en .claude/settings.json
├── MCP → merged en .claude/.mcp.json
├── Rules → .claude/rules/ (si incluidos)
└── NO hay namespacing → cuidado con conflictos de nombres

⚠️ Limitación conocida: plugins no pueden referenciar archivos
   fuera de su directorio (se copian a cache). Usar symlinks
   o ${CLAUDE_PLUGIN_ROOT} para references internas.

Auto-update: Claude Code busca actualizaciones de plugins
al iniciar sesión si hay conexión.
```

---

## 34. Legal y Compliance (GDPR, Data Residency)

Multi-empresa con datos de diferentes jurisdicciones requiere compliance con regulaciones de privacidad. Esto es especialmente relevante para el tier Enterprise y el modo cloud.

### 34.1. Datos procesados por la plataforma

```
Categorización GDPR de datos que maneja la plataforma:

Datos que NO son personales (mayoría):
├── Código fuente, configuraciones, decisiones técnicas
├── CLAUDE.md, skills, templates, convenciones
├── Métricas de rendimiento (agregadas)
├── Screenshots de UI (sin datos de usuario)
└── Logs de jobs y eventos del sistema

Datos que PUEDEN ser personales:
├── Nombres de desarrolladores en sesiones y decisiones
├── Emails en configuración de notificaciones
├── Metadata de commits (autor, email)
├── Resúmenes de sesión que podrían contener datos de usuarios
│   del producto que se está construyendo
├── Contenido de tickets (Jira/Linear) que podría tener PII
└── Credenciales y tokens (datos sensibles, no personales per se)

Rol de la plataforma:
├── Modo local-first: NO es processor ni controller
│   (todo en la máquina del dev, como cualquier IDE)
├── Modo cloud (Team/Enterprise): es Data Processor
│   (procesa datos en nombre de la empresa-cliente que
│    es el Data Controller)
└── Resúmenes vía Claude API: Anthropic es sub-processor
    (los datos pasan por su API para generar resúmenes)
```

### 34.2. Compliance by design

```
Principios implementados:

1. Data minimization (GDPR Art. 5):
   ├── Solo recoger datos necesarios para la funcionalidad
   ├── Resúmenes de sesión: no incluir datos de negocio del
   │   producto que se construye, solo decisiones técnicas
   └── Learned-fixes: patrones genéricos, no datos específicos

2. Purpose limitation:
   ├── Datos usados solo para mejorar la experiencia de desarrollo
   ├── No analytics de comportamiento del developer
   └── No venta ni compartición con terceros

3. Storage limitation:
   ├── Política de retención definida (§26)
   ├── Crypto-shredding al eliminar empresa (§9)
   └── Right to erasure: vibe enterprise delete --purge

4. Privacy by default:
   ├── Telemetría desactivada por defecto
   ├── Modo local-first como default (sin servidor central)
   ├── Historial sanitizado antes de promoción
   └── Credenciales nunca en logs ni historial

5. Data portability (GDPR Art. 20):
   └── vibe export --enterprise <id> --format json
       Exporta TODA la data de una empresa en formato
       portable (JSON + archivos)
```

### 34.3. Data residency para Enterprise

```
Cuando la plataforma corre en modo cloud:

Configuración por empresa:
{
  "enterprise": "Acme EU",
  "data_residency": {
    "region": "eu-west-1",
    "database": "postgres://eu-cluster.internal/acme",
    "vault": "https://vault.eu.internal/v1/acme",
    "backups": "s3://vibe-backups-eu/acme/",
    "claude_api_region": "eu"
  }
}

Garantías:
├── Datos de la empresa NUNCA salen de la región configurada
├── Backups cifrados en la misma región
├── Resúmenes de sesión via Claude API: usar endpoint
│   regional de Anthropic si disponible
├── Audit log de todo acceso cross-región
└── DPA (Data Processing Agreement) por empresa

Nota: Anthropic ofrece deployment en EU para empresas.
Verificar disponibilidad y configurar routing de API
por empresa según su data residency requerida.
```

### 34.4. EU AI Act y ISO 42001

La plataforma usa IA (Claude API) como componente core. El EU AI Act (en vigor completo desde 2025) y el estándar ISO 42001 (AI management systems) son relevantes.

```
Clasificación probable bajo EU AI Act:
├── La plataforma es un "deployer" de IA, no un "provider"
│   (Anthropic es el provider del modelo, nosotros lo usamos)
├── Riesgo: Bajo-Mínimo (herramienta de productividad de devs,
│   no toma decisiones sobre personas ni afecta derechos)
└── Obligaciones principales:
    ├── Transparencia: documentar que se usa IA y para qué
    ├── Logging: mantener logs de interacciones con la API
    └── Human oversight: todas las decisiones de la IA son
        revisables y reversibles (§25: cuarentena y rollback)

ISO 42001 (si se busca Enterprise tier):
├── Documentar governance de la IA en la plataforma
├── Risk assessment de las decisiones que toma Claude
├── Métricas de calidad del output de IA (§25)
├── Proceso de remediación cuando la IA se equivoca
└── Opcional: certificación ISO 42001 como diferenciador
    competitivo para ventas enterprise en Europa
```

---

## 35. Límites de Escalabilidad y Benchmarks

Definir los límites esperados previene sorpresas en producción. Cada componente tiene un punto de quiebre que debemos conocer.

### 35.1. Límites por tier

```
┌───────────────────────┬─────────────┬──────────────┬──────────┐
│ Dimensión              │ Community   │ Team          │ Enterprise│
├───────────────────────┼─────────────┼──────────────┼──────────┤
│ Empresas               │ 3           │ 20            │ Ilimitado│
│ Proyectos por empresa │ 10          │ 50            │ Ilimitado│
│ Devs por proyecto     │ 1           │ 25            │ Ilimitado│
│ Sesiones activas conc.│ 1           │ 10            │ 100      │
│ Decisiones por proy.  │ 500         │ 5,000         │ 50,000   │
│ Learned-fixes por pr. │ 200         │ 2,000         │ 20,000   │
│ Jobs concurrentes     │ 3           │ 20            │ 100      │
│ MCP servers por proy. │ 5           │ 15            │ 50       │
│ Baselines screenshots │ 100         │ 1,000         │ 10,000   │
│ Storage .claude/      │ 100 MB      │ 1 GB          │ 10 GB    │
│ DB size (SQLite)      │ 500 MB      │ N/A (Postgres)│ N/A      │
│ DB size (Postgres)    │ N/A         │ 10 GB         │ 100 GB   │
└───────────────────────┴─────────────┴──────────────┴──────────┘
```

### 35.2. Benchmarks target por operación

```
Operación                          Target      Aceptable    Alarma
──────────                         ──────      ─────────    ──────
vibe switch                        < 500ms     < 2s         > 5s
CLAUDE.md generation               < 1s        < 3s         > 5s
Relevance scoring (100 decisions)  < 200ms     < 1s         > 3s
Relevance scoring (5000 decisions) < 2s        < 5s         > 10s
Session summary extraction         < 30s       < 60s        > 120s
vibe status                        < 300ms     < 1s         > 2s
vibe jobs (listar)                 < 500ms     < 2s         > 5s
Web UI dashboard load              < 1.5s      < 3s         > 5s
Screenshot + visual compare        < 5s        < 15s        > 30s
SQLite query (decisiones)          < 50ms      < 200ms      > 500ms
Postgres query (decisiones)        < 20ms      < 100ms      > 300ms
```

### 35.3. Plan de escalado cuando se exceden límites

```
Problema: Relevance scoring lento con muchas decisiones

Cuando decisiones > 1,000:
├── Fase 1: Indexar por tags, tipo, y fecha. Filtrar antes de scoring.
├── Fase 2: Pre-calcular scores en background worker (no en request).
├── Fase 3: Cache de scores con invalidación al añadir decisiones.
└── Fase 4: Si > 10,000: usar embeddings + vector search (SQLite VSS
    extension o pgvector en Postgres) para semantic similarity.

Problema: SQLite lento con muchos datos concurrentes

Cuando SQLite > 500MB o > 3 escritores concurrentes:
├── WAL mode (ya habilitado por defecto en Drizzle)
├── Si persiste: migrar a Postgres (vibe db migrate postgres)
└── Comando de migración incluido en el CLI

Problema: .claude/ directory demasiado grande

Cuando .claude/ > 100MB:
├── Git LFS para baselines
├── Purga agresiva con vibe clean --aggressive
├── Mover archive a storage externo (S3)
└── Alertas automáticas con recomendaciones
```

---

## 36. Release Management

Cómo se versiona, lanza, y mantiene la plataforma en producción. Los proyectos de los usuarios no deben romperse con actualizaciones.

### 36.1. Versionado semántico estricto

```
MAJOR.MINOR.PATCH (SemVer 2.0)

MAJOR (1.0 → 2.0):
├── Cambios en schema de DB que requieren migración
├── Cambios en formato de CLAUDE.md que no son retrocompatibles
├── Cambios en API de plugins que rompen plugins existentes
├── Cambios en CLI que eliminan comandos o flags
└── NUNCA más de 1 major por año

MINOR (1.0 → 1.1):
├── Nuevos comandos, nuevas features
├── Nuevos tipos de plugins
├── Nuevos MCP servers
├── Nuevos templates
└── Mejoras de rendimiento no breaking

PATCH (1.0.0 → 1.0.1):
├── Bug fixes
├── Actualización de templates
├── Security patches
└── Mejoras de mensajes de error
```

### 36.2. Migraciones automáticas

```
Al actualizar el CLI:

1. Detección de cambio de versión:
   vibe detecta que la versión instalada es nueva
   vs la versión registrada en cada proyecto

2. Migraciones de DB:
   ├── Drizzle migrations se corren automáticamente
   ├── Schema changes son additive siempre que sea posible
   ├── Breaking schema changes solo en MAJOR versions
   └── Backup automático antes de migrar: .claude/backups/

3. Migraciones de formato:
   ├── Si CLAUDE.md format cambia:
   │   ├── vibe detecta versión del formato en el archivo
   │   ├── Corre transformer automático
   │   ├── Muestra diff al dev para aprobar
   │   └── Commit automático con mensaje descriptivo
   │
   ├── Si .claude/ structure cambia:
   │   ├── Mover archivos a nueva ubicación
   │   ├── Actualizar referencias
   │   └── Log de cambios realizados
   │
   └── Si plugin API cambia:
       ├── Deprecation warning por 1 MINOR version
       ├── Funcionalidad vieja sigue funcionando
       └── Eliminación solo en siguiente MAJOR

4. Rollback:
   ├── vibe rollback [version]
   ├── Restaura DB desde backup
   ├── Restaura .claude/ desde Git
   └── Downgrades CLI a la versión especificada
```

### 36.3. Proceso de release

```
Release cadence:
├── PATCH: según necesidad (hotfixes, security)
├── MINOR: cada 2-4 semanas (feature releases)
├── MAJOR: máximo 1 por año (con 3 meses de deprecation notice)

Proceso:
1. Feature freeze en branch release/vX.Y.Z
2. QA: tests en matrix [macOS, Linux, Windows] × [Node 22, 24]
3. Beta release: vX.Y.Z-beta.1 publicado en npm con tag "beta"
   ├── npm install -g @vibe/cli@beta
   ├── Early adopters prueban por 1 semana
   └── Bug reports → fixes → beta.2 si es necesario
4. Release candidate: vX.Y.Z-rc.1
5. Release: vX.Y.Z publicado en npm con tag "latest"
6. Changelog generado automáticamente (conventional commits)
7. GitHub Release con binary assets
8. Docs actualizados
9. Announcement en changelog, blog, y Slack community

Conventional Commits:
├── feat: nueva funcionalidad → MINOR bump
├── fix: bug fix → PATCH bump
├── feat!: breaking change → MAJOR bump
├── docs: solo documentación → no bump
├── chore: mantenimiento → no bump
└── Enforced con commitlint + husky
```

### 36.4. Backward compatibility guarantees

```
Garantía por versión:

Dentro de un MAJOR:
├── CLI commands: no se eliminan, solo se deprecan
├── Config format: retrocompatible (nuevos campos opcionales)
├── Plugin API: retrocompatible (nuevos hooks opcionales)
├── DB schema: migrations automáticas, siempre additive
├── CLAUDE.md format: versionado, transformer automático
└── MCP server protocol: estable dentro del MAJOR

Deprecation policy:
├── Feature deprecated en MINOR X.Y
├── Warning en cada uso: "X está deprecated, usa Y"
├── Documentado en changelog y migration guide
├── Eliminado en MAJOR X+1.0
└── Mínimo 3 meses entre deprecation y eliminación

Support policy:
├── Última MAJOR: full support (features + security + bugs)
├── Penúltima MAJOR: security + critical bugs (12 meses)
└── Anteriores: sin soporte
```

---

## 37. Topología de Acceso a Contexto, Filesystem y Dockerización

La plataforma no vive en un solo directorio. El CLI corre en la terminal del dev, los proyectos están dispersos en el filesystem, los MCP servers necesitan acceder a archivos de proyecto, y Claude Code tiene su propio modelo de sandboxing. Cuando se dockeriza, todo se complica. Esta sección mapea todos los escenarios y define cómo cada componente accede a lo que necesita.

### 37.1. Mapa de acceso al filesystem

```
El dev tiene proyectos en múltiples ubicaciones:

/home/dev/
├── .vibe/                          ← Config global del CLI
│   ├── config.json                 ← Empresas registradas, preferences
│   ├── credentials/                ← Tokens cifrados (o referencia a vault)
│   ├── cache/                      ← Cache de tokens, thumbnails, etc.
│   ├── db/                         ← SQLite global (empresas, proyectos, sessions)
│   └── plugins/                    ← Plugins instalados globalmente
│
├── shared-claude-rules/            ← NUEVO: rules compartidas por empresa
│   ├── acme/                       ← Rules de Acme Corp
│   │   ├── tools.md
│   │   ├── code-review.md
│   │   ├── security-policy.md
│   │   └── communication.md
│   └── startup-xyz/                ← Rules de Startup XYZ
│       └── ...
│
├── work/
│   ├── acme-corp/
│   │   ├── web-app/                ← Proyecto 1
│   │   │   ├── .claude/            ← Contexto del proyecto
│   │   │   │   ├── rules/
│   │   │   │   │   ├── fallback/   ← Templates copiados
│   │   │   │   │   ├── enterprise/ ← SYMLINK → ~/shared-claude-rules/acme/
│   │   │   │   │   └── project/    ← Rules path-scoped del proyecto
│   │   │   │   ├── settings.json   ← Hooks, permissions
│   │   │   │   └── .mcp.json      ← MCP servers activos
│   │   │   ├── CLAUDE.md           ← Lean router (~100-150 líneas)
│   │   │   ├── src/                ← Código fuente
│   │   │   └── ...
│   │   ├── mobile-app/             ← Proyecto 2
│   │   │   ├── .claude/
│   │   │   ├── CLAUDE.md
│   │   │   └── ...
│   │   └── shared-libs/            ← Monorepo compartido
│   │       └── ...
│   │
│   └── startup-xyz/
│       └── saas-platform/          ← Proyecto de otra empresa
│           ├── .claude/
│           │   └── rules/enterprise/ ← SYMLINK → ~/shared-claude-rules/startup-xyz/
│           ├── CLAUDE.md
│           └── ...
│
└── .claude/                        ← Config de Claude Code (de Anthropic)
    ├── settings.json               ← Settings globales
    ├── rules/                      ← NUEVO: rules personales del dev
    │   ├── preferences.md
    │   └── workflows.md
    ├── projects/                   ← Memorias de Claude Code por proyecto
    └── ...

Puntos clave:
├── Los proyectos están DISPERSOS en el filesystem
├── La config global de Vibe está en ~/.vibe/
├── La config de Claude Code está en ~/.claude/ (de Anthropic)
├── Cada proyecto tiene su .claude/ y CLAUDE.md LOCAL
├── Rules de empresa compartidas via SYMLINKS a ~/shared-claude-rules/
├── Rules personales del dev en ~/.claude/rules/ (menor prioridad)
├── La DB global (SQLite) está en ~/.vibe/db/
├── Credenciales en vault externo (1Password, Vault)
└── Claude Code opera en SANDBOX OS-level:
    ├── Accede a proyecto/ (cwd) directamente
    ├── MCP servers corren FUERA del sandbox (escape hatch)
    └── Symlinks se resuelven dentro del sandbox normalmente
```

### 37.2. Cómo cada componente accede al filesystem

```
┌────────────────────┬──────────────────────────────────────────┐
│ Componente          │ Qué necesita leer/escribir                │
├────────────────────┼──────────────────────────────────────────┤
│ CLI (vibe)         │ Lee: ~/.vibe/*, proyecto actual (cwd),   │
│                    │      proyecto target (si switch)          │
│                    │ Escribe: ~/.vibe/db, proyecto/.claude/,  │
│                    │          proyecto/CLAUDE.md               │
│                    │                                          │
│ Context Engine     │ Lee: ~/.vibe/db, empresa/.claude-shared/,│
│                    │      proyecto/.claude/, templates/        │
│                    │ Escribe: proyecto/CLAUDE.md (generado)   │
│                    │                                          │
│ MCP browser-prev.  │ Lee: proyecto/ (sirve archivos al browser)│
│                    │ Escribe: proyecto/.claude/baselines/     │
│                    │                                          │
│ MCP design-tokens  │ Lee: proyecto/.claude/design-system/,    │
│                    │      Figma API (red)                     │
│                    │ Escribe: proyecto/.claude/design-system/ │
│                    │                                          │
│ MCP project-context│ Lee: ~/.vibe/db, proyecto/.claude/       │
│                    │ Escribe: nada (read-only para Claude)    │
│                    │                                          │
│ MCP history        │ Lee: ~/.vibe/db (sessions, decisions)    │
│                    │ Escribe: nada (read-only para Claude)    │
│                    │                                          │
│ Background Workers │ Lee: ~/.vibe/db, proyecto/.claude/,      │
│                    │      APIs externas (red)                 │
│                    │ Escribe: ~/.vibe/db, proyecto/.claude/,  │
│                    │          reportes                        │
│                    │                                          │
│ Web UI             │ Lee/Escribe: vía API (tRPC), no accede   │
│                    │ al filesystem directamente               │
│                    │                                          │
│ Claude Code        │ Lee: proyecto/ (cwd), CLAUDE.md,         │
│ (SANDBOX activo)   │      .claude/rules/ (incluyendo symlinks)│
│                    │ Escribe: proyecto/ (código, tests)       │
│                    │ NOTA: opera dentro de sandbox OS-level   │
│                    │ MCP servers son el escape hatch (fuera)  │
│                    │ Sandbox: limitado a cwd + paths permitidos│
└────────────────────┴──────────────────────────────────────────┘
```

### 37.3. El problema del multi-directorio

```
Escenario: dev está en ~/work/acme/web-app/ y hace "vibe switch"
a un proyecto que está en ~/work/startup-xyz/saas-platform/

¿Qué pasa?

1. El CLI necesita:
   ├── Leer ~/.vibe/db para saber dónde está el proyecto target
   ├── Acceder a ~/work/startup-xyz/saas-platform/.claude/
   │   para leer su contexto
   ├── Generar CLAUDE.md en ese directorio
   └── Registrar la sesión en ~/.vibe/db

2. Los MCP servers necesitan:
   ├── Re-apuntar al nuevo directorio de proyecto
   ├── browser-preview: servir desde el nuevo directorio
   ├── design-tokens: leer tokens del nuevo proyecto
   └── project-context: cargar contexto del nuevo proyecto

3. Claude Code necesita:
   ├── Estar ejecutándose en el directorio del nuevo proyecto
   └── Los MCP servers deben estar configurados para ese proyecto

Solución: Project Registry

~/.vibe/db contiene tabla 'projects' con:
{
  "id": "proj_abc123",
  "enterprise_id": "ent_acme",
  "name": "web-app",
  "path": "/home/dev/work/acme-corp/web-app",  ← PATH ABSOLUTO
  "last_accessed": "2026-02-10T12:00:00Z",
  "status": "active"
}

El CLI SIEMPRE resuelve paths absolutos:
├── vibe switch acme web-app
│   → Lee DB → encuentra path → cd a ese directorio
│   → Genera CLAUDE.md en esa ubicación
│   → Configura MCP servers con ese path como root
│
├── vibe status (desde cualquier directorio)
│   → Detecta proyecto actual por cwd
│   → Si cwd no es proyecto registrado: muestra global status
│
└── vibe register (desde directorio de proyecto)
    → Registra cwd como proyecto en la DB
    → Pide asociar a una empresa

Path resolution order:
1. Si flag --project-path: usar ese path
2. Si flag --project <name>: buscar en DB por nombre
3. Si cwd tiene .claude/: es el proyecto actual
4. Si cwd tiene .vibe-project (marker file): leer proyecto
5. Si nada: pedir al dev que registre o seleccione
```

### 37.4. Acceso cross-proyecto (monorepos y shared libs)

```
Escenario: Empresa Acme tiene un monorepo con múltiples proyectos
que comparten librerías.

/home/dev/work/acme-corp/
├── packages/
│   ├── shared-ui/          ← librería compartida
│   ├── shared-utils/       ← librería compartida
│   └── shared-types/       ← tipos compartidos
├── apps/
│   ├── web-app/            ← Proyecto A
│   │   └── .claude/
│   ├── mobile-api/         ← Proyecto B
│   │   └── .claude/
│   └── admin-panel/        ← Proyecto C
│       └── .claude/
├── .claude/                ← Contexto a nivel de monorepo
├── CLAUDE.md               ← Contexto global del monorepo
├── turbo.json
└── package.json

El problema:
├── Proyecto A necesita contexto de shared-ui (está en ../packages/)
├── El CLAUDE.md de Proyecto A debe incluir convenciones del monorepo
├── Si Claude Code trabaja en web-app, necesita leer shared-ui
└── Pero el sandbox de Claude Code limita acceso a cwd

Soluciones:

1. Monorepo como proyecto raíz:
   ├── Registrar el ROOT del monorepo como proyecto
   ├── Claude Code se ejecuta desde la raíz del monorepo
   ├── CLAUDE.md en la raíz incluye contexto de todos los sub-proyectos
   └── .claude/ en la raíz tiene decisiones compartidas

2. Sub-proyectos con herencia:
   ├── Cada app (web-app, mobile-api) es un "sub-proyecto"
   ├── Hereda contexto del proyecto raíz (monorepo)
   ├── CLAUDE.md del sub-proyecto incluye:
   │   ├── Link al CLAUDE.md raíz: "See also: ../../CLAUDE.md"
   │   ├── Contexto específico del sub-proyecto
   │   └── Convenciones del workspace/package específico
   └── Claude Code: cwd en raíz del monorepo, foco en sub-dir

3. Context resolution para monorepos:
   vibe switch acme web-app
   ├── Detecta que web-app está dentro de monorepo (busca
   │   turbo.json, pnpm-workspace.yaml, o nx.json subiendo dirs)
   ├── Genera CLAUDE.md con contexto MERGEADO:
   │   └── Monorepo root context + sub-project context
   ├── Incluye awareness de packages compartidos
   └── Configura sandbox para permitir lectura de packages/
```

### 37.5. Interacción con el sandbox de Claude Code

```
Claude Code (oct 2025+) usa sandbox OS-level:
├── Filesystem: solo read/write en cwd y subdirectorios
├── Network: solo dominios permitidos
├── Implementación: bubblewrap (Linux), seatbelt (macOS)
└── Reduce permission prompts en 84%

Nuestra plataforma debe COOPERAR con el sandbox, no luchar contra él.

Estrategia de coexistencia:

1. Todo lo que Claude Code necesita ESTÁ en el proyecto:
   ├── CLAUDE.md → generado EN el directorio del proyecto
   ├── .claude/ → está DENTRO del proyecto
   ├── Skills y hooks → referenciados desde CLAUDE.md
   └── Claude Code puede leer todo sin salir del sandbox

2. Lo que está FUERA del proyecto se accede vía MCP:
   ├── ~/.vibe/db → accesible vía MCP project-context
   │   (el MCP server corre FUERA del sandbox de Claude Code)
   ├── Historial de otros proyectos → vía MCP history
   ├── Credenciales → vía MCP o vault (nunca como archivo)
   └── APIs externas → vía MCP servers (que tienen su propio
       acceso a red, independiente del sandbox de Claude Code)

3. MCP servers como "escape hatch" seguro:
   ├── Claude Code llama tools MCP para acceder a datos externos
   ├── Los MCP servers corren como procesos separados
   ├── Tienen su propio acceso al filesystem y red
   ├── Pero exponen solo interfaces controladas a Claude
   └── Es el patrón recomendado por Anthropic

4. Configuración de sandbox awareness:
   Cuando la plataforma genera la config de Claude Code:
   {
     "permissions": {
       "allow": [
         "Read(.claude/**)",
         "Write(.claude/history/**)",
         "Bash(vibe:*)"
       ]
     },
     "mcpServers": {
       "vibe-context": {
         "command": "vibe",
         "args": ["mcp", "project-context", "--project", "web-app"]
       },
       "vibe-history": {
         "command": "vibe",
         "args": ["mcp", "history"]
       },
       "vibe-browser": {
         "command": "vibe",
         "args": ["mcp", "browser-preview"]
       }
     }
   }
```

### 37.6. Escenarios de dockerización

La plataforma puede dockerizarse por varias razones. Cada escenario tiene diferentes requerimientos de acceso.

```
ESCENARIO A: Docker para CI/CD (el más común)
─────────────────────────────────────────────
El pipeline de CI necesita ejecutar vibe checks en un contenedor.

docker run --rm \
  -v $(pwd):/workspace:ro \
  -v $(pwd)/.claude:/workspace/.claude \
  ghcr.io/vibe/ci:latest \
  vibe visual-regression --ci

Acceso:
├── /workspace → bind mount del repo (read-only para código)
├── /workspace/.claude → bind mount con write para reportes
├── NO necesita ~/.vibe/ (usa config inline via env vars)
├── NO necesita Redis (usa SQLite efímero)
├── Red: necesita acceso a GitHub API (para PR comments)
└── Secrets: via CI env vars (FIGMA_TOKEN, GITHUB_TOKEN)

El contenedor:
├── Es efímero (se destruye tras el job)
├── No persiste estado (todo se commitea al repo)
├── Corre con usuario non-root
└── Filesystem del host protegido (mount read-only)


ESCENARIO B: Docker para desarrollo local (escape hatch)
──────────────────────────────────────────────────────────
Dev en Windows sin WSL quiere usar Vibe sin instalar Redis/Playwright.

docker compose up -d vibe-dev

# docker-compose.yml
services:
  vibe-dev:
    image: ghcr.io/vibe/dev:latest
    volumes:
      - ${HOME}/.vibe:/home/node/.vibe
      - ./:/workspace
    ports:
      - "3333:3333"     # Web UI
      - "9222:9222"     # Chrome DevTools (browser-preview)
    environment:
      - VIBE_PROJECT_PATH=/workspace
      - VIBE_DB_PATH=/home/node/.vibe/db/vibe.db
    networks:
      - vibe-net

  redis:
    image: redis:7-alpine
    networks:
      - vibe-net

  chrome:
    image: browserless/chrome:latest
    ports:
      - "9223:3000"
    networks:
      - vibe-net

networks:
  vibe-net:

Acceso:
├── /workspace → bind mount del proyecto (read-write)
├── ~/.vibe → bind mount de config global (read-write)
├── Redis → via network interna (vibe-net)
├── Chrome → via network interna (para screenshots)
├── Web UI → puerto 3333 expuesto al host
└── El dev usa Claude Code en su terminal NATIVA
    (no dentro del contenedor) y Vibe corre en Docker

IMPORTANTE: Claude Code NO corre dentro de Docker.
Claude Code corre en la terminal del dev, con acceso al
filesystem nativo. Vibe en Docker es solo para los servicios
de soporte (Redis, Chrome, Web UI, workers).


ESCENARIO C: Docker para cloud/equipo (modo servidor)
─────────────────────────────────────────────────────
Instancia central que sirve Web UI y workers para todo el equipo.

docker compose -f docker-compose.cloud.yml up -d

services:
  web:
    image: ghcr.io/vibe/web:latest
    environment:
      - DATABASE_URL=postgres://...
      - REDIS_URL=redis://redis:6379
      - AUTH_SECRET=...
      - VAULT_ADDR=https://vault.internal
    ports:
      - "443:3333"
    volumes: []    # NO bind mounts — todo vía DB y APIs

  workers:
    image: ghcr.io/vibe/workers:latest
    environment:
      - DATABASE_URL=postgres://...
      - REDIS_URL=redis://redis:6379
      - GITHUB_APP_KEY=...
      - SLACK_BOT_TOKEN=...
    volumes: []    # NO bind mounts — accede a repos vía Git clone

  postgres:
    image: postgres:17
    volumes:
      - pg-data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data

volumes:
  pg-data:
  redis-data:

Acceso:
├── NO tiene acceso al filesystem de los devs
├── Todo vía DB (Postgres) y APIs (GitHub, Jira, Slack)
├── Workers clonan repos temporalmente para visual regression
├── Credenciales en vault o env vars (nunca en filesystem)
├── Datos persistidos en Docker volumes (no bind mounts)
└── Cada dev sigue usando Claude Code + CLI localmente,
    pero los datos se sincronizan via API al servidor central
```

### 37.7. Separación de concerns: qué corre dónde

```
En modo local-first (solo dev):
┌──────────────────────────────────────────────────────────────┐
│ MÁQUINA DEL DEV                                              │
│                                                              │
│  Terminal 1:       Terminal 2:        Terminal 3:             │
│  Claude Code       vibe CLI           vibe dashboard         │
│  (cwd: proyecto)   (cualquier dir)    (localhost:3333)       │
│                                                              │
│  [Claude Code sandbox]                                       │
│  ├── Filesystem: solo cwd                                    │
│  ├── MCP servers: corren fuera del sandbox                   │
│  └── Network: dominios permitidos                            │
│                                                              │
│  [Vibe processes]                                            │
│  ├── CLI: acceso a ~/.vibe/ + todos los proyectos            │
│  ├── MCP servers: acceso según su función                    │
│  ├── Workers: acceso a ~/.vibe/ + proyectos + red            │
│  ├── Redis (opcional): localhost:6379                         │
│  └── Web UI: localhost:3333 (server local de Next.js)        │
│                                                              │
│  [Persistencia]                                              │
│  ├── ~/.vibe/db/vibe.db (SQLite)                             │
│  ├── Proyecto/.claude/ (por proyecto)                        │
│  └── Proyecto/CLAUDE.md (por proyecto)                       │
└──────────────────────────────────────────────────────────────┘


En modo cloud/equipo:
┌──────────────────────────┐    ┌──────────────────────────────┐
│ MÁQUINA DEL DEV          │    │ SERVIDOR CENTRAL             │
│                          │    │                              │
│  Claude Code + CLI       │◄──►│  Web UI (público)            │
│  (todo local)            │sync│  API (tRPC)                  │
│                          │    │  Workers                     │
│  MCP servers locales     │    │  PostgreSQL                  │
│  Redis (opc.) o SQLite   │    │  Redis                       │
│  ~/.vibe/db (local)      │    │  Vault                       │
│                          │    │                              │
│  Los datos se sincronizan│    │  Datos centralizados:        │
│  al servidor vía API     │    │  ├── Sesiones de todo el     │
│  cuando hay conexión.    │    │  │   equipo                  │
│  Funciona offline con    │    │  ├── Decisiones compartidas  │
│  sync eventual.          │    │  ├── Métricas agregadas      │
│                          │    │  └── Audit logs              │
└──────────────────────────┘    └──────────────────────────────┘
```

### 37.8. Seguridad de acceso al filesystem

```
Principios de mínimo privilegio:

1. El CLI solo escribe donde debe:
   ├── ~/.vibe/ → config y DB global
   ├── proyecto/.claude/ → contexto del proyecto
   ├── proyecto/CLAUDE.md → archivo generado
   └── NUNCA escribe fuera de estos paths

2. MCP servers con scope limitado:
   ├── browser-preview: solo lee proyecto/ para servir archivos
   │   Solo escribe en proyecto/.claude/baselines/
   ├── design-tokens: solo lee/escribe proyecto/.claude/design-system/
   ├── project-context: READ-ONLY sobre ~/.vibe/db y proyecto/.claude/
   ├── history: READ-ONLY sobre ~/.vibe/db
   └── Cada MCP server se puede sandboxear con Anthropic's srt:
       srt --allow-write=".claude/baselines" \
           --deny-write="src" \
           vibe mcp browser-preview

3. Workers con scope limitado:
   ├── sync-worker: lee/escribe ~/.vibe/db + API de servidor central
   ├── build-worker: lee proyecto/ + escribe proyecto/.claude/reports/
   ├── metrics-worker: lee ~/.vibe/db, escribe métricas
   └── retention-worker: lee/escribe ~/.vibe/ (limpieza)

4. Credenciales NUNCA en filesystem plano:
   ├── En local: 1Password CLI o keyring del OS
   ├── En Docker: env vars o Docker secrets
   ├── En cloud: HashiCorp Vault o cloud KMS
   └── En CI: secrets del CI provider (GitHub Secrets, etc.)

5. Protección contra path traversal:
   ├── Todo path se normaliza con path.resolve() antes de usar
   ├── Verificar que el path resuelto está dentro del scope permitido
   ├── Rechazar paths con .. que escapen del proyecto
   └── Tests de seguridad específicos para path traversal
```

### 37.9. Discovery y registro de proyectos

```
¿Cómo sabe Vibe dónde están los proyectos?

Registro explícito (preferido):
  $ cd ~/work/acme/web-app
  $ vibe init
  → Detecta Git root
  → Crea .claude/ si no existe
  → Pide asociar a empresa
  → Registra path absoluto en ~/.vibe/db

Registro por scan (onboarding):
  $ vibe scan ~/work
  → Busca recursivamente directorios con:
     ├── .git/ (es un repo)
     ├── package.json, Cargo.toml, go.mod, etc. (es un proyecto)
     └── .claude/ (ya tiene contexto Vibe)
  → Lista los encontrados, dev selecciona cuáles registrar
  → Asocia cada uno a una empresa

Auto-detección (por contexto):
  $ cd ~/work/acme/web-app
  $ vibe status
  → Detecta que cwd es un proyecto registrado
  → Muestra status sin necesidad de especificar nombre

Manejo de paths movidos:
  Si el dev mueve un proyecto a otro directorio:
  ├── vibe status mostrará warning: "Project path not found"
  ├── vibe repair → busca el proyecto por nombre en directorios comunes
  ├── Si lo encuentra: actualiza el path en DB
  └── Si no: pide al dev que indique la nueva ubicación

Manejo de paths en diferentes máquinas (equipo):
  En modo cloud, cada dev tiene sus propios paths locales.
  ├── La DB central almacena proyecto por ID, no por path
  ├── Cada dev registra su path local para cada proyecto
  ├── El repo URL (Git remote) es el identificador universal
  └── Sync usa Git remote como key de matching
```

---

## 38. Resumen de Arquitectura

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      VIBE CODING MANAGEMENT APP                          │
│                    Iteración 10 — 38 secciones                           │
│           (revisión integral con prácticas Claude Code feb-2026)          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  INTERFACES                                                              │
│  ┌─────────────────────┐  ┌──────────────────────────────────────────┐   │
│  │  CLI                │  │  Web UI (Next.js 15 + tRPC)              │   │
│  │  vibe project init/ │  │  Dashboard: empresas, proyectos,         │   │
│  │  switch/status/scan │  │  métricas, contexto, costos, jobs,       │   │
│  │  + plugin install   │  │  plugins marketplace, compliance         │   │
│  │  + setup wizard §32 │  │  + gestión de credenciales               │   │
│  └────────┬────────────┘  └────────────────┬─────────────────────────┘   │
│           │                                 │                            │
│  ─────────▼─────────────────────────────────▼──────────────────────────  │
│                                                                          │
│  CORE ENGINE (@vibe/core)                                                │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │  CONTEXT RESOLVER + BUDGET MANAGER §23                           │    │
│  │  Fallback → Empresa → Proyecto (herencia + .claude/rules/)       │    │
│  │  Auto-detect │ CLAUDE.md lean router │ Rules path-scoped         │    │
│  │  Token budget ≤ 25% │ Tool search (defer_loading)                │    │
│  │  Progressive disclosure │ PreCompact checkpoint                  │    │
│  └──────────────┬───────────────────────────────────────────────────┘    │
│                 │                                                        │
│  ┌──────────────▼───────────────────────────────────────────────────┐    │
│  │  HISTORY & MEMORY LAYER                                          │    │
│  │  ┌─────────────┐ ┌──────────────┐ ┌───────────────────────────┐ │    │
│  │  │ Decisions   │ │ Sessions     │ │ Cross-tool Interactions   │ │    │
│  │  │ (ADRs) §25  │ │ Summaries    │ │ (Jira↔GitHub↔Slack↔PRs)  │ │    │
│  │  │ +quarantine │ │              │ │                           │ │    │
│  │  └─────────────┘ └──────────────┘ └───────────────────────────┘ │    │
│  │  ┌─────────────┐ ┌──────────────┐ ┌───────────────────────────┐ │    │
│  │  │ Learned     │ │ Plans        │ │ Relevance Scoring Engine  │ │    │
│  │  │ Fixes       │ │ (Plan Mode)  │ │ recency × scope × impact │ │    │
│  │  │ +lifecycle  │ │ active-plan  │ │ + vector search (>10K)    │ │    │
│  │  └─────────────┘ └──────────────┘ └───────────────────────────┘ │    │
│  └──────────────┬───────────────────────────────────────────────────┘    │
│                 │                                                        │
│  ┌──────────────▼───────────────────────────────────────────────────┐    │
│  │  SECURITY & COMPLIANCE LAYER §34                                 │    │
│  │  ┌──────────────┐ ┌─────────────┐ ┌──────────────────────────┐  │    │
│  │  │ Tenant       │ │ Secrets     │ │ Audit Log + GDPR         │  │    │
│  │  │ Isolation    │ │ Vault       │ │ Data residency §34.3     │  │    │
│  │  │ (sandbox     │ │ (creds por  │ │ Managed settings (ent.)  │  │    │
│  │  │  OS-level)   │ │  contexto)  │ │ Crypto-shredding         │  │    │
│  │  └──────────────┘ └─────────────┘ └──────────────────────────┘  │    │
│  └──────────────┬───────────────────────────────────────────────────┘    │
│                 │                                                        │
│  ┌──────────────▼───────────────────────────────────────────────────┐    │
│  │  MCP SERVER MANAGER + RATE LIMIT MANAGER §24                     │    │
│  │  Activa/desactiva por capacidad │ defer_loading │ Health checks  │    │
│  │  Token bucket per service │ Runs OUTSIDE sandbox (escape hatch)  │    │
│  └──────────────┬───────────────────────────────────────────────────┘    │
│                 │                                                        │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  CLAUDE CODE RUNTIME (sandbox OS-level activo)                           │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │    │
│  │  │ Skills  │ │ Agents   │ │ Hooks    │ │CLAUDE.md │ │.claude/│ │    │
│  │  │(unified │ │ Task()   │ │ 12+ evts │ │(lean     │ │rules/  │ │    │
│  │  │ with    │ │ Master-  │ │ cmd+     │ │ router)  │ │(path-  │ │    │
│  │  │ cmds)   │ │ Clone    │ │ prompt   │ │          │ │scoped) │ │    │
│  │  │ context │ │ pattern  │ │ types    │ │          │ │        │ │    │
│  │  │  :fork  │ │ +Plan    │ │ PreTool  │ │  §30     │ │        │ │    │
│  │  │         │ │  Mode    │ │ +Compact │ │          │ │        │ │    │
│  │  └─────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘ │    │
│  │  ┌──────────────────────────────────────────────────────────┐   │    │
│  │  │ PLUGINS (Claude Code native) — distribution mechanism    │   │    │
│  │  │ @vibe/core + @vibe/frontend + @vibe/enterprise + templs  │   │    │
│  │  │ Private marketplaces (enterprise) + community extensions │   │    │
│  │  └──────────────────────────────────────────────────────────┘   │    │
│  └──────────────┬───────────────────────────────────────────────────┘    │
│                 │                                                        │
│  ┌──────────────▼───────────────────────────────────────────────────┐    │
│  │  MCP SERVERS (fuera del sandbox, escape hatch)                   │    │
│  │                                                                  │    │
│  │  Empresa          Proyecto           Frontend                    │    │
│  │  ┌───────────┐   ┌───────────┐     ┌──────────────────────┐     │    │
│  │  │ GitHub    │   │ Jira /    │     │ Browser Preview      │     │    │
│  │  │ Slack     │   │ Trello /  │     │ Design Tokens        │     │    │
│  │  │ Figma     │   │ Linear    │     │ Playwright           │     │    │
│  │  └───────────┘   │ Conflu /  │     └──────────────────────┘     │    │
│  │  Platform         │ Notion    │                                  │    │
│  │  ┌───────────┐   └───────────┘     Community plugins via        │    │
│  │  │ vibe-ctx  │                     marketplace (GitHub-hosted)   │    │
│  │  │ vibe-hist │                                                   │    │
│  │  └───────────┘                                                   │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  AGENT SDK (programmatic Claude Code for CI/CD + workers)                │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │  @anthropic-ai/claude-agent-sdk (TypeScript + Python)            │    │
│  │  query() → streaming agentic loop │ Subagents paralelos         │    │
│  │  Workers: visual regression, code review, batch operations       │    │
│  │  CI/CD: GitHub Actions, GitLab CI │ permissionMode: acceptEdits  │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  PERSISTENCE & INFRASTRUCTURE                                            │
│  ┌──────────────────────────┐  ┌─────────────────────────────────────┐  │
│  │  Git (versionado)        │  │  Database (operativo)               │  │
│  │  CLAUDE.md, rules/,      │  │  Enterprises, Projects, Devs,      │  │
│  │  docs/, history/, skills,│  │  Sessions, Decisions, LearnedFixes, │  │
│  │  agents, plans/          │  │  ToolInteractions, CostRecords,Jobs │  │
│  │  Git LFS (baselines) §26│  │  SQLite (local) / Postgres (cloud)  │  │
│  └──────────────────────────┘  └─────────────────────────────────────┘  │
│  ┌──────────────────────────┐  ┌─────────────────────────────────────┐  │
│  │  Secrets Vault           │  │  Task Queue (BullMQ + Redis)        │  │
│  │  Credenciales cifradas   │  │  Critical │ Standard │ Bulk         │  │
│  │  por empresa/proyecto    │  │  Pipelines, checkpointing, retries  │  │
│  │  + data residency §34   │  │  Retention worker §26               │  │
│  └──────────────────────────┘  └─────────────────────────────────────┘  │
│  ┌──────────────────────────┐  ┌─────────────────────────────────────┐  │
│  │  Plugin Marketplace      │  │  Filesystem (.claude/)              │  │
│  │  GitHub-hosted repos     │  │  rules/ (path-scoped, symlinks)     │  │
│  │  Private + public        │  │  settings.json, .mcp.json           │  │
│  │  strictKnownMarketplaces │  │  ~/.vibe/db/ (project registry)     │  │
│  └──────────────────────────┘  └─────────────────────────────────────┘  │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  CROSS-CUTTING CONCERNS                                                  │
│  ┌────────────────┐ ┌────────────────┐ ┌─────────────────────────────┐  │
│  │ VALIDATION     │ │ OBSERVABILITY  │ │ COST MANAGEMENT             │  │
│  │ Auto (~80%)    │ │ Quality metrics│ │ Token tracking per project  │  │
│  │ Human (~20%)   │ │ Productivity   │ │ Opus vs Sonnet routing      │  │
│  │ Visual + E2E   │ │ Context health │ │ Agent SDK usage stats       │  │
│  │ A11y + Perf    │ │ AI quality §25 │ │ Budget alerts               │  │
│  └────────────────┘ └────────────────┘ └─────────────────────────────┘  │
│  ┌────────────────┐ ┌────────────────┐ ┌─────────────────────────────┐  │
│  │ VERSIONING     │ │ KNOWLEDGE      │ │ COLLABORATION               │  │
│  │ Git-based      │ │ PROMOTION      │ │ Branch-scoped decisions     │  │
│  │ Context diff   │ │ Proyecto →     │ │ Advisory locking             │  │
│  │ Rollback       │ │ Empresa →      │ │ Merge reconciliation        │  │
│  │ SemVer §36     │ │ Fallback       │ │ Shared rules via symlinks   │  │
│  └────────────────┘ └────────────────┘ └─────────────────────────────┘  │
│  ┌────────────────┐ ┌────────────────┐ ┌─────────────────────────────┐  │
│  │ MODEL COMPAT   │ │ CI/CD §29      │ │ DOCUMENTATION §31           │  │
│  │ Model version  │ │ Agent SDK      │ │ VitePress + Diátaxis        │  │
│  │ Prompt abstrac │ │ GitHub Actions │ │ Tutorials, How-to,          │  │
│  │ Test suite §30 │ │ AI code review │ │ Reference, Explanation      │  │
│  │ Agent Skills   │ │ Multi-CI gen   │ │ Auto-gen from types/CLI     │  │
│  │ open standard  │ │ vibe-dev/setup │ │                             │  │
│  └────────────────┘ └────────────────┘ └─────────────────────────────┘  │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  BUSINESS & OPERATIONS                                                   │
│  ┌────────────────┐ ┌────────────────┐ ┌─────────────────────────────┐  │
│  │ OPEN-CORE §27  │ │ CROSS-PLAT §28 │ │ RELEASE MGMT §36           │  │
│  │ MIT core       │ │ macOS ✅       │ │ SemVer estricto             │  │
│  │ Commercial     │ │ Linux ✅       │ │ Auto-migrations             │  │
│  │ enterprise     │ │ Windows ✅     │ │ Beta → RC → Stable          │  │
│  │ Telemetry      │ │ Docker §37     │ │ Conventional commits        │  │
│  │ opt-in         │ │ Sandbox-aware  │ │ Backward compat guarantee   │  │
│  └────────────────┘ └────────────────┘ └─────────────────────────────┘  │
│  ┌────────────────┐ ┌────────────────┐ ┌─────────────────────────────┐  │
│  │ SCALABILITY §35│ │ DX §32         │ │ PLUGIN SYSTEM §33           │  │
│  │ Benchmarks per │ │ Setup wizard   │ │ Claude Code plugins nativo  │  │
│  │ operation      │ │ Error messages │ │ Marketplace (GitHub-hosted) │  │
│  │ Tier limits    │ │ Demo mode      │ │ Private + public            │  │
│  │ Scale-up plan  │ │ First 5 min    │ │ Enterprise governance       │  │
│  └────────────────┘ └────────────────┘ └─────────────────────────────┘  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

SECCIONES COMPLETAS (38):
§1  Visión                    §14 Versionado del Contexto ★
§2  Jerarquía de Contexto ★★  §15 Métricas y Observabilidad
§3  Modelo por Capacidades    §16 Modelo de Datos y Persistencia
§4  Tipos de Contexto ★       §17 Interfaz de la App
§5  Building Blocks CC ★★★   §18 Migración de Herramientas
§6  Validación Frontend ★★    §19 Arquitectura del Sistema ★★★
§7  Historial y Memoria ★★    §20 Background Processing
§8  Flujo Completo ★★★       §21 Stack Técnico Completo ★
§9  Seguridad ★★★            §22 Fases de Construcción ★★★
§10 Onboarding ★★★           §23 Context Window Budget ★★★
§11 Colaboración Multi-Dev ★  §24 Rate Limiting APIs
§12 Gestión de Costos ★★      §25 Recuperación Output IA
§13 Resiliencia y Degradado ★ §26 Lifecycle y Retención
                              §27 Modelo de Negocio
★   = actualizada iter.10    §28 Cross-Platform
★★  = cambios significativos §29 CI/CD Integration ★★★
★★★ = reescrita iter.10     §30 Evolución Modelo IA
                              §31 Documentación
                              §32 DX Primera Ejecución ★
                              §33 Plugin System ★★★
                              §34 Legal y Compliance
                              §35 Escalabilidad
                              §36 Release Management
                              §37 Topología y Docker ★★
                              §38 Resumen de Arquitectura ★★★

Cambios clave de iteración 10 (revisión integral feb-2026):
├── §2: Jerarquía materializada como .claude/rules/ (no CLAUDE.md monolítico)
│       Symlinks para reglas de empresa, template packs para fallbacks
├── §4: Nuevo tipo "Planificación" (plans/ transitorio pero persistente)
│       Contexto estático ahora es rules path-scoped, dinámico con defer_loading
├── §5: Skills unificadas con Commands, Plugins como distribución,  ★★★
│       Rules directory con path-scoping, Plan Mode, 12+ hook events,
│       Hooks prompt-based (LLM-evaluated), Agent SDK, TodoWrite,
│       Agent Skills Open Standard, Master-Clone pattern
├── §6: Frontend validation via skill context:fork + PostToolUse hooks
│       Docs vs Rules split (referencia vs instrucciones path-scoped)
├── §7: Session management con PreCompact hook, Plan Mode persistence,
│       Background agents, context:fork para skills aisladas
│       Flujo bidireccional actualizado con Stop/PreCompact hooks
├── §8: Flujo con hooks reales (SessionStart, Stop, PreCompact, etc.) ★★★
│       Plan Mode nativo, PostToolUse para auto-format, PermissionRequest
├── §9: Sandbox OS-level awareness, managed-settings enterprise,    ★★★
│       srt para MCP servers, PermissionRequest hooks, Setup hook
├── §10: Plugin-based onboarding, Setup hook, auto-migración de    ★★★
│        .cursor/rules/ y AGENTS.md, scan inteligente con subagents
├── §11: Contexto compartido vs individual con rules hierarchy
├── §12: Costos con Agent SDK (CI), prompt hooks (Haiku), breakdown
│        detallado por modelo y canal
├── §13: PostToolUseFailure hooks, defer_loading awareness en health checks
├── §14: Versionado actualizado para rules/, plans/, settings.json
│        Listado explícito de archivos versionados vs no-versionados
├── §19: 7 piezas (+ Agent SDK), diagrama actualizado              ★★★
├── §21: Agent SDK + Claude Code plugins en stack summary table
├── §22: Fases plugin-first — cada fase produce plugin versionado   ★★★
│        Agent SDK en Fase 4, marketplace en Fase 6
├── §23: Budget optimizado (25%), rules path-scoped reducen contexto ★★★
│        CLAUDE.md lean (3K vs 8K tokens), defer_loading
├── §29: CI/CD con Agent SDK programático, AI code review en PRs   ★★★
├── §32: Claude Code 2.x version check
├── §33: Plugin system nativo de Claude Code (no propietario),     ★★★
│        marketplace.json, private marketplaces, governance
├── §37: Filesystem con shared-claude-rules/, symlinks, sandbox,
│        ~/.claude/rules/ personales, Claude Code sandbox awareness
└── §38: Diagrama resumen + changelog actualizado                  ★★★
```
