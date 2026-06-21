"""Единый тёмный стиль графиков под тему приложения. Все fig_*.py импортируют save()."""
import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

FIG_ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "public", "figures")
OUT_DIR = os.path.join(FIG_ROOT, "matstat")

BG = "#0b0d12"
PANEL = "#13151b"
TX = "#c9d1e0"
TX3 = "#7a8499"
ACCENT = "#22c55e"
GRID = "#262a33"

plt.rcParams.update({
    "figure.facecolor": BG,
    "axes.facecolor": PANEL,
    "savefig.facecolor": BG,
    "text.color": TX,
    "axes.labelcolor": TX,
    "axes.edgecolor": GRID,
    "xtick.color": TX3,
    "ytick.color": TX3,
    "grid.color": GRID,
    "axes.grid": True,
    "grid.alpha": 0.5,
    "font.size": 11,
    "axes.titlesize": 12,
    "figure.dpi": 110,
    "svg.fonttype": "path",  # текст как кривые — рендер одинаков без шрифтов
})

def save(fig, name, quiz="matstat"):
    """Сохранить fig в public/figures/<quiz>/<name>.svg."""
    out_dir = os.path.join(FIG_ROOT, quiz)
    os.makedirs(out_dir, exist_ok=True)
    path = os.path.join(out_dir, name + ".svg")
    fig.tight_layout()
    fig.savefig(path, format="svg", bbox_inches="tight")
    plt.close(fig)
    print("wrote", os.path.relpath(path))
    return path
