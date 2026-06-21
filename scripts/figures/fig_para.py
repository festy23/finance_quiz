"""Фигуры раздела «Парадигмы разработки» (квиз aisd).
Значения синхронизированы с api/_data/aisd/topics/para/*.js."""
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Circle, Ellipse, FancyArrowPatch
from _style import save, TX, TX3, PANEL, BG, GRID

QUIZ = "aisd"
AC = "#14b8a6"      # бирюзовый — акцент раздела парадигм
HOT = "#f59e0b"
OK = "#22c55e"
BAD = "#ef4444"


def build():
    HDR = "#1b2330"

    # ── dp_knapsack: ДП-таблица рюкзака 0/1 (предметы (1,1)(3,4)(4,5)(5,7), W=7) ──
    DP = [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 4, 5, 5, 5, 5],
        [0, 1, 1, 4, 5, 6, 6, 9],
        [0, 1, 1, 4, 5, 7, 8, 9],
    ]
    rowlbl = ["∅", "(1,1)", "(3,4)", "(4,5)", "(5,7)"]
    fig, ax = plt.subplots(figsize=(6.6, 3.8))
    nR, nC = 6, 9
    cw, ch = 0.9, 0.66
    for j in range(8):
        ax.add_patch(plt.Rectangle((1 + j * cw, (nR - 1) * ch), cw, ch, fc=HDR, ec=GRID, lw=1))
        ax.text(1 + j * cw + cw / 2, (nR - 1) * ch + ch / 2, str(j), color=TX3, ha="center", va="center", fontsize=10)
    ax.text(0.5, (nR - 1) * ch + ch / 2, "i \\ w", color=TX3, ha="center", va="center", fontsize=9)
    for i in range(5):
        y = (nR - 2 - i) * ch
        ax.add_patch(plt.Rectangle((0, y), 1, ch, fc=HDR, ec=GRID, lw=1))
        ax.text(0.5, y + ch / 2, rowlbl[i], color=TX3, ha="center", va="center", fontsize=9)
        for j in range(8):
            hot = (i == 4 and j == 7)
            ax.add_patch(plt.Rectangle((1 + j * cw, y), cw, ch, fc=OK if hot else PANEL, ec=GRID, lw=1))
            ax.text(1 + j * cw + cw / 2, y + ch / 2, str(DP[i][j]),
                    color=BG if hot else TX, ha="center", va="center",
                    fontsize=11, fontweight="bold" if hot else "normal")
    ax.set_xlim(-0.2, 1 + 8 * cw + 0.2); ax.set_ylim(-0.2, nR * ch)
    ax.set_aspect("equal"); ax.axis("off")
    ax.set_title("ДП рюкзака 0/1, W=7 → оптимум 9 (предметы (3,4)+(4,5))", color=TX, fontsize=12)
    save(fig, "dp_knapsack", QUIZ)

    # ── bb_tree: дерево решений ветвей и границ с отсечением ──────────────
    fig, ax = plt.subplots(figsize=(5.8, 4.0))
    nodes = {
        "r":  (0.0, 3, "оценка 9"),
        "L":  (-1.4, 2, "взять\nоценка 9"),
        "R":  (1.4, 2, "не взять\nоценка 6"),
        "LL": (-2.2, 1, "9 ✓"),
        "LR": (-0.6, 1, "8"),
    }
    edges = [("r", "L"), ("r", "R"), ("L", "LL"), ("L", "LR")]
    for (u, v) in edges:
        ax.annotate("", xy=nodes[v][:2], xytext=nodes[u][:2],
                    arrowprops=dict(arrowstyle="-", color=TX3, lw=1.6, shrinkA=20, shrinkB=20))
    for k, (x, y, lab) in nodes.items():
        col = BAD if k == "R" else (OK if k == "LL" else PANEL)
        ax.add_patch(plt.Rectangle((x - 0.55, y - 0.28), 1.1, 0.56, fc=col, ec=AC, lw=2, zorder=3))
        ax.text(x, y, lab, color=BG if k in ("R", "LL") else TX, ha="center", va="center",
                fontsize=9, fontweight="bold", zorder=4)
    ax.text(1.4, 1.45, "отсечь:\nоценка 6 ≤ 9", color=BAD, ha="center", va="center", fontsize=9)
    ax.set_xlim(-3.0, 2.6); ax.set_ylim(0.4, 3.6); ax.axis("off")
    ax.set_title("Метод ветвей и границ: отсечение по границе", color=TX, fontsize=12)
    save(fig, "bb_tree", QUIZ)

    # ── cx_pnp: диаграмма P ⊆ NP, NP-полные, NP-трудные (при P≠NP) ────────
    fig, ax = plt.subplots(figsize=(5.6, 4.2))
    ax.add_patch(Ellipse((0, -0.3), 5.6, 3.2, fc="#14b8a622", ec=AC, lw=2))
    ax.text(-1.6, 0.9, "NP", color=AC, fontsize=14, fontweight="bold")
    ax.add_patch(Ellipse((-1.0, -0.4), 2.2, 1.7, fc="#3b82f633", ec="#3b82f6", lw=2))
    ax.text(-1.0, -0.4, "P", color="#3b82f6", fontsize=13, fontweight="bold", ha="center", va="center")
    ax.add_patch(Ellipse((1.4, -0.3), 1.5, 2.4, fc="#ef444433", ec=BAD, lw=2))
    ax.text(1.4, -0.3, "NP-\nполные", color=BAD, fontsize=10, fontweight="bold", ha="center", va="center")
    ax.add_patch(Ellipse((2.4, -0.3), 3.2, 3.0, fc="none", ec=HOT, lw=2, ls="--"))
    ax.text(3.1, 1.5, "NP-трудные", color=HOT, fontsize=11, fontweight="bold", ha="center")
    ax.set_xlim(-3.4, 4.4); ax.set_ylim(-2.2, 2.4); ax.set_aspect("equal"); ax.axis("off")
    ax.set_title("Классы сложности (в предположении P ≠ NP)", color=TX, fontsize=12)
    save(fig, "cx_pnp", QUIZ)

    # ── ap_scheme: гарантия PTAS/FPTAS (1−ε)·OPT ─────────────────────────
    fig, ax = plt.subplots(figsize=(5.2, 3.0))
    ax.barh([1], [10], color="#3b82f6", height=0.5, label="OPT")
    ax.barh([0], [8.5], color=AC, height=0.5, label="приближение ≥ (1−ε)·OPT")
    ax.axvline(8.5, color=HOT, ls="--", lw=1.5)
    ax.text(8.5, 1.6, "(1−ε)·OPT", color=HOT, ha="center", fontsize=10)
    ax.set_yticks([0, 1]); ax.set_yticklabels(["ALG", "OPT"])
    ax.set_xlim(0, 11); ax.set_xlabel("ценность решения")
    ax.set_title("Гарантия аппроксимации: ALG ≥ (1−ε)·OPT", color=TX, fontsize=12)
    ax.grid(False)
    save(fig, "ap_scheme", QUIZ)

    # ── rd_karger: стягивание рёбер (минимальный разрез) ─────────────────
    fig, axes = plt.subplots(1, 2, figsize=(8.4, 3.6))
    # исходный граф: 4 вершины, мин. разрез = 2 (рёбра между {1,2} и {3,4})
    p0 = {1: (0, 1), 2: (0, 0), 3: (1.4, 1), 4: (1.4, 0)}
    e0 = [(1, 2), (1, 3), (2, 4), (3, 4)]
    cut = {(1, 3), (2, 4)}
    for (u, v) in e0:
        c = BAD if (u, v) in cut else TX3
        axes[0].plot([p0[u][0], p0[v][0]], [p0[u][1], p0[v][1]], color=c, lw=2.2, zorder=1)
    for n, (x, y) in p0.items():
        axes[0].add_patch(Circle((x, y), 0.14, fc=PANEL, ec=AC, lw=2, zorder=3))
        axes[0].text(x, y, str(n), color=TX, ha="center", va="center", fontsize=11, fontweight="bold", zorder=4)
    axes[0].set_title("Исходный граф (красным — мин. разрез)", color=TX, fontsize=10)
    axes[0].set_xlim(-0.4, 1.8); axes[0].set_ylim(-0.5, 1.5); axes[0].set_aspect("equal"); axes[0].axis("off")
    # после стягивания: две супервершины {1,2} и {3,4}, между ними 2 ребра
    p1 = {"12": (0, 0.5), "34": (1.6, 0.5)}
    for off in (0.12, -0.12):
        axes[1].plot([p1["12"][0], p1["34"][0]], [p1["12"][1] + off, p1["34"][1] + off], color=BAD, lw=2.2, zorder=1)
    for n, (x, y) in p1.items():
        axes[1].add_patch(Circle((x, y), 0.22, fc=PANEL, ec=AC, lw=2, zorder=3))
        axes[1].text(x, y, "{" + n[0] + "," + n[1] + "}", color=TX, ha="center", va="center", fontsize=10, fontweight="bold", zorder=4)
    axes[1].set_title("После стягиваний: 2 супервершины,\nразрез = 2 ребра", color=TX, fontsize=10)
    axes[1].set_xlim(-0.5, 2.1); axes[1].set_ylim(-0.3, 1.3); axes[1].set_aspect("equal"); axes[1].axis("off")
    fig.suptitle("Алгоритм Каргера: стягивание рёбер до 2 вершин", color=TX, fontsize=12)
    save(fig, "rd_karger", QUIZ)


if __name__ == "__main__":
    build()
