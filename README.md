# agents_utils

[![skills.sh](https://skills.sh/b/nailorsh/agents_utils)](https://skills.sh/nailorsh/agents_utils)

Личный репозиторий **скиллов** (Agent Skills) и **субагентов** для Cursor и других AI-агентов.

## Установка скилла

Скиллы из этого репозитория можно подключить через [skills.sh](https://skills.sh):

```bash
npx skills add https://github.com/nailorsh/agents_utils --skill <имя-скилла>
```

Пример:

```bash
npx skills add https://github.com/nailorsh/agents_utils --skill telegram-mini-apps-react
```

## Скиллы

| Скилл | Описание |
|-------|----------|
| `telegram-mini-apps-react` | Telegram Mini Apps на React (`@tma.js/sdk-react`) |
| `lab-report-md` | Лабораторные отчёты в Markdown |
| `lab-typst-report-generator` | Генерация отчёта `report.typ` (Typst, BMSTU) |

## Субагенты

Промпты субагентов лежат в `agents/`:

| Агент | Описание |
|-------|----------|
| `builder-ktor` | Генерация feature slice для Kotlin Ktor backend |

## Структура

```
skills/     # Agent Skills (SKILL.md + references, examples)
agents/     # Промпты субагентов для Cursor
```
