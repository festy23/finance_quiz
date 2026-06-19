"""Графики темы «Свойства оценок»: смещение s² vs S², эффективность Рао–Крамера (Лаплас)."""
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt
from _style import save, ACCENT, TX3


def build():
    rng = np.random.default_rng(42)

    # ── props_bias_s2 ────────────────────────────────────────────────────────
    # Монте-Карло: гистограммы s² и S² при σ²=1, n=10; вертикали M s² и M S²=1
    n = 10
    sigma2 = 1.0
    M = 20_000
    samples = rng.normal(0, 1, size=(M, n))  # σ²=1
    s2_vals = samples.var(axis=1, ddof=0)   # делитель n (смещённая)
    S2_vals = samples.var(axis=1, ddof=1)   # делитель n-1 (несмещённая)

    fig, ax = plt.subplots(figsize=(5.6, 3.2))
    bins = np.linspace(0, 2.8, 55)
    ax.hist(s2_vals, bins=bins, alpha=0.55, color=TX3,    label=r"$s^2$ (делитель $n$)")
    ax.hist(S2_vals, bins=bins, alpha=0.55, color=ACCENT, label=r"$S^2$ (делитель $n{-}1$)")
    ms2 = (n - 1) / n  # = 0.9
    ax.axvline(ms2, color=TX3,    ls="--", lw=1.6, label=rf"$\mathrm{{M}}s^2={ms2:.2f}$")
    ax.axvline(1.0,  color=ACCENT, ls="--", lw=1.6, label=r"$\mathrm{M}S^2=1$")
    ax.set_title(r"Смещение $s^2$ vs несмещённость $S^2$, $\sigma^2=1$, $n=10$")
    ax.set_xlabel("значение оценки")
    ax.set_ylabel("частота")
    ax.legend(fontsize=9)
    save(fig, "props_bias_s2")

    # ── props_efficiency ─────────────────────────────────────────────────────
    # Лаплас f = (1/2λ)exp(-|x-θ|/λ): I(θ) = 1/λ², граница = λ²/n
    # D(x̄) = D_X / n = 2λ²/n  (у Лапласа дисперсия 2λ²)
    # Сравниваем две кривые как функцию n
    ns = np.arange(2, 101)
    lam = 1.0  # λ
    rao_cramer = lam**2 / ns          # 1/(n·I) = λ²/n
    var_mean   = 2 * lam**2 / ns      # D(X̄) = 2λ²/n

    fig, ax = plt.subplots(figsize=(5.6, 3.2))
    ax.plot(ns, var_mean,   color=TX3,    lw=2,   label=r"$\mathrm{D}\bar{X}=2\lambda^2/n$")
    ax.plot(ns, rao_cramer, color=ACCENT, lw=2,   label=r"Граница Рао–Крамера $\lambda^2/n$")
    ax.fill_between(ns, rao_cramer, var_mean, color=ACCENT, alpha=0.10,
                    label="«лишняя» дисперсия ×2")
    ax.set_title(r"Эффективность $\bar{X}$ (Лаплас, $\lambda=1$)")
    ax.set_xlabel("$n$")
    ax.set_ylabel(r"$\mathrm{D}\hat\theta$")
    ax.legend(fontsize=9)
    save(fig, "props_efficiency")


if __name__ == "__main__":
    build()
