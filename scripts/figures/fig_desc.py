"""Графики темы «Описательная статистика и ЭФР»."""
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt
from _style import save, ACCENT, TX3

COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#a855f7", "#ef4444"]


def build():
    # ── 1. desc_polygon_hist ──────────────────────────────────────────────────
    # Полигон частот и столбчатая гистограмма для дискретной выборки
    # x ∈ {7,8,9,10,11}, n_i={5,6,6,6,1}, n=24
    vals = np.array([7, 8, 9, 10, 11])
    ni   = np.array([5, 6, 6, 6, 1])
    wi   = ni / ni.sum()

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9.0, 3.2))

    # Гистограмма (столбцы)
    ax1.bar(vals, wi, width=0.7, color=ACCENT, alpha=0.75, edgecolor="#000",
            linewidth=0.6, label="$w_i = n_i/n$")
    ax1.set_title("Гистограмма относительных частот")
    ax1.set_xlabel("$x$"); ax1.set_ylabel("$w_i$")
    ax1.set_xticks(vals)
    ax1.legend(fontsize=9)

    # Полигон частот
    ax2.plot(vals, wi, color=ACCENT, lw=2, marker="o", markersize=6, label="$w_i$")
    ax2.fill_between(vals, wi, alpha=0.18, color=ACCENT)
    ax2.set_title("Полигон относительных частот")
    ax2.set_xlabel("$x$"); ax2.set_ylabel("$w_i$")
    ax2.set_xticks(vals)
    ax2.legend(fontsize=9)

    save(fig, "desc_polygon_hist")

    # ── 2. desc_ecdf ─────────────────────────────────────────────────────────
    # Ступенчатая ЭФР F_n*(x) для выборки Exp(1), n=24, поверх теоретической
    rng  = np.random.default_rng(42)
    data = np.sort(rng.exponential(1.0, 24))

    x_plot = np.linspace(0, 4.5, 600)
    F_th   = 1 - np.exp(-x_plot)

    fig, ax = plt.subplots(figsize=(6.0, 3.4))
    # Теоретическая
    ax.plot(x_plot, F_th, color=TX3, lw=1.5, ls="--", label=r"$F(x)=1-e^{-x}$")
    # ЭФР (ступенчатая)
    n = len(data)
    x_ecdf = np.repeat(np.concatenate([[data[0] - 0.3], data]), 2)[1:]
    y_ecdf = np.repeat(np.arange(0, n + 1) / n, 2)[:-1]
    ax.step(np.concatenate([[0], data, [data[-1] + 0.3]]),
            np.concatenate([[0], np.arange(1, n + 1) / n, [1.0]]),
            where="post", color=ACCENT, lw=2, label=r"$F_n^*(x)$, $n=24$")
    # Вертикаль x=1
    f1 = 1 - np.exp(-1)
    ax.axvline(1.0, color="#f59e0b", lw=1.2, ls=":")
    ax.annotate(f"$F(1)\\approx{f1:.3f}$", xy=(1.0, f1),
                xytext=(1.6, f1 - 0.08), color="#f59e0b", fontsize=9,
                arrowprops=dict(arrowstyle="->", color="#f59e0b", lw=0.9))
    ax.set_title(r"ЭФР vs теоретическая $F(x)$, $\mathrm{Exp}(1)$, $n=24$")
    ax.set_xlabel("$x$"); ax.set_ylabel("$F(x)$")
    ax.legend(fontsize=9)
    save(fig, "desc_ecdf")

    # ── 3. desc_ecdf_convergence ──────────────────────────────────────────────
    # Несколько реализаций F_n* при n=20,100,500 для Exp(1)
    fig, ax = plt.subplots(figsize=(6.5, 3.5))
    ax.plot(x_plot, F_th, color=TX3, lw=1.8, ls="--", label=r"$F(x)=1-e^{-x}$", zorder=5)

    configs = [(20, "#22c55e", 0.65), (100, "#3b82f6", 0.75), (500, "#f59e0b", 0.9)]
    for n_s, col, alpha in configs:
        sample = np.sort(rng.exponential(1.0, n_s))
        ax.step(np.concatenate([[0], sample, [sample[-1] + 0.2]]),
                np.concatenate([[0], np.arange(1, n_s + 1) / n_s, [1.0]]),
                where="post", color=col, lw=1.4, alpha=alpha, label=f"$n={n_s}$")

    ax.set_title(r"Сходимость $F_n^*\to F$: $\mathrm{Exp}(1)$")
    ax.set_xlabel("$x$"); ax.set_ylabel(r"$F_n^*(x)$")
    ax.legend(fontsize=9)
    save(fig, "desc_ecdf_convergence")

    # ── 4. desc_hist_widths ───────────────────────────────────────────────────
    # Две гистограммы одних данных при Δ=2.5 и Δ=5
    rng2  = np.random.default_rng(7)
    data2 = rng2.normal(loc=15, scale=4, size=120)

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9.0, 3.2))
    # Δ=2.5
    bins25 = np.arange(data2.min() - 1, data2.max() + 2.5, 2.5)
    ax1.hist(data2, bins=bins25, density=True, color=ACCENT, alpha=0.75,
             edgecolor="#000", linewidth=0.5)
    ax1.set_title(r"Гистограмма, $\Delta=2.5$")
    ax1.set_xlabel("$x$"); ax1.set_ylabel(r"$h_i = w_i/\Delta$")

    # Δ=5
    bins5 = np.arange(data2.min() - 1, data2.max() + 5, 5)
    ax2.hist(data2, bins=bins5, density=True, color="#3b82f6", alpha=0.75,
             edgecolor="#000", linewidth=0.5)
    ax2.set_title(r"Гистограмма, $\Delta=5$")
    ax2.set_xlabel("$x$"); ax2.set_ylabel(r"$h_i = w_i/\Delta$")

    save(fig, "desc_hist_widths")


if __name__ == "__main__":
    build()
