"""Графики темы «Доверительные интервалы» (ci).

SVG: ci_z_vs_t, ci_chi2_var, ci_prop_width, ci_len_vs_n
"""
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt
from _style import save, ACCENT, TX3


def build():
    # ------------------------------------------------------------------
    # 1. ci_z_vs_t — ширина Z-ДИ vs t-ДИ как функция n
    # ------------------------------------------------------------------
    ns = np.arange(5, 201)
    sigma = 1.0
    alpha = 0.05  # gamma = 0.95

    z_half = stats.norm.ppf(0.975)           # 1.96
    t_half = np.array([stats.t.ppf(0.975, df=n - 1) for n in ns])

    width_z = 2 * z_half * sigma / np.sqrt(ns)
    width_t = 2 * t_half * sigma / np.sqrt(ns)

    fig, ax = plt.subplots(figsize=(6.0, 3.2))
    ax.plot(ns, width_z, color=ACCENT, lw=2, label=r"Z-ДИ ($\sigma$ известна)")
    ax.plot(ns, width_t, color="#f59e0b", lw=2, label=r"t-ДИ ($\sigma$ неизв., S=1)")
    ax.axhline(0, color=TX3, lw=0.6, ls="--")
    ax.set_title(r"Ширина ДИ для МО: Z vs t, $\gamma=0.95$, $\sigma=1$")
    ax.set_xlabel("n")
    ax.set_ylabel("ширина ДИ")
    ax.legend(fontsize=9)
    save(fig, "ci_z_vs_t")

    # ------------------------------------------------------------------
    # 2. ci_chi2_var — плотность χ²(14) с хвостами по 2.5%, квантили
    # ------------------------------------------------------------------
    df = 14
    x = np.linspace(0, 40, 500)
    pdf = stats.chi2.pdf(x, df)
    lo = stats.chi2.ppf(0.025, df)   # ≈5.629
    hi = stats.chi2.ppf(0.975, df)   # ≈26.119

    fig, ax = plt.subplots(figsize=(6.0, 3.2))
    ax.plot(x, pdf, color=ACCENT, lw=2)
    # left tail
    xL = x[x <= lo]
    ax.fill_between(xL, stats.chi2.pdf(xL, df), color="#ef4444", alpha=0.45, label=r"$\alpha/2=2.5\%$")
    # right tail
    xR = x[x >= hi]
    ax.fill_between(xR, stats.chi2.pdf(xR, df), color="#ef4444", alpha=0.45)
    ax.axvline(lo, color="#ef4444", lw=1.5, ls="--")
    ax.axvline(hi, color="#ef4444", lw=1.5, ls="--")
    ax.text(lo - 0.5, max(pdf) * 0.55, f"{lo:.2f}", ha="right", fontsize=9, color="#ef4444")
    ax.text(hi + 0.5, max(pdf) * 0.55, f"{hi:.2f}", ha="left", fontsize=9, color="#ef4444")
    ax.set_title(r"$\chi^2(14)$: квантили для ДИ дисперсии ($\gamma=0.95$)")
    ax.set_xlabel(r"$\chi^2$")
    ax.set_ylabel("плотность")
    ax.legend(fontsize=9)
    save(fig, "ci_chi2_var")

    # ------------------------------------------------------------------
    # 3. ci_prop_width — ширина ДИ для доли как функция p-hat
    # ------------------------------------------------------------------
    p_hat = np.linspace(0, 1, 300)
    z = stats.norm.ppf(0.975)  # 1.96

    fig, ax = plt.subplots(figsize=(6.0, 3.2))
    colors = [ACCENT, "#f59e0b", "#3b82f6"]
    for n_val, col in zip([100, 500, 2000], colors):
        width = 2 * z * np.sqrt(p_hat * (1 - p_hat) / n_val)
        ax.plot(p_hat, width, color=col, lw=2, label=f"n={n_val}")
    ax.axvline(0.5, color=TX3, lw=1, ls="--", alpha=0.7)
    ax.set_title(r"Ширина ДИ для доли $\hat p$, $\gamma=0.95$")
    ax.set_xlabel(r"$\hat p$")
    ax.set_ylabel(r"$2z\sqrt{\hat p(1-\hat p)/n}$")
    ax.legend(fontsize=9)
    save(fig, "ci_prop_width")

    # ------------------------------------------------------------------
    # 4. ci_len_vs_n — длина ДИ для МО (σ=2) vs n, с n_min=2629
    # ------------------------------------------------------------------
    ns2 = np.arange(10, 5000)
    sigma2 = 2.0     # sigma=sqrt(4)=2 из задачи ДЗ2
    gamma = 0.8
    z_08 = stats.norm.ppf(0.9)   # z_{0.9} ≈ 1.282 (одностор.), но для 0.8 ДИ используем z_{0.9}
    # Уточняем: gamma=0.8 → z_{1-alpha/2}=z_{0.9} ≈ 1.282
    eps_target = 0.05   # целевая полуширина → n_min = (z*sigma/eps)^2
    # По задаче: n_min=2629, проверяем: (1.282*2/0.1)^2 ≈ 657, нет.
    # Из ДЗ: gamma=0.8, sigma=2, n_min=2629 → eps=(z*sigma)/sqrt(n_min)
    # => eps = 1.282*2/sqrt(2629) ≈ 0.05
    # Длина ДИ = 2*eps = 2*z*sigma/sqrt(n)
    len_ci = 2 * z_08 * sigma2 / np.sqrt(ns2)
    n_min = 2629
    len_at_nmin = 2 * z_08 * sigma2 / np.sqrt(n_min)

    fig, ax = plt.subplots(figsize=(6.0, 3.2))
    ax.plot(ns2, len_ci, color=ACCENT, lw=2, label=r"$2z_{0.9}\sigma/\sqrt{n}$, $\sigma=2$")
    ax.axhline(len_at_nmin, color="#ef4444", lw=1.5, ls="--",
               label=f"цель ≈{len_at_nmin:.3f}")
    ax.axvline(n_min, color="#f59e0b", lw=1.5, ls="--", label=f"$n_{{\\min}}={n_min}$")
    ax.scatter([n_min], [len_at_nmin], color="#f59e0b", s=60, zorder=5)
    ax.set_title(r"Длина ДИ для МО ($\gamma=0.8$, $\sigma=2$) vs $n$")
    ax.set_xlabel("n")
    ax.set_ylabel("длина ДИ")
    ax.set_xlim(0, 5000)
    ax.legend(fontsize=8)
    save(fig, "ci_len_vs_n")


if __name__ == "__main__":
    build()
