"""Демо-фигура: плотность нормального распределения. Проверяет, что пайплайн работает."""
import numpy as np
from scipy import stats
from _style import save, ACCENT
import matplotlib.pyplot as plt

def build():
    x = np.linspace(-4, 4, 400)
    fig, ax = plt.subplots(figsize=(5.2, 2.8))
    ax.plot(x, stats.norm.pdf(x), color=ACCENT, lw=2)
    ax.fill_between(x, stats.norm.pdf(x), where=(np.abs(x) <= 1), color=ACCENT, alpha=0.18)
    ax.set_title("Нормальная плотность, ±1σ")
    ax.set_xlabel("x"); ax.set_ylabel("f(x)")
    save(fig, "demo_normal")

if __name__ == "__main__":
    build()
