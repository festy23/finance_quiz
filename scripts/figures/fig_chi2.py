"""Графики темы «Критерии χ²: согласие, независимость, однородность»."""
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt
from _style import save, ACCENT, TX3, PANEL

ORANGE = "#f97316"
BLUE   = "#3b82f6"
AMBER  = "#f59e0b"
GREEN  = "#22c55e"


def build():
    # ── 1. chi2_density_tail ─────────────────────────────────────────────────
    # Плотности χ²(k) для k=1,2,3; правый хвост > χ²_{0.95}(k) закрашен;
    # вертикальные метки критических значений (3.841, 5.991, 7.815).
    fig, ax = plt.subplots(figsize=(7.5, 3.8))

    configs = [
        (1, "#22c55e", 3.841, r"$\chi^2_{0.95}(1)=3.841$"),
        (2, AMBER,     5.991, r"$\chi^2_{0.95}(2)=5.991$"),
        (3, BLUE,      7.815, r"$\chi^2_{0.95}(3)=7.815$"),
    ]

    x = np.linspace(0.01, 14, 600)
    for k, col, crit, label in configs:
        pdf = stats.chi2.pdf(x, df=k)
        ax.plot(x, pdf, color=col, lw=2.2, label=rf"$\chi^2({k})$")
        # закрасить хвост
        xt = np.linspace(crit, 14, 200)
        ax.fill_between(xt, stats.chi2.pdf(xt, df=k), alpha=0.28, color=col)
        # вертикальная линия критического значения
        ax.axvline(crit, color=col, lw=1.2, ls="--", alpha=0.7)
        ax.text(crit + 0.15, stats.chi2.pdf(crit, df=k) + 0.005,
                label, color=col, fontsize=8, va="bottom")

    ax.set_xlim(0, 14)
    ax.set_ylim(bottom=0)
    ax.set_title(r"Плотности $\chi^2_k$: правый хвост $\alpha=0.05$")
    ax.set_xlabel(r"$\chi^2$")
    ax.set_ylabel(r"$f(x)$")
    ax.legend(fontsize=9, loc="upper right")
    save(fig, "chi2_density_tail")

    # ── 2. chi2_obs_exp ──────────────────────────────────────────────────────
    # Сдвоенная столбчатая диаграмма «наблюдаемые vs ожидаемые»
    # для задачи о кости: O=[3,18,7,15,5,12], E=10 для каждой грани
    faces = np.arange(1, 7)
    O = np.array([3, 18, 7, 15, 5, 12])
    E = np.full(6, 10.0)

    chi2_val = np.sum((O - E) ** 2 / E)   # = 17.6

    fig, ax = plt.subplots(figsize=(7.5, 3.8))
    width = 0.36
    x_pos = np.arange(len(faces))

    bars_o = ax.bar(x_pos - width / 2, O, width, color=ORANGE, label=r"Наблюдаемые $O_i$",
                    edgecolor="#000", linewidth=0.5, alpha=0.9)
    bars_e = ax.bar(x_pos + width / 2, E, width, color=TX3, label=r"Ожидаемые $E_i=10$",
                    edgecolor="#000", linewidth=0.5, alpha=0.75)

    # подписи значений над столбцами O
    for bar, val in zip(bars_o, O):
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.3,
                str(val), ha="center", va="bottom", fontsize=9, color="#c9d1e0")

    ax.set_xticks(x_pos)
    ax.set_xticklabels([f"Грань {f}" for f in faces])
    ax.set_ylabel("Частота")
    ax.set_title(
        rf"Кость: наблюдаемые vs ожидаемые  "
        rf"($\chi^2={chi2_val:.1f} > 11.07$, $df=5$, $\alpha=0.05$)"
    )
    ax.legend(fontsize=9)
    save(fig, "chi2_obs_exp")

    # ── 3. chi2_contingency ──────────────────────────────────────────────────
    # Heatmap 2×2 таблицы сопряжённости «ветер × давление» с ожидаемыми
    # частотами в ячейках (задача о независимости, χ²≈0.667 < 3.841)
    # Наблюдаемые: [[28,22],[32,18]] (n=100)
    obs = np.array([[28, 22], [30, 20]])  # row sums 50,50; col sums 58,42
    # Пересчитаем ожидаемые E_{ij} = n_{i.} * n_{.j} / n
    n = obs.sum()
    row_sums = obs.sum(axis=1, keepdims=True)
    col_sums = obs.sum(axis=0, keepdims=True)
    expected = (row_sums * col_sums) / n
    chi2_indep = np.sum((obs - expected) ** 2 / expected)

    row_labels = ["Сильный ветер", "Слабый ветер"]
    col_labels = ["Высокое\nдавление", "Низкое\nдавление"]

    fig, axes = plt.subplots(1, 2, figsize=(8.5, 3.4))
    for ax_idx, (data, title) in enumerate(
        [(obs.astype(float), "Наблюдаемые $O_{ij}$"),
         (expected, "Ожидаемые $E_{ij}$")]
    ):
        ax2 = axes[ax_idx]
        vmin, vmax = 10, 40
        im = ax2.imshow(data, cmap="YlOrRd", vmin=vmin, vmax=vmax, aspect="auto")
        ax2.set_xticks([0, 1]); ax2.set_xticklabels(col_labels, fontsize=9)
        ax2.set_yticks([0, 1]); ax2.set_yticklabels(row_labels, fontsize=9)
        ax2.set_title(title, fontsize=10)
        for i in range(2):
            for j in range(2):
                val = data[i, j]
                ax2.text(j, i, f"{val:.1f}", ha="center", va="center",
                         fontsize=12, color="#0b0d12", fontweight="bold")
        fig.colorbar(im, ax=ax2, fraction=0.046, pad=0.04)

    fig.suptitle(
        rf"Таблица сопряжённости «ветер × давление»  "
        rf"($\chi^2\approx{chi2_indep:.3f} < 3.841$, не отвергаем $H_0$)",
        fontsize=10, y=1.02
    )
    save(fig, "chi2_contingency")


if __name__ == "__main__":
    build()
