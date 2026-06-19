"""Графики темы «Проверка гипотез: Нейман–Пирсон, ошибки, мощность, мин. n»."""
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from _style import save, ACCENT, TX3

BLUE   = "#3b82f6"
RED    = "#ef4444"
AMBER  = "#f59e0b"
PURPLE = "#a855f7"


def build():
    # ── 1. ht_errors: ошибки I и II рода ────────────────────────────────────
    # Два перекрывающихся нормальных распределения; α-хвост слева/справа,
    # β-область под кривой H₁ до критического значения.
    fig, ax = plt.subplots(figsize=(8.0, 3.8))

    mu0, mu1, sigma = 0.0, 2.5, 1.0
    c = mu0 + 1.645 * sigma       # критическое значение α=0.05 (правосторонний)
    x = np.linspace(-3.5, 6.5, 600)
    y0 = stats.norm.pdf(x, mu0, sigma)
    y1 = stats.norm.pdf(x, mu1, sigma)

    ax.plot(x, y0, color=BLUE,  lw=2.0, label=r"$H_0$: $\mu=0$")
    ax.plot(x, y1, color=ACCENT, lw=2.0, label=r"$H_1$: $\mu=2.5$")

    # α — критическая область (правый хвост H₀)
    mask_a = x >= c
    ax.fill_between(x[mask_a], y0[mask_a], color=RED, alpha=0.40, label=r"$\alpha$ (ошибка I)")

    # β — область принятия H₀ при истинной H₁
    mask_b = x < c
    ax.fill_between(x[mask_b], y1[mask_b], color=AMBER, alpha=0.40, label=r"$\beta$ (ошибка II)")

    ax.axvline(c, color=TX3, lw=1.2, ls="--")
    ax.text(c + 0.08, ax.get_ylim()[1] * 0.82, f"$c={c:.2f}$", color=TX3, fontsize=9)
    ax.set_xlabel("$x$")
    ax.set_ylabel("$f(x)$")
    ax.set_title(r"Ошибки I ($\alpha$) и II ($\beta$) рода при $n=1$, $\sigma=1$")
    ax.legend(fontsize=9, loc="upper right")
    save(fig, "ht_errors")

    # ── 2. ht_power_curve: функция мощности Z-критерия (правосторонний) ─────
    # W(μ₁) = 1 − Φ(z_{0.95} − (μ₁−μ₀)·√n/σ)
    fig, ax = plt.subplots(figsize=(7.0, 3.8))

    n_vals = [10, 25, 50]
    colors = [ACCENT, BLUE, PURPLE]
    mu_range = np.linspace(-1.0, 3.5, 400)
    z_alpha = 1.645   # α=0.05, правосторонний

    for n, col in zip(n_vals, colors):
        W = 1 - stats.norm.cdf(z_alpha - (mu_range - mu0) * np.sqrt(n) / sigma)
        ax.plot(mu_range, W, color=col, lw=2, label=f"$n={n}$")

    ax.axhline(0.05, color=TX3, lw=0.9, ls=":", label=r"$\alpha=0.05$")
    ax.axhline(0.90, color=AMBER, lw=0.9, ls=":", label="$W=0.90$")
    ax.axvline(mu0,  color=TX3, lw=0.9, ls="--")
    ax.set_xlabel(r"$\mu_1$")
    ax.set_ylabel(r"$W(\mu_1)$")
    ax.set_title(r"Функция мощности $W(\mu_1)$ при $\mu_0=0$, $\sigma=1$, $\alpha=0.05$")
    ax.set_ylim(-0.05, 1.08)
    ax.legend(fontsize=9)
    save(fig, "ht_power_curve")

    # ── 3. ht_nmin_power: мощность как функция n при фиксированном δ ─────────
    fig, ax = plt.subplots(figsize=(7.0, 3.8))

    deltas = [0.5, 1.0, 2.0]
    cols   = [BLUE, ACCENT, PURPLE]
    n_arr  = np.arange(1, 101)

    for delta, col in zip(deltas, cols):
        W_arr = 1 - stats.norm.cdf(z_alpha - delta * np.sqrt(n_arr) / sigma)
        ax.plot(n_arr, W_arr, color=col, lw=2, label=fr"$\delta={delta}$")

    ax.axhline(0.90, color=AMBER, lw=1.2, ls="--", label="$W=0.90$")

    # Отметить n_min=16 для δ=1 (из плана задачи)
    n_min_ex = 16
    W_at16 = 1 - stats.norm.cdf(z_alpha - 1.0 * np.sqrt(n_min_ex) / sigma)
    ax.scatter([n_min_ex], [W_at16], color=ACCENT, zorder=5, s=60)
    ax.annotate(f"$n_{{\\min}}={n_min_ex}$, $W\\approx{W_at16:.2f}$",
                xy=(n_min_ex, W_at16), xytext=(n_min_ex + 5, W_at16 - 0.12),
                color=ACCENT, fontsize=9, arrowprops=dict(arrowstyle="->", color=ACCENT, lw=0.9))

    ax.set_xlabel("$n$")
    ax.set_ylabel(r"$W(n)$")
    ax.set_title(r"Мощность $W(n)$ при $\mu_0=0$, $\sigma=1$, $\alpha=0.05$ (правосторонний)")
    ax.set_ylim(-0.05, 1.08)
    ax.legend(fontsize=9)
    save(fig, "ht_nmin_power")

    # ── 4. ht_t_dist: иллюстрация Z-критерия на примере из задачи ────────────
    # X̄=0.153, n=100, σ=1 → Z=1.53. Показываем N(0,1), критические области ±1.96, Z_набл.
    fig, ax = plt.subplots(figsize=(7.5, 3.8))

    z_obs  = 1.53
    z_crit = 1.96
    x = np.linspace(-4.5, 4.5, 600)
    y = stats.norm.pdf(x, 0, 1)

    ax.plot(x, y, color=BLUE, lw=2, label="$N(0,1)$ при $H_0$")

    # Критические области (двусторонний α=0.05)
    mask_r = x >= z_crit
    mask_l = x <= -z_crit
    ax.fill_between(x[mask_r], y[mask_r], color=RED, alpha=0.45, label=r"$\alpha/2$ (пр.)")
    ax.fill_between(x[mask_l], y[mask_l], color=RED, alpha=0.45, label=r"$\alpha/2$ (лев.)")

    ax.axvline( z_crit, color=RED,   lw=1.2, ls="--")
    ax.axvline(-z_crit, color=RED,   lw=1.2, ls="--")
    ax.axvline( z_obs,  color=ACCENT, lw=1.8, ls="-", label=f"$Z_{{\\text{{набл}}}}={z_obs}$")

    ax.text( z_crit + 0.05, 0.33,  "$z_{0.975}=1.96$", color=RED,   fontsize=8.5)
    ax.text(-z_crit - 0.05, 0.33, "$-1.96$",            color=RED,   fontsize=8.5, ha="right")
    ax.text( z_obs  + 0.05, 0.25,  f"$Z={z_obs}$",      color=ACCENT, fontsize=9)
    ax.text(0, 0.05, "Не отвергаем $H_0$", ha="center", color=TX3, fontsize=9)

    ax.set_xlabel("$Z$")
    ax.set_ylabel("$\\varphi(z)$")
    ax.set_title(r"Z-критерий: $\bar{X}=0.153$, $n=100$, $\sigma=1$, $\alpha=0.05$")
    ax.legend(fontsize=9, loc="upper left")
    save(fig, "ht_t_dist")


if __name__ == "__main__":
    build()
