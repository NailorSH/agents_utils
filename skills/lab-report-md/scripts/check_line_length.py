#!/usr/bin/env python3
"""
Проверка и исправление длины строк в Markdown отчётах.
Максимальная длина по умолчанию: 100 символов.
"""

import argparse
import sys
from pathlib import Path

DEFAULT_MAX_LENGTH = 100


def check_file(filepath: Path, max_length: int = DEFAULT_MAX_LENGTH):
    """Проверка длины строк в файле."""
    long_lines = []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            for i, line in enumerate(f, 1):
                stripped = line.rstrip()
                if len(stripped) > max_length:
                    long_lines.append((i, len(stripped), stripped[:80] + "..."))
    except Exception as e:
        print(f"Ошибка чтения файла {filepath}: {e}", file=sys.stderr)
        return None
    return long_lines


def break_long_line(line: str, max_length: int = DEFAULT_MAX_LENGTH) -> str:
    """Разбиение длинной строки на несколько с переносом по словам."""
    if len(line) <= max_length:
        return line

    # Не разбиваем код, таблицы, заголовки
    stripped = line.strip()
    if stripped.startswith('```') or stripped.startswith('|'):
        return line
    if stripped.startswith('#'):
        return line
    if stripped.startswith('    ') or stripped.startswith('\t'):
        return line

    words = line.split(' ')
    result = []
    current = ""

    for word in words:
        if len(current) + len(word) + 1 <= max_length:
            if current:
                current += " " + word
            else:
                current = word
        else:
            if current:
                result.append(current)
            current = word

    if current:
        result.append(current)

    return '\n'.join(result)


def fix_file(filepath: Path, max_length: int = DEFAULT_MAX_LENGTH) -> int:
    """Исправление длины строк в файле."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Ошибка чтения файла {filepath}: {e}", file=sys.stderr)
        return 0

    lines = content.split('\n')
    fixed_count = 0
    new_lines = []

    for line in lines:
        stripped = line.rstrip()
        if len(stripped) > max_length:
            new_line = break_long_line(stripped, max_length)
            if new_line != stripped:
                new_lines.append(new_line)
                fixed_count += 1
            else:
                new_lines.append(line)
        else:
            new_lines.append(line)

    if fixed_count > 0:
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write('\n'.join(new_lines))
        except Exception as e:
            print(f"Ошибка записи файла {filepath}: {e}", file=sys.stderr)
            return 0

    return fixed_count


def main():
    parser = argparse.ArgumentParser(
        description="Проверка и исправление длины строк в Markdown"
    )
    parser.add_argument('files', nargs='+', help='Пути к Markdown файлам')
    parser.add_argument(
        '-m', '--max-length',
        type=int,
        default=DEFAULT_MAX_LENGTH,
        help=f'Максимальная длина строки (по умолчанию: {DEFAULT_MAX_LENGTH})'
    )
    parser.add_argument(
        '-f', '--fix',
        action='store_true',
        help='Исправить длинные строки автоматически'
    )
    parser.add_argument(
        '-q', '--quiet',
        action='store_true',
        help='Тихий режим (только код возврата)'
    )

    args = parser.parse_args()

    total_long = 0
    total_fixed = 0
    has_errors = False

    for filepath_str in args.files:
        filepath = Path(filepath_str)
        if not filepath.exists():
            if not args.quiet:
                print(f"⚠ Файл не найден: {filepath}", file=sys.stderr)
            has_errors = True
            continue

        long_lines = check_file(filepath, args.max_length)
        if long_lines is None:
            has_errors = True
            continue

        if long_lines:
            total_long += len(long_lines)
            if not args.quiet:
                print(f"\n📄 {filepath}")
                print(f"   Найдено {len(long_lines)} длинных строк:")
                for line_num, length, preview in long_lines[:5]:
                    print(f"   - Строка {line_num}: {length} симв.")
                if len(long_lines) > 5:
                    print(f"   ... и ещё {len(long_lines) - 5}")

            if args.fix:
                fixed = fix_file(filepath, args.max_length)
                if fixed > 0:
                    if not args.quiet:
                        print(f"   ✅ Исправлено: {fixed} строк")
                    total_fixed += fixed
        else:
            if not args.quiet:
                print(f"✅ {filepath} - все строки в пределах нормы")

    if not args.quiet:
        print(f"\n{'=' * 60}")
        if args.fix:
            print(f"Итого: найдено {total_long}, исправлено {total_fixed}")
        else:
            print(f"Итого длинных строк: {total_long}")
        print(f"{'=' * 60}")

    return 1 if (total_long > 0 and not args.fix) or has_errors else 0


if __name__ == '__main__':
    sys.exit(main())
