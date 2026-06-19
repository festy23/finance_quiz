"""Графики темы «Точечное оценивание» (ММ и ММП)."""
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt
from _style import save, ACCENT, TX3

def build():
    # est_order_uniform — плотности минимума f_(1) и максимума f_(n) для U[theta1, theta2],
    # theta1=0, theta2=1, разные n (сходимость ОМП к границам).
    x = np.linspace(-0.05, 1.05, 600)
    fig, axes = plt.subplots(1, 2, figsize=(9.0, 3.2))

    colors = ["#a855f7", "#8b5cf6", "#7c3aed"]
    ns = [5, 10, 30]

    ax = axes[0]
    for n, c in zip(ns, colors):
        # Плотность минимума X_(1) для U[0,1]: f_(1)(x) = n*(1-x)^(n-1) на [0,1]
        y = np.where((x >= 0) & (x <= 1), n * (1 - x) ** (n - 1), 0.0)
        ax.plot(x, y, color=c, lw=2, label=f"n={n}")
    ax.set_title(r"Плотность минимума $X_{(1)}$, $U[0,1]$")
    ax.set_xlabel("x")
    ax.set_ylabel(r"$f_{(1)}(x)$")
    ax.set_xlim(-0.05, 1.05)
    ax.legend(fontsize=9)

    ax = axes[1]
    for n, c in zip(ns, colors):
        # Плотность максимума X_(n) для U[0,1]: f_(n)(x) = n*x^(n-1) на [0,1]
        y = np.where((x >= 0) & (x <= 1), n * x ** (n - 1), 0.0)
        ax.plot(x, y, color=c, lw=2, label=f"n={n}")
    ax.set_title(r"Плотность максимума $X_{(n)}$ (ОМП $\hat\theta^{ML}$), $U[0,1]$")
    ax.set_xlabel("x")
    ax.set_ylabel(r"$f_{(n)}(x)$")
    ax.set_xlim(-0.05, 1.05)
    ax.legend(fontsize=9)

    save(fig, "est_order_uniform")

    # est_mm_vs_ml — сравнение оценок theta для U[0, theta=1] методами ММ и ММП,
    # n=20, Монте-Карло (1000 реализаций). hat_theta^MM = 2*Xbar, hat_theta^ML = X_(n).
    rng = np.random.default_rng(42)
    theta_true = 1.0
    n = 20
    B = 2000
    samples = rng.uniform(0, theta_true, size=(B, n))
    theta_mm = 2 * samples.mean(axis=1)   # ММ: M[X]=theta/2 => hat_theta = 2*Xbar
    theta_ml = samples.max(axis=1)         # ММП: X_(n)

    fig, ax = plt.subplots(figsize=(6.0, 3.4))
    bins = np.linspace(0.3, 1.5, 60)
    ax.hist(theta_mm, bins=bins, density=True, alpha=0.55, color=ACCENT,    label=r"$\hat\theta^{MM}=2\bar X$")
    ax.hist(theta_ml, bins=bins, density=True, alpha=0.55, color="#a855f7", label=r"$\hat\theta^{ML}=X_{(n)}$")
    ax.axvline(theta_true, color=TX3, ls="--", lw=1.5, label=r"истинное $\theta=1$")
    ax.set_title(r"Оценки $\theta$ для $U[0,\theta]$, $n=20$ (Монте-Карло, 2000 выборок)")
    ax.set_xlabel(r"$\hat\theta$")
    ax.set_ylabel("плотность")
    ax.legend(fontsize=9)
    save(fig, "est_mm_vs_ml")


if __name__ == "__main__":
    build()
