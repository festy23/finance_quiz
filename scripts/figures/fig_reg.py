"""Графики темы «Линейная регрессия»: парная МНК, остатки, ДИ/интервал предсказания."""
import numpy as np
import matplotlib.pyplot as plt
from _style import save, ACCENT, TX3


def build():
    # ── reg_scatter_fit ──────────────────────────────────────────────────────
    # Scatter 6 точек ДЗ4 з.5 + прямая ŷ = 0.100 + 1.986x + точка прогноза (7, 14.0)
    x_data = np.array([1.0, 2.0, 3.0, 4.0, 5.0, 6.0])
    y_data = np.array([2.1, 4.0, 6.1, 8.0, 9.9, 12.1])

    beta0 = 0.100
    beta1 = 1.986

    x_line = np.linspace(0.5, 7.5, 200)
    y_line = beta0 + beta1 * x_line

    fig, ax = plt.subplots(figsize=(6.0, 3.8))
    ax.scatter(x_data, y_data, color=ACCENT, s=60, zorder=5, label="данные")
    ax.plot(x_line, y_line, color="#3b82f6", lw=2, label=r"$\hat y = 0.100 + 1.986x$")
    ax.scatter([7.0], [14.00], color="#f59e0b", s=80, marker="*", zorder=6,
               label=r"прогноз $\hat y(7)=14.00$")
    ax.axvline(7.0, color=TX3, ls=":", lw=1)
    ax.axhline(14.00, color=TX3, ls=":", lw=1)
    ax.set_title(r"Парная МНК: $\hat y = 0.100 + 1.986x$, $n=6$")
    ax.set_xlabel("x")
    ax.set_ylabel("y")
    ax.legend(fontsize=9)
    save(fig, "reg_scatter_fit")

    # ── reg_residuals ────────────────────────────────────────────────────────
    # «Остатки vs предсказанные» — синтетический пример гомоскедастичности
    rng = np.random.default_rng(7)
    n = 40
    x_synth = np.linspace(1, 10, n)
    y_synth = 2.0 * x_synth + 1.0 + rng.normal(0, 1.2, n)
    y_hat_synth = np.polyval(np.polyfit(x_synth, y_synth, 1), x_synth)
    resid = y_synth - y_hat_synth

    fig, ax = plt.subplots(figsize=(6.0, 3.4))
    ax.scatter(y_hat_synth, resid, color=ACCENT, s=40, alpha=0.8)
    ax.axhline(0, color=TX3, ls="--", lw=1.2)
    ax.set_title("Остатки vs предсказанные значения (гомоскедастичность)")
    ax.set_xlabel(r"$\hat y$")
    ax.set_ylabel(r"$e_i = y_i - \hat y_i$")
    save(fig, "reg_residuals")

    # ── reg_ci_pred ──────────────────────────────────────────────────────────
    # Линия регрессии + ДИ среднего отклика + интервал предсказания нового наблюдения
    # Используем данные ДЗ4 з.5 (n=6, beta0=0.1, beta1=1.986)
    n6 = 6
    x6 = np.array([1.0, 2.0, 3.0, 4.0, 5.0, 6.0])
    y6 = np.array([2.1, 4.0, 6.1, 8.0, 9.9, 12.1])
    x6_bar = x6.mean()
    b1 = beta1
    b0 = beta0

    y6_hat = b0 + b1 * x6
    resid6 = y6 - y6_hat
    s2 = np.sum(resid6 ** 2) / (n6 - 2)
    s = np.sqrt(s2)
    Sxx = np.sum((x6 - x6_bar) ** 2)

    x_plot = np.linspace(0.3, 8.0, 300)
    y_plot = b0 + b1 * x_plot

    # t_{0.975, 4} ≈ 2.776
    t_crit = 2.776

    # SE для среднего отклика
    se_mean = s * np.sqrt(1 / n6 + (x_plot - x6_bar) ** 2 / Sxx)
    # SE для нового наблюдения
    se_pred = s * np.sqrt(1 + 1 / n6 + (x_plot - x6_bar) ** 2 / Sxx)

    fig, ax = plt.subplots(figsize=(6.2, 3.8))
    ax.plot(x_plot, y_plot, color="#3b82f6", lw=2, label=r"$\hat y$")
    ax.fill_between(x_plot, y_plot - t_crit * se_mean, y_plot + t_crit * se_mean,
                    alpha=0.35, color="#3b82f6", label="ДИ среднего 95%")
    ax.fill_between(x_plot, y_plot - t_crit * se_pred, y_plot + t_crit * se_pred,
                    alpha=0.18, color="#f59e0b", label="Интервал предсказания 95%")
    ax.scatter(x6, y6, color=ACCENT, s=55, zorder=5)
    ax.set_title("ДИ среднего vs интервал предсказания")
    ax.set_xlabel("x")
    ax.set_ylabel("y")
    ax.legend(fontsize=9)
    save(fig, "reg_ci_pred")


if __name__ == "__main__":
    build()
