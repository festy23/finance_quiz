"""Графики темы «Порядковые статистики»."""
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt
from _style import save, ACCENT, TX3

def build():
    # order_min_density: плотность минимума X_(1) для U[0,1], разные n
    x = np.linspace(0, 1, 400)
    fig, ax = plt.subplots(figsize=(5.4, 3.0))
    for n in (2, 5, 10, 20):
        ax.plot(x, n * (1 - x) ** (n - 1), lw=2, label=f"n={n}")
    ax.set_title(r"Плотность минимума $X_{(1)}$, $U[0,1]$")
    ax.set_xlabel("x"); ax.set_ylabel(r"$f_{(1)}(x)$"); ax.legend()
    save(fig, "order_min_density")

    # order_cdf_k: ФР k-й порядковой статистики для U[0,1], n=10
    fig, ax = plt.subplots(figsize=(5.4, 3.0))
    n = 10
    for k in (1, 3, 5, 7, 10):
        cdf = stats.binom.sf(k - 1, n, x)  # P(Bin(n,x) >= k)
        ax.plot(x, cdf, lw=2, label=f"k={k}")
    ax.plot(x, x, ls="--", color=TX3, lw=1, label="F=x")
    ax.set_title(r"ФР порядковой статистики $X_{(k)}$, $U[0,1]$, $n=10$")
    ax.set_xlabel("x"); ax.set_ylabel(r"$F_{(k)}(x)$"); ax.legend(fontsize=8)
    save(fig, "order_cdf_k")

    # order_max_uniform: ФР максимума (x/θ)^n, θ=1 — состоятельность оценки
    fig, ax = plt.subplots(figsize=(5.4, 3.0))
    for n in (5, 10, 20, 50):
        ax.plot(x, x ** n, lw=2, label=f"n={n}")
    ax.set_title(r"ФР максимума $X_{(n)}$, $U[0,\theta]$, $\theta=1$")
    ax.set_xlabel("x"); ax.set_ylabel(r"$F_{(n)}(x)$"); ax.legend()
    save(fig, "order_max_uniform")

if __name__ == "__main__":
    build()
