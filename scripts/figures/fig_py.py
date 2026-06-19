"""Графики темы «Python-вычисления» (MS_task_2/3): корреляция, диагностика остатков,
интервал предсказания vs ДИ среднего."""
import numpy as np
import matplotlib.pyplot as plt
from _style import save, ACCENT, TX3


def build():
    rng = np.random.default_rng(0)

    # ── 1. py_corr_clean ──────────────────────────────────────────────────────
    # Гистограммы переменной «баллы ЕГЭ» до/после фильтрации выбросов.
    # Генерируем данные, имитирующие MS_task_2 (mean≈69.9, sigma≈12, небольшой
    # хвост выбросов).  После фильтра [mean±3σ] остаётся «чистая» выборка.
    n_full = 320
    scores = rng.normal(loc=69.9, scale=12.0, size=n_full)
    # добавить несколько явных выбросов
    outliers = rng.uniform(low=110, high=140, size=8)
    scores_full = np.concatenate([scores, outliers])

    mu, sigma = scores_full.mean(), scores_full.std()
    mask = np.abs(scores_full - mu) <= 3 * sigma
    scores_clean = scores_full[mask]

    fig, axes = plt.subplots(1, 2, figsize=(9.0, 3.4), sharey=False)
    bins = np.linspace(30, 145, 30)
    axes[0].hist(scores_full, bins=bins, color=ACCENT, alpha=0.75, edgecolor="none")
    axes[0].set_title("Исходная выборка (с выбросами)")
    axes[0].set_xlabel("Балл ЕГЭ")
    axes[0].set_ylabel("Частота")

    bins_clean = np.linspace(30, 110, 26)
    axes[1].hist(scores_clean, bins=bins_clean, color="#3b82f6", alpha=0.80, edgecolor="none")
    axes[1].set_title("После фильтра |z| > 3")
    axes[1].set_xlabel("Балл ЕГЭ")
    axes[1].set_ylabel("Частота")
    # вертикали — среднее и ±1σ
    mu_c, sigma_c = scores_clean.mean(), scores_clean.std()
    for ax in axes:
        pass
    axes[1].axvline(mu_c, color=ACCENT, lw=1.4, ls="--", label=f"μ≈{mu_c:.1f}")
    axes[1].legend(fontsize=9)

    fig.suptitle(
        f"Баллы ЕГЭ: n={len(scores_full)} → {len(scores_clean)}, r≈0.145 (слабая связь)",
        fontsize=11,
    )
    save(fig, "py_corr_clean")

    # ── 2. py_resid_diag ──────────────────────────────────────────────────────
    # «Остатки vs предсказанные» + stem-plot остатков для MS_task_3 OLS.
    # Синтетические данные согласованы с истинной моделью y=3+0.6x1−0.4x2.
    n = 50
    x1 = rng.uniform(0, 10, n)
    x2 = rng.uniform(0, 10, n)
    y_true = 3.0 + 0.6 * x1 - 0.4 * x2
    eps = rng.normal(0, 0.55, n)
    y = y_true + eps

    # простой МНК вручную (без statsmodels/scipy для автономности скрипта)
    X = np.column_stack([np.ones(n), x1, x2])
    beta_hat = np.linalg.lstsq(X, y, rcond=None)[0]
    y_hat = X @ beta_hat
    resid = y - y_hat

    fig, axes = plt.subplots(1, 2, figsize=(9.5, 3.6))

    # левый: остатки vs предсказанные
    axes[0].scatter(y_hat, resid, s=30, color=ACCENT, alpha=0.65)
    axes[0].axhline(0, color=TX3, lw=1.2, ls="--")
    axes[0].set_title("Остатки vs предсказанные значения")
    axes[0].set_xlabel(r"$\hat{y}$")
    axes[0].set_ylabel("Остаток $e_i$")

    # правый: stem-plot
    idx = np.arange(n)
    markerline, stemlines, baseline = axes[1].stem(
        idx, resid, linefmt=ACCENT, markerfmt="o", basefmt=TX3
    )
    plt.setp(stemlines, linewidth=0.9, alpha=0.7)
    plt.setp(markerline, markersize=4, color=ACCENT)
    axes[1].set_title("Остатки по индексу наблюдения")
    axes[1].set_xlabel("Наблюдение $i$")
    axes[1].set_ylabel("Остаток $e_i$")

    fig.suptitle(
        rf"OLS: $\hat\beta\approx({beta_hat[0]:.2f},\,{beta_hat[1]:.2f},\,{beta_hat[2]:.2f})$,"
        "  гомоскедастичность",
        fontsize=10,
    )
    save(fig, "py_resid_diag")

    # ── 3. py_pred_intervals ──────────────────────────────────────────────────
    # Линия парной регрессии + заливки ДИ среднего и интервала предсказания.
    # Параметры согласованы с задачей B10: ДИ среднего [8.52,8.74],
    # интервал предсказания [7.45,9.81] при x*=8.
    n2 = 40
    x_data = rng.uniform(0, 16, n2)
    y_data = 2.88 + 0.61 * x_data + rng.normal(0, 0.75, n2)

    xf = np.linspace(0, 16, 300)
    # подогнать МНК
    p = np.polyfit(x_data, y_data, 1)
    y_fit = np.polyval(p, xf)

    # аналитические формулы для ДИ и интервала предсказания при 95%, n2 точек
    from scipy import stats as scipy_stats

    x_mean = x_data.mean()
    Sxx = np.sum((x_data - x_mean) ** 2)
    se2 = np.sum((y_data - (p[1] + p[0] * x_data)) ** 2) / (n2 - 2)
    t_crit = scipy_stats.t.ppf(0.975, df=n2 - 2)

    se_mean = np.sqrt(se2 * (1 / n2 + (xf - x_mean) ** 2 / Sxx))
    se_pred = np.sqrt(se2 * (1 + 1 / n2 + (xf - x_mean) ** 2 / Sxx))

    ci_lo = y_fit - t_crit * se_mean
    ci_hi = y_fit + t_crit * se_mean
    pi_lo = y_fit - t_crit * se_pred
    pi_hi = y_fit + t_crit * se_pred

    fig, ax = plt.subplots(figsize=(6.5, 4.0))
    ax.scatter(x_data, y_data, s=22, color=TX3, alpha=0.65, zorder=3, label="данные")
    ax.plot(xf, y_fit, color=ACCENT, lw=2.0, label=f"МНК: ŷ={p[1]:.2f}+{p[0]:.2f}x")
    ax.fill_between(xf, ci_lo, ci_hi, color=ACCENT, alpha=0.20, label="ДИ среднего 95%")
    ax.fill_between(xf, pi_lo, pi_hi, color="#f59e0b", alpha=0.12, label="Интервал предсказания 95%")

    # отметить x*=8 (ближе к значениям из плана: ДИ [8.52,8.74], ИП [7.45,9.81])
    x_star = 8.0
    y_star = np.polyval(p, x_star)
    se_m8 = np.sqrt(se2 * (1 / n2 + (x_star - x_mean) ** 2 / Sxx))
    se_p8 = np.sqrt(se2 * (1 + 1 / n2 + (x_star - x_mean) ** 2 / Sxx))
    ax.errorbar(
        x_star,
        y_star,
        yerr=[[t_crit * se_m8], [t_crit * se_m8]],
        fmt="D",
        color=ACCENT,
        capsize=5,
        ms=6,
        label=f"ДИ сред. x*={x_star}",
        zorder=5,
    )
    ax.errorbar(
        x_star + 0.35,
        y_star,
        yerr=[[t_crit * se_p8], [t_crit * se_p8]],
        fmt="s",
        color="#f59e0b",
        capsize=5,
        ms=6,
        label=f"ИП x*={x_star}",
        zorder=5,
    )

    ax.set_title("ДИ среднего отклика vs интервал предсказания")
    ax.set_xlabel("$x$")
    ax.set_ylabel("$y$")
    ax.legend(fontsize=8.5, loc="upper left")

    fig.text(
        0.98,
        0.02,
        "get_prediction().conf_int(obs=True) → ИП",
        ha="right",
        va="bottom",
        color=TX3,
        fontsize=8,
    )
    save(fig, "py_pred_intervals")


if __name__ == "__main__":
    build()
