"""Фигуры раздела «Графовые алгоритмы» (квиз aisd).
Значения в фигурах синхронизированы с api/_data/aisd/topics/graph/*.js."""
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, Circle
import networkx as nx
from _style import save, TX, TX3, PANEL, BG, GRID

QUIZ = "aisd"
AC = "#6366f1"      # индиго — акцент графового раздела
HOT = "#f59e0b"     # подсветка изменённого/активного
OK = "#22c55e"
INF = "∞"


def _draw_digraph(ax, pos, edges, node_color=None, edge_hi=None):
    """edges: list of (u,v,w). edge_hi: set of (u,v) для подсветки.
    Двунаправленные рёбра изгибаются в разные стороны; подпись веса смещается
    перпендикулярно ребру по стороне изгиба, чтобы метки не перекрывались."""
    edge_hi = edge_hi or set()
    node_color = node_color or {}
    pair = {(a, b) for a, b, _ in edges}
    for (u, v, w) in edges:
        col = HOT if (u, v) in edge_hi else TX3
        curved = (v, u) in pair  # двунаправленные — изгиб в обе стороны
        rad = 0.2 if curved else 0.0
        ax.annotate("", xy=pos[v], xytext=pos[u],
                    arrowprops=dict(arrowstyle="-|>", mutation_scale=20, color=col, lw=2,
                                    shrinkA=16, shrinkB=16,
                                    connectionstyle=f"arc3,rad={rad}"))
        ux, uy = pos[u]; vx, vy = pos[v]
        mx, my = (ux + vx) / 2, (uy + vy) / 2
        dx, dy = vx - ux, vy - uy
        L = (dx * dx + dy * dy) ** 0.5 or 1.0
        # перпендикуляр «влево» от направления u→v — сторона изгиба arc3,rad>0
        px, py = -dy / L, dx / L
        off = 0.22 if curved else 0.14
        ax.text(mx + px * off, my + py * off, str(w), color=col, fontsize=11,
                ha="center", va="center", fontweight="bold",
                bbox=dict(boxstyle="round,pad=0.12", fc=BG, ec="none"))
    for n, (x, y) in pos.items():
        c = Circle((x, y), 0.16, fc=node_color.get(n, PANEL), ec=AC, lw=2, zorder=3)
        ax.add_patch(c)
        ax.text(x, y, str(n), color=TX, ha="center", va="center",
                fontsize=12, fontweight="bold", zorder=4)
    ax.set_xlim(-0.5, 1.5); ax.set_ylim(-0.5, 1.5)
    ax.set_aspect("equal"); ax.axis("off")


def _matrix_panel(ax, M, title, changed=None):
    """M: 2D list со значениями или None (=∞). changed: set (i,j) для подсветки."""
    changed = changed or set()
    n = len(M)
    ax.set_xlim(0, n); ax.set_ylim(0, n)
    for i in range(n):
        for j in range(n):
            val = M[i][j]
            fc = HOT if (i, j) in changed else (PANEL if i != j else "#1b2330")
            ax.add_patch(plt.Rectangle((j, n - 1 - i), 1, 1, fc=fc, ec=GRID, lw=1))
            s = INF if val is None else str(val)
            ax.text(j + 0.5, n - 1 - i + 0.5, s, color=TX if (i, j) not in changed else BG,
                    ha="center", va="center", fontsize=11,
                    fontweight="bold" if (i, j) in changed else "normal")
    for k in range(n):
        ax.text(k + 0.5, n + 0.18, str(k + 1), color=TX3, ha="center", fontsize=9)
        ax.text(-0.18, n - 1 - k + 0.5, str(k + 1), color=TX3, va="center", ha="right", fontsize=9)
    ax.set_title(title, fontsize=11, color=TX, pad=14)
    ax.set_aspect("equal"); ax.axis("off")


def build():
    # ── fw_graph: эталонный орграф Флойда–Уоршелла ───────────────────────
    pos = {1: (0, 1), 2: (1, 1), 3: (1, 0), 4: (0, 0)}
    edges = [(1, 2, 3), (1, 4, 7), (2, 1, 8), (2, 3, 2), (3, 1, 5), (3, 4, 1), (4, 1, 2)]
    fig, ax = plt.subplots(figsize=(4.2, 4.2))
    _draw_digraph(ax, pos, edges)
    ax.set_title("Эталонный орграф (Флойд–Уоршелл)", color=TX, fontsize=12)
    save(fig, "fw_graph", QUIZ)

    # ── fw_matrix_steps: D^(0), D^(2), D^(4) ─────────────────────────────
    D0 = [[0, 3, None, 7], [8, 0, 2, None], [5, None, 0, 1], [2, None, None, 0]]
    D2 = [[0, 3, 5, 7], [8, 0, 2, 15], [5, 8, 0, 1], [2, 5, 7, 0]]
    D4 = [[0, 3, 5, 6], [5, 0, 2, 3], [3, 6, 0, 1], [2, 5, 7, 0]]
    ch2 = {(0, 2), (1, 3), (2, 1), (3, 1), (3, 2)}
    ch4 = {(0, 3), (1, 0), (1, 3), (2, 0), (2, 1)}
    fig, axes = plt.subplots(1, 3, figsize=(10.5, 3.7))
    _matrix_panel(axes[0], D0, "$D^{(0)}$ — исходная")
    _matrix_panel(axes[1], D2, "$D^{(2)}$ (через 1,2)", ch2)
    _matrix_panel(axes[2], D4, "$D^{(4)}$ — итог", ch4)
    fig.suptitle("Шаги Флойда–Уоршелла (жёлтым — обновлённые ячейки)", color=TX, fontsize=12)
    save(fig, "fw_matrix_steps", QUIZ)

    # ── mf_network: сеть максимального потока ────────────────────────────
    posf = {"s": (0, 0.5), "a": (1, 1), "b": (1, 0), "t": (2, 0.5)}
    edgesf = [("s", "a", 3), ("s", "b", 2), ("a", "b", 1), ("a", "t", 2), ("b", "t", 3)]
    fig, ax = plt.subplots(figsize=(5.2, 3.6))
    for (u, v, w) in edgesf:
        ax.annotate("", xy=posf[v], xytext=posf[u],
                    arrowprops=dict(arrowstyle="-|>", color=TX3, lw=2, shrinkA=15, shrinkB=15))
        mx, my = (posf[u][0] + posf[v][0]) / 2, (posf[u][1] + posf[v][1]) / 2
        ax.text(mx, my + 0.07, str(w), color=AC, fontsize=11, ha="center", fontweight="bold",
                bbox=dict(boxstyle="round,pad=0.1", fc=BG, ec="none"))
    for n, (x, y) in posf.items():
        fc = OK if n in ("s", "t") else PANEL
        ax.add_patch(Circle((x, y), 0.13, fc=fc, ec=AC, lw=2, zorder=3))
        ax.text(x, y, n, color=TX if n not in ("s", "t") else BG, ha="center", va="center",
                fontsize=12, fontweight="bold", zorder=4)
    ax.set_xlim(-0.4, 2.4); ax.set_ylim(-0.4, 1.4); ax.set_aspect("equal"); ax.axis("off")
    ax.set_title("Сеть потока: |f|max = 5, мин. разрез {s}|{a,b,t} = 5", color=TX, fontsize=11)
    save(fig, "mf_network", QUIZ)

    # ── pm_bipartite: двудольный граф + совершенное паросочетание ────────
    L = {1: (0, 2), 2: (0, 1), 3: (0, 0)}
    R = {"a": (1.4, 2), "b": (1.4, 1), "c": (1.4, 0)}
    be = [(1, "a"), (1, "b"), (2, "a"), (3, "b"), (3, "c")]
    match = {(1, "b"), (2, "a"), (3, "c")}
    fig, ax = plt.subplots(figsize=(4.4, 3.8))
    for (u, v) in be:
        hi = (u, v) in match
        ax.plot([L[u][0], R[v][0]], [L[u][1], R[v][1]],
                color=OK if hi else GRID, lw=3 if hi else 1.5, zorder=1)
    for n, (x, y) in {**L, **R}.items():
        ax.add_patch(Circle((x, y), 0.13, fc=PANEL, ec=AC, lw=2, zorder=3))
        ax.text(x, y, str(n), color=TX, ha="center", va="center", fontsize=12, fontweight="bold", zorder=4)
    ax.set_xlim(-0.4, 1.8); ax.set_ylim(-0.5, 2.5); ax.set_aspect("equal"); ax.axis("off")
    ax.set_title("Совершенное паросочетание (зелёным), |M| = 3", color=TX, fontsize=11)
    save(fig, "pm_bipartite", QUIZ)

    # ── gc_coloring: жадная раскраска по шагам ───────────────────────────
    # Граф C5 (пятиугольник) + хорда → χ=3. Показываем итоговую раскраску.
    Gpos = {0: (0, 1), 1: (0.95, 0.31), 2: (0.59, -0.81), 3: (-0.59, -0.81), 4: (-0.95, 0.31)}
    Gedges = [(0, 1), (1, 2), (2, 3), (3, 4), (4, 0), (0, 2)]
    colors = {0: "#ef4444", 1: "#22c55e", 2: "#3b82f6", 3: "#22c55e", 4: "#3b82f6"}
    fig, ax = plt.subplots(figsize=(4.0, 4.0))
    for (u, v) in Gedges:
        ax.plot([Gpos[u][0], Gpos[v][0]], [Gpos[u][1], Gpos[v][1]], color=TX3, lw=1.6, zorder=1)
    for n, (x, y) in Gpos.items():
        ax.add_patch(Circle((x, y), 0.16, fc=colors[n], ec=TX, lw=1.5, zorder=3))
        ax.text(x, y, str(n + 1), color=BG, ha="center", va="center", fontsize=11, fontweight="bold", zorder=4)
    ax.set_xlim(-1.3, 1.3); ax.set_ylim(-1.2, 1.4); ax.set_aspect("equal"); ax.axis("off")
    ax.set_title("Жадная раскраска: χ(G) = 3", color=TX, fontsize=12)
    save(fig, "gc_coloring", QUIZ)


if __name__ == "__main__":
    build()
