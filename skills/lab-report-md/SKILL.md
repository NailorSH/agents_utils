---
name: lab-report-md
description: Create and format lab reports in Markdown with Typst-style headers. Validates line length ≤100 chars. Use when writing lab reports, formatting academic documents, or converting assignments to markdown reports.
---

# Lab Report Markdown Formatter

Skill for creating academic lab reports in Markdown format with automatic validation.

## Core Capabilities

1. **Report generation** from assignment specifications
2. **Header formatting** (Typst-style: `% Title`, `% Date`, `% Author`)
3. **Line length validation** (≤100 characters by default)
4. **Template adaptation** for different lab formats

## Report Structure Template

Standard lab report sections:

```markdown
% Лабораторная работа № X.Y «Название работы»
% <лабораторная ещё не сдана>
% Имя Фамилия, Группа

# Цель работы
...переписываете из задания...

# Индивидуальный вариант
...краткое описание варианта...

## Лексический/синтаксический домен для защиты
...формулировка преподавателя или "определяется преподавателем"...

# Реализация

## Файл `filename.ext`
```language
...код...
```

## Файл `filename2.ext`
```language
...код...
```

# Тестирование

Входные данные
```
...входные данные...
```

Вывод на `stdout`
```
...вывод программы...
```

# Вывод
...чему научились...
```

## Adaptation Rules

When user provides custom template:
1. Preserve exact header format from template
2. Keep section structure from template
3. Apply line length limits to all content
4. Maintain code block formatting

## Line Length Validation

**Critical:** All lines must be ≤100 characters.

### Check Command
```bash
python3 .cursor/skills/lab-report-md/scripts/check_line_length.py report.md
```

### Fix Automatically
```bash
python3 .cursor/skills/lab-report-md/scripts/check_line_length.py -f report.md
```

### What Gets Fixed
- Long paragraphs → split by words
- Lists → wrapped items
- Descriptions → multi-line

### What Stays As-Is
- Code blocks (```...```)
- Tables (|...|)
- Headers (#...)
- Indented code

## Special Characters

### Quotes
- Use `"` for regular quotes
- Use `` ` `` for inline code/escapes (\n, \t, etc.)
- Avoid «ёлочки» — they cause LaTeX errors

### Escapes in Text
When writing escape sequences like `\n`, `\t`, `\"`:
- Wrap in backticks: `` `\n` ``, `` `\t` ``
- This prevents LaTeX interpretation errors

## Workflow

1. **Read assignment** (cond.md, TZ.md, etc.)
2. **Extract**: goal, variant, requirements
3. **Create report.md** with template structure
4. **Add implementation** code sections
5. **Add test cases** with real input/output
6. **Run validation**: check_line_length.py
7. **Fix issues** automatically or manually
8. **Verify**: all lines ≤100 chars

## Quality Checklist

- [ ] Header follows Typst format (3 lines starting with `%`)
- [ ] All lines ≤100 characters
- [ ] Code sections properly fenced
- [ ] Real test output (not fictional)
- [ ] No «ёлочки» quotes
- [ ] Escape sequences in backticks
