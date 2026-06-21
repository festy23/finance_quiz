"""Фигуры раздела «Строковые алгоритмы» (квиз aisd).
Значения синхронизированы с api/_data/aisd/topics/str/*.js."""
import matplotlib.pyplot as plt
from matplotlib.patches import Circle, FancyArrowPatch
from _style import save, TX, TX3, PANEL, BG, GRID

QUIZ = "aisd"
AC = "#ec4899"      # розовый — акцент строкового раздела
HOT = "#f59e0b"
OK = "#22c55e"


def _grid(ax, cells, x0=0, y0=0, cw=0.9, ch=0.7, hi=None, fc_hi=HOT):
    """cells[r][c] = (text, base_color|None). hi: set (r,c) для подсветки."""
    hi = hi or set()
    R, C = len(cells), len(cells[0])
    for r in range(R):
        for c in range(C):
            txt, base = cells[r][c]
            fc = fc_hi if (r, c) in hi else (base or PANEL)
            x, y = x0 + c * cw, y0 - r * ch
            ax.add_patch(plt.Rectangle((x, y), cw, ch, fc=fc, ec=GRID, lw=1))
            tc = BG if (r, c) in hi else TX
            ax.text(x + cw / 2, y + ch / 2, txt, color=tc, ha="center", va="center",
                    fontsize=11, fontweight="bold" if (r, c) in hi else "normal")
    ax.set_xlim(x0 - 0.2, x0 + C * cw + 0.2)
    ax.set_ylim(y0 - (R - 1) * ch - 0.2, y0 + ch + 0.2)
    ax.set_aspect("equal"); ax.axis("off")


def build():
    HDR = "#1b2330"

    # ── ex_prefix: префикс-функция KMP для ABABC ─────────────────────────
    P = "ABABC"; pi = [0, 0, 1, 2, 0]
    fig, ax = plt.subplots(figsize=(5.0, 1.9))
    cells = [
        [("i", HDR)] + [(str(k + 1), HDR) for k in range(5)],
        [("P[i]", HDR)] + [(ch, PANEL) for ch in P],
        [("π[i]", HDR)] + [(str(v), None) for v in pi],
    ]
    _grid(ax, cells, hi={(2, 4)})  # подсветка π[4]=2 (наибольшее значение)
    ax.set_title("Префикс-функция KMP: образец «ABABC»", color=TX, fontsize=12)
    save(fig, "ex_prefix", QUIZ)

    # ── ex_horspool: таблица сдвигов Бойера–Мура–Хорспула для BARBER ──────
    fig, ax = plt.subplots(figsize=(5.2, 1.7))
    chars = ["B", "A", "R", "E", "проч."]; shifts = ["2", "4", "3", "1", "6"]
    cells = [
        [("символ", HDR)] + [(c, PANEL) for c in chars],
        [("сдвиг", HDR)] + [(s, None) for s in shifts],
    ]
    _grid(ax, cells, cw=1.0)
    ax.set_title("Сдвиги Хорспула: образец «BARBER» (по P[0..4])", color=TX, fontsize=12)
    save(fig, "ex_horspool", QUIZ)

    # ── ed_dp_table: ДП-таблица Левенштейна CAT→CART ─────────────────────
    s, t = "CAT", "CART"
    D = [[0, 1, 2, 3, 4], [1, 0, 1, 2, 3], [2, 1, 0, 1, 2], [3, 2, 1, 1, 1]]
    path = {(0, 0), (1, 1), (2, 2), (2, 3), (3, 4)}  # выравнивание (вставка R)
    fig, ax = plt.subplots(figsize=(5.2, 4.2))
    R, C = 5, 6
    cells = [[("", PANEL) for _ in range(C)] for _ in range(R)]
    cells[0][0] = ("", HDR); cells[0][1] = ("∅", HDR)
    for j, ch in enumerate(t):
        cells[0][j + 2] = (ch, HDR)
    cells[1][0] = ("∅", HDR)
    for i, ch in enumerate(s):
        cells[i + 2][0] = (ch, HDR)
    hi = set()
    for i in range(4):
        for j in range(5):
            cells[i + 1][j + 1] = (str(D[i][j]), None)
            if (i, j) in path:
                hi.add((i + 1, j + 1))
    _grid(ax, cells, cw=0.8, ch=0.8, hi=hi, fc_hi=OK)
    ax.set_title("ДП Левенштейна: CAT → CART = 1 (вставка R)", color=TX, fontsize=12)
    save(fig, "ed_dp_table", QUIZ)

    # ── aho_trie: бор Ахо–Корасик {he,she,his,hers} + примеры fail ───────
    pos = {
        "root": (0, 4),
        "h": (-2.2, 3), "he": (-3.2, 2), "r": (-3.2, 1), "hers": (-3.2, 0),
        "i": (-1.2, 2), "his": (-1.2, 1),
        "s": (2.2, 3), "sh": (2.2, 2), "she": (2.2, 1),
    }
    tree = [("root", "h", "h"), ("h", "he", "e"), ("he", "r", "r"), ("r", "hers", "s"),
            ("h", "i", "i"), ("i", "his", "s"),
            ("root", "s", "s"), ("s", "sh", "h"), ("sh", "she", "e")]
    terminal = {"he", "hers", "his", "she"}
    fails = [("she", "he"), ("hers", "s"), ("his", "s")]
    fig, ax = plt.subplots(figsize=(6.4, 4.8))
    for (u, v, lab) in tree:
        ax.annotate("", xy=pos[v], xytext=pos[u],
                    arrowprops=dict(arrowstyle="-", color=TX3, lw=1.6, shrinkA=13, shrinkB=13))
        mx, my = (pos[u][0] + pos[v][0]) / 2, (pos[u][1] + pos[v][1]) / 2
        ax.text(mx + 0.18, my, lab, color=AC, fontsize=10, fontweight="bold")
    for (u, v) in fails:
        ax.add_patch(FancyArrowPatch(pos[u], pos[v], connectionstyle="arc3,rad=-0.3",
                                     arrowstyle="-|>", mutation_scale=14, color=OK,
                                     lw=1.6, ls="--", shrinkA=13, shrinkB=13, zorder=1))
    for n, (x, y) in pos.items():
        fc = OK if n in terminal else PANEL
        ax.add_patch(Circle((x, y), 0.28, fc=fc, ec=AC, lw=2, zorder=3))
        lbl = "root" if n == "root" else n[-1]
        ax.text(x, y, lbl, color=BG if n in terminal else TX, ha="center", va="center",
                fontsize=9 if n == "root" else 11, fontweight="bold", zorder=4)
    ax.set_xlim(-4.2, 3.4); ax.set_ylim(-0.6, 4.6); ax.axis("off")
    ax.set_title("Бор Ахо–Корасик {he, she, his, hers}\nзелёным пунктиром — fail-ссылки (she→he, hers→s)",
                 color=TX, fontsize=11)
    save(fig, "aho_trie", QUIZ)

    # ── cd_huffman: дерево Хаффмана A:5 B:2 C:1 D:1 ───────────────────────
    hpos = {"r9": (0, 3), "A": (-1.6, 2), "n4": (1.6, 2), "B": (0.6, 1),
            "n2": (2.6, 1), "C": (1.8, 0), "D": (3.4, 0)}
    hedges = [("r9", "A", "0"), ("r9", "n4", "1"), ("n4", "B", "0"),
              ("n4", "n2", "1"), ("n2", "C", "0"), ("n2", "D", "1")]
    leaf = {"A": "A:5\n(0)", "B": "B:2\n(10)", "C": "C:1\n(110)", "D": "D:1\n(111)"}
    internal = {"r9": "9", "n4": "4", "n2": "2"}
    fig, ax = plt.subplots(figsize=(5.6, 3.8))
    for (u, v, lab) in hedges:
        ax.annotate("", xy=hpos[v], xytext=hpos[u],
                    arrowprops=dict(arrowstyle="-", color=TX3, lw=1.6, shrinkA=16, shrinkB=18))
        mx, my = (hpos[u][0] + hpos[v][0]) / 2, (hpos[u][1] + hpos[v][1]) / 2
        ax.text(mx - 0.18, my, lab, color=HOT, fontsize=11, fontweight="bold")
    for n, (x, y) in hpos.items():
        if n in leaf:
            ax.add_patch(plt.Rectangle((x - 0.42, y - 0.32), 0.84, 0.64, fc=PANEL, ec=AC, lw=2, zorder=3))
            ax.text(x, y, leaf[n], color=TX, ha="center", va="center", fontsize=9, zorder=4)
        else:
            ax.add_patch(Circle((x, y), 0.28, fc="#1b2330", ec=AC, lw=2, zorder=3))
            ax.text(x, y, internal[n], color=TX, ha="center", va="center", fontsize=11, fontweight="bold", zorder=4)
    ax.set_xlim(-2.4, 4.2); ax.set_ylim(-0.6, 3.5); ax.axis("off")
    ax.set_title("Дерево Хаффмана A:5 B:2 C:1 D:1 — итого 15 бит", color=TX, fontsize=12)
    save(fig, "cd_huffman", QUIZ)

    # ── cd_lzw: таблица кодирования LZW для ABABABA ──────────────────────
    fig, ax = plt.subplots(figsize=(5.6, 2.6))
    rows = [
        ["шаг", "выдать", "код", "добавить"],
        ["1", "A", "1", "AB=3"],
        ["2", "B", "2", "BA=4"],
        ["3", "AB", "3", "ABA=5"],
        ["4", "ABA", "5", "—"],
    ]
    cells = []
    for r, row in enumerate(rows):
        cells.append([(v, HDR if r == 0 else PANEL) for v in row])
    _grid(ax, cells, cw=1.25, ch=0.6, hi={(1, 2), (2, 2), (3, 2), (4, 2)}, fc_hi=AC)
    ax.set_title("LZW кодирование «ABABABA» → 1, 2, 3, 5", color=TX, fontsize=12)
    save(fig, "cd_lzw", QUIZ)


if __name__ == "__main__":
    build()
