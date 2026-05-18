# dirapp.py
#!/usr/bin/env python3
"""
scan_nextjs.py — Baca & tampilkan struktur folder proyek Next.js
Usage:
    python scan_nextjs.py                        # scan folder saat ini
    python scan_nextjs.py /path/to/nextjs-app    # scan folder tertentu
    python scan_nextjs.py --output tree.txt      # simpan ke file
    python scan_nextjs.py --depth 4              # batasi kedalaman (default: 5)
    python scan_nextjs.py --no-ignore            # tampilkan semua (termasuk node_modules)
"""

import os
import sys
import argparse
from pathlib import Path

# ──────────────────────────────────────────────
# Folder & file yang di-skip secara default
# ──────────────────────────────────────────────
DEFAULT_IGNORE_DIRS = {
    "node_modules", ".next", ".git", ".turbo", ".swc",
    "dist", "build", "out", ".cache", "coverage",
    "__pycache__", ".pytest_cache", ".venv", "venv",
}

DEFAULT_IGNORE_FILES = {
    ".DS_Store", "Thumbs.db", "*.pyc", "*.pyo",
}

# Ekstensi yang dianggap penting di Next.js
NEXTJS_EXTENSIONS = {
    ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
    ".css", ".scss", ".sass", ".module.css", ".module.scss",
    ".json", ".env", ".env.local", ".env.example",
    ".md", ".mdx", ".yml", ".yaml", ".toml",
}

# Warna ANSI (opsional, otomatis dimatikan kalau output ke file)
class Color:
    RESET  = "\033[0m"
    BOLD   = "\033[1m"
    BLUE   = "\033[34m"
    CYAN   = "\033[36m"
    GREEN  = "\033[32m"
    YELLOW = "\033[33m"
    GRAY   = "\033[90m"
    RED    = "\033[31m"

def colorize(text, color, use_color=True):
    if not use_color:
        return text
    return f"{color}{text}{Color.RESET}"


def should_ignore(name, ignore_dirs, is_dir):
    if is_dir:
        return name in ignore_dirs
    # Cek pola wildcard sederhana (*.ext)
    for pattern in DEFAULT_IGNORE_FILES:
        if pattern.startswith("*"):
            if name.endswith(pattern[1:]):
                return True
        elif name == pattern:
            return True
    return False


def build_tree(
    root: Path,
    prefix: str = "",
    depth: int = 0,
    max_depth: int = 5,
    ignore_dirs: set = None,
    use_color: bool = True,
    stats: dict = None,
):
    if ignore_dirs is None:
        ignore_dirs = DEFAULT_IGNORE_DIRS
    if stats is None:
        stats = {"dirs": 0, "files": 0, "ignored": 0}
    if depth > max_depth:
        return [colorize(f"{prefix}... (max depth reached)", Color.GRAY, use_color)]

    lines = []
    try:
        entries = sorted(root.iterdir(), key=lambda e: (e.is_file(), e.name.lower()))
    except PermissionError:
        return [colorize(f"{prefix}[permission denied]", Color.RED, use_color)]

    entries_filtered = []
    for entry in entries:
        if should_ignore(entry.name, ignore_dirs, entry.is_dir()):
            stats["ignored"] += 1
        else:
            entries_filtered.append(entry)

    for i, entry in enumerate(entries_filtered):
        is_last = i == len(entries_filtered) - 1
        connector = "└── " if is_last else "├── "
        extension = "    " if is_last else "│   "

        if entry.is_dir():
            stats["dirs"] += 1
            label = colorize(f"{entry.name}/", Color.BLUE + Color.BOLD, use_color)
            lines.append(f"{prefix}{connector}{label}")
            lines.extend(
                build_tree(
                    entry,
                    prefix=prefix + extension,
                    depth=depth + 1,
                    max_depth=max_depth,
                    ignore_dirs=ignore_dirs,
                    use_color=use_color,
                    stats=stats,
                )
            )
        else:
            stats["files"] += 1
            ext = "".join(entry.suffixes)
            if ext in NEXTJS_EXTENSIONS or any(entry.name.startswith(p) for p in [".env", "next.config", "tsconfig", "package"]):
                name_colored = colorize(entry.name, Color.GREEN, use_color)
            else:
                name_colored = colorize(entry.name, Color.GRAY, use_color)

            # Tampilkan ukuran file
            try:
                size = entry.stat().st_size
                size_str = f" ({_human_size(size)})" if size > 0 else ""
                size_colored = colorize(size_str, Color.GRAY, use_color)
            except OSError:
                size_colored = ""

            lines.append(f"{prefix}{connector}{name_colored}{size_colored}")

    return lines


def _human_size(size: int) -> str:
    for unit in ["B", "KB", "MB", "GB"]:
        if size < 1024:
            return f"{size:.0f}{unit}" if unit == "B" else f"{size:.1f}{unit}"
        size /= 1024
    return f"{size:.1f}TB"


def detect_nextjs_info(root: Path) -> dict:
    """Deteksi versi & konfigurasi Next.js dari package.json."""
    info = {}
    pkg = root / "package.json"
    if pkg.exists():
        import json
        try:
            data = json.loads(pkg.read_text(encoding="utf-8"))
            deps = {**data.get("dependencies", {}), **data.get("devDependencies", {})}
            info["next_version"] = deps.get("next", "?")
            info["react_version"] = deps.get("react", "?")
            info["typescript"] = "typescript" in deps
            info["project_name"] = data.get("name", root.name)
        except Exception:
            pass

    # App Router vs Pages Router
    if (root / "app").is_dir():
        info["router"] = "App Router"
    elif (root / "pages").is_dir():
        info["router"] = "Pages Router"
    else:
        info["router"] = "Unknown"

    # src/ folder
    info["src_dir"] = (root / "src").is_dir()

    return info


def print_header(root: Path, info: dict, use_color: bool):
    lines = []
    sep = colorize("─" * 60, Color.CYAN, use_color)
    lines.append(sep)
    lines.append(colorize("  📦 Next.js Project Scanner", Color.BOLD, use_color))
    lines.append(sep)
    lines.append(f"  Path    : {root.resolve()}")
    if info:
        lines.append(f"  Project : {info.get('project_name', root.name)}")
        lines.append(f"  Next.js : {info.get('next_version', '?')}")
        lines.append(f"  React   : {info.get('react_version', '?')}")
        lines.append(f"  Router  : {info.get('router', '?')}")
        lines.append(f"  TypeScript: {'✓' if info.get('typescript') else '✗'}")
        lines.append(f"  src/    : {'✓' if info.get('src_dir') else '✗'}")
    lines.append(sep)
    return lines


def main():
    parser = argparse.ArgumentParser(
        description="Scan struktur folder proyek Next.js",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "path",
        nargs="?",
        default=".",
        help="Path ke folder proyek Next.js (default: folder saat ini)",
    )
    parser.add_argument(
        "--output", "-o",
        metavar="FILE",
        help="Simpan output ke file teks",
    )
    parser.add_argument(
        "--depth", "-d",
        type=int,
        default=5,
        help="Kedalaman maksimum direktori (default: 5)",
    )
    parser.add_argument(
        "--no-ignore",
        action="store_true",
        help="Tampilkan semua folder termasuk node_modules, .next, dsb.",
    )
    parser.add_argument(
        "--no-color",
        action="store_true",
        help="Matikan warna ANSI",
    )
    args = parser.parse_args()

    root = Path(args.path).resolve()
    if not root.exists():
        print(f"❌ Path tidak ditemukan: {root}", file=sys.stderr)
        sys.exit(1)
    if not root.is_dir():
        print(f"❌ Bukan direktori: {root}", file=sys.stderr)
        sys.exit(1)

    # Matikan warna kalau output ke file
    use_color = not args.no_color and not args.output

    ignore_dirs = set() if args.no_ignore else DEFAULT_IGNORE_DIRS

    # Info proyek
    info = detect_nextjs_info(root)

    stats = {"dirs": 0, "files": 0, "ignored": 0}

    header_lines = print_header(root, info, use_color)
    root_label = colorize(f"{root.name}/", Color.BLUE + Color.BOLD, use_color)
    tree_lines = build_tree(
        root,
        max_depth=args.depth,
        ignore_dirs=ignore_dirs,
        use_color=use_color,
        stats=stats,
    )

    summary = colorize("─" * 60, Color.CYAN, use_color)
    summary_lines = [
        summary,
        colorize(
            f"  {stats['dirs']} dirs, {stats['files']} files"
            + (f", {stats['ignored']} ignored" if stats["ignored"] else ""),
            Color.GRAY,
            use_color,
        ),
        summary,
    ]

    all_lines = header_lines + [root_label] + tree_lines + summary_lines

    output_text = "\n".join(all_lines)

    if args.output:
        # Strip ANSI kalau nulis ke file
        import re
        clean = re.sub(r"\033\[[0-9;]*m", "", output_text)
        Path(args.output).write_text(clean, encoding="utf-8")
        print(f"✅ Struktur disimpan ke: {args.output}")
    else:
        print(output_text)


if __name__ == "__main__":
    main()