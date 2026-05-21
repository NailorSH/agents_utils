---
name: lab-typst-report-generator
description: Generates a Typst laboratory report file report.typ from completed working code using BMSTU-style structure (title-bmstu, sections, images, codeblock, conclusions). Use when the user asks to create/fill a report.typ after implementation and testing of a lab task.
---

# Lab Typst Report Generator

## Purpose

Create a ready-to-compile `report.typ` after the lab code is already implemented and runnable.

Target style matches the shared template and the refined report pattern:

- `#import "../../common/templates/lab.typ": title-bmstu, codeblock`
- title page via `#title-bmstu(...)` with **topic lines aligned to the real assignment** (not a leftover title from another lab)
- **Постановка задачи** — преимущественно **текстом** (цель, шаги задания, параметры вроде $epsilon$); без дублирования системы уравнений, если она уже дана в «Индивидуальном варианте»
- **Теоретические сведения** — по умолчанию **текст + формулы**; вставка серии `#image(...)` только если пользователь **явно** просит перенести теорию с отсканированных страниц или приложил готовые теоретические рисунки
- **Практическая часть**: вариант, исходные данные/система в **математически корректном виде** (см. раздел про формулы), реализация, результаты (графики/протокол — по факту запуска)
- listings via `#codeblock("...")` with path **relative to project root** (as in `lab.typ`)

## Theory: images vs text (mandatory rule)

- **Default:** write **Теоретические сведения** as continuous Russian text with formulas in Typst math. Do **not** assume theory must be a gallery of `1.jpg`, `2.jpg`, …
- **Use `#image("images/...")` for theory only when:**
  - the user explicitly asks to embed theory from scans/photos, **or**
  - the user supplies theory figures and asks to include them
- If the assignment was digitized elsewhere (e.g. `lab-image-to-markdown`), you may **summarize that content in text** in the theory section instead of pasting images—unless the user wants the scans in the PDF.

## Math and formulas (Typst, LaTeX-like)

Typst uses `$...$` for math. Prefer standard notation familiar from LaTeX:

- Inline: `$epsilon = 0.01$`, `$f'(x)$`, `$norm(vec(x))$` or explicit norms as in the assignment
- Subscripts/superscripts: `x_1`, `x^(k+1)`, `x_1^k`
- Greek: `epsilon`, `alpha`, `pi`, etc.
- Fractions: `frac(a, b)` or `(a)/(b)` where readable
- Matrices: `mat(...)` or explicit `mat(delim: "[", ...)` per Typst docs
- **Systems of equations:** use `cases(...)` with **comma-separated** branches (not `\` line breaks inside `cases`—Typst warns that linebreaks are ignored there):

```typst
#align(center)[
$ cases(
  f_1(x, y) = 0,
  f_2(x, y) = 0
) $
]
```

- Avoid duplicating the same system in **Постановка задачи** and **Индивидуальный вариант**; keep it once in the practical part unless the user wants repetition.

## Input Requirements

Before generating report, collect:

- lab number and title (exact wording for title page)
- student, teacher, group
- variant number and variant data (equations, tables, parameters)
- source code file path for listing (path as consumed by `#codeblock`, relative to repo root)
- test results (text and images/plots/screenshots) — **from actual runs**, not invented
- optional: theory scans (only if user wants them embedded)

If some fields are missing, insert explicit placeholders like `<TODO: ...>`, never invent factual data (numeric results, iteration counts, file paths).

## Output

- Main file: `report.typ` under `report/`, `reportnew/`, or user-provided directory
- Assets: `images/` next to `report.typ` (plots, screenshots); theory scans only when requested

## Workflow

Use this checklist:

```text
Task Progress:
- [ ] Step 1: Inspect existing report/template context
- [ ] Step 2: Build report data model from code and test outputs
- [ ] Step 3: Decide theory mode (text vs user-requested images)
- [ ] Step 4: Prepare images and code references
- [ ] Step 5: Generate report.typ with required structure
- [ ] Step 6: Validate Typst syntax, math, and references
- [ ] Step 7: Provide completion summary and TODO markers
```

### Step 1: Inspect template context

- Prefer `#import "../../common/templates/lab.typ": title-bmstu, codeblock` (adjust relative path if `report.typ` lives deeper).
- Keep `#set heading(numbering: "1.")`, `#pagebreak()` after title, footer behavior from template.
- Reuse Russian section names: Постановка задачи, Теоретические сведения, Практическая часть, Выводы.

### Step 2: Build report data model

Structured fields:

- `meta`: lab number, topic (two lines for `title-bmstu`), student, teacher, group
- `task`: formulation as **bullet list or short paragraphs** (what to do, precision, graphical step if required)—**without** pasting wrong lab topics (e.g. MNK vs Newton)
- `theory`: **default** — prose + formulas; optional image list if user requested
- `variant`: variant number, equations/tables **once**, clear statement of initial guess policy (e.g. from plot intersection) if applicable
- `implementation`: language and method match the real file (`#codeblock` path)
- `testing`: plots/tables + **what the figure shows** (e.g. «графическое решение для выбора начального приближения» vs «итоговая аппроксимация»—must match the lab)
- `conclusions`: factual alignment with code and tests; no copy-paste from unrelated labs

### Step 3: Theory mode

- If user **did not** ask for theory from images → write **Теоретические сведения** in text with correct math.
- If user asked for scans → use `#image("images/...", width: 100%)` in order; still add a short intro sentence if helpful.
- Never fill theory with unrelated placeholder figures.

### Step 4: Prepare assets

- Copy plots/screenshots into `images/` with stable names (`plot.png`, `01-condition.png`, …).
- Every `#image(...)` path must exist.
- `#codeblock("...")` must point to a real file under the repo root (per `lab.typ` `read("../../" + path)` convention).

### Step 5: Generate `report.typ`

Canonical structure (adapt content to the lab):

```typst
#import "../../common/templates/lab.typ": title-bmstu, codeblock

#title-bmstu(
  ("<lab-number>", "<topic-line-1>", "<topic-line-2>"),
  "<student>",
  "<teacher>",
  "<group>"
)

#set heading(numbering: "1.")
#pagebreak()

= Постановка задачи
<text: goal, required steps, parameters — avoid repeating full variant equations if they appear below>

= Теоретические сведения
<text + $inline/display$ math by default>
OR
<#image(...) blocks only if user requested theory from figures>

= Практическая часть

== Индивидуальный вариант
<text: variant N, given equations in $cases(...)$ or tables as needed>
<short note on initial approximation if relevant>

== Программная реализация
<paragraph matching actual stack>
#codeblock("<path-from-repo-root>")

== Результаты тестирования
<explanation + #align(center, image(...)) for plots>

#pagebreak()

= Выводы
<concise, consistent with implementation and tests>
```

### Step 6: Validation

Mandatory checks:

- Typst syntax: no broken delimiters; `cases` uses commas between branches.
- Math renders logically (systems as `cases`, not two unrelated inline lines).
- Title topic matches the assignment; no leftover sections from another work.
- All image paths resolve; `#codeblock` path exists.
- Testing section reflects **actual** outputs.
- No duplicate blocks (same system in postanovka and variant) unless intentional.

If `typst compile` is available, run it and fix issues.

### Step 7: Completion summary

Report to user:

- output `report.typ` path
- list of images used and their role (theory vs result plot)
- code file linked in listing
- theory mode chosen (text vs images)
- unresolved `<TODO: ...>` if any

## Writing Rules

- Formal, concise Russian for BMSTU-style reports unless user requests another language.
- **Программная реализация:** state the real language (Python, C++, …); do not claim C++ if the listing is `.py`.
- Do not paste large code in prose; use `#codeblock`.
- **Выводы** must match the method and results actually implemented.
- Prefer explicit notation for stopping criteria and norms when given in the assignment ($max(|Delta x|, |Delta y|) <= epsilon$, etc.) using valid Typst math.

## Minimal Example Snippets

System (variant):

```typst
#align(center)[
$ cases(
  cos(x + 0.5) + y = 1,
  sin(y) - 2x = 1
) $
]
```

Table (when needed):

```typst
#table(
  columns:(1fr,1fr,1fr,1fr),
  [$x$],[*1*],[*2*],[*3*],
  [$f(x)$],[2.57],[3.08],[3.45]
)
```

Result plot:

```typst
#align(center,
  image("images/plot.png", width: 60%)
)
```
