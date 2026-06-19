"""Графики темы «Случайные процессы» (Винер, броуновский мост, телеграфный сигнал, КФ)."""
import numpy as np
import matplotlib.pyplot as plt
from _style import save, ACCENT, TX3, BG, PANEL, TX, GRID


def build():
    rng = np.random.default_rng(0)

    # ── 1. sp_brownian_bridge ────────────────────────────────────────────────
    # Несколько траекторий процесса Винера и броуновского моста на [0,1].
    n_steps = 400
    t = np.linspace(0, 1, n_steps + 1)
    dt = 1.0 / n_steps
    n_paths = 5

    fig, axes = plt.subplots(1, 2, figsize=(10, 3.6))

    ax = axes[0]
    colors_w = ["#22c55e", "#a855f7", "#38bdf8", "#f97316", "#facc15"]
    for k in range(n_paths):
        dW = rng.normal(0, np.sqrt(dt), n_steps)
        W = np.concatenate([[0], np.cumsum(dW)])
        ax.plot(t, W, lw=1.2, color=colors_w[k], alpha=0.85)
    ax.axhline(0, color=TX3, lw=0.8, ls="--")
    ax.set_title("Процесс Винера $W(t)$")
    ax.set_xlabel("$t$")
    ax.set_ylabel("$W(t)$")
    ax.set_xlim(0, 1)

    ax = axes[1]
    for k in range(n_paths):
        dW = rng.normal(0, np.sqrt(dt), n_steps)
        W = np.concatenate([[0], np.cumsum(dW)])
        W1 = W[-1]
        bridge = W - t * W1   # X(t) = W(t) - t·W(1)
        ax.plot(t, bridge, lw=1.2, color=colors_w[k], alpha=0.85)
    ax.axhline(0, color=TX3, lw=0.8, ls="--")
    ax.plot([0, 1], [0, 0], "o", color=ACCENT, ms=5, zorder=5, label="закреплённые концы")
    ax.set_title("Броуновский мост $X(t)=W(t)-tW(1)$")
    ax.set_xlabel("$t$")
    ax.set_ylabel("$X(t)$")
    ax.set_xlim(0, 1)
    ax.legend(fontsize=8)

    save(fig, "sp_brownian_bridge")

    # ── 2. sp_telegraph ─────────────────────────────────────────────────────
    # Три траектории телеграфного сигнала X(t) = (-1)^N(t), lambda=2.
    lam = 2.0
    T = 3.0
    t_fine = np.linspace(0, T, 2000)

    fig, ax = plt.subplots(figsize=(8, 3.2))
    colors_t = [ACCENT, "#a855f7", "#38bdf8"]

    for k, c in enumerate(colors_t):
        # Генерируем пуассоновские времена скачков
        times = [0.0]
        while times[-1] < T:
            times.append(times[-1] + rng.exponential(1.0 / lam))
        times = np.array(times)
        # X(t) = (-1)^(число скачков до t)
        x_vals = np.ones(len(t_fine))
        for j, tj in enumerate(t_fine):
            n_jumps = np.sum(times < tj) - 1  # -1 т.к. times[0]=0 не скачок
            x_vals[j] = 1.0 if (n_jumps % 2 == 0) else -1.0
        # Рисуем как ступенчатую функцию
        ax.step(t_fine, x_vals * (1 - k * 0.03), where="post",
                lw=1.5, color=c, alpha=0.80, label=f"траектория {k+1}")

    ax.set_title(f"Телеграфный сигнал $X(t)=(-1)^{{N(t)}}$, $\\lambda={lam}$")
    ax.set_xlabel("$t$")
    ax.set_ylabel("$X(t)$")
    ax.set_ylim(-1.4, 1.6)
    ax.set_xlim(0, T)
    ax.legend(fontsize=8, loc="upper right")

    save(fig, "sp_telegraph")

    # ── 3. sp_corr_telegraph ────────────────────────────────────────────────
    # Корреляционная функция телеграфного сигнала R(τ) = e^{-2λ|τ|} для разных λ.
    tau = np.linspace(-3, 3, 500)
    lambdas = [0.5, 1.0, 2.0, 4.0]
    colors_l = ["#22c55e", "#38bdf8", "#a855f7", "#f97316"]

    fig, ax = plt.subplots(figsize=(7, 3.6))
    for lam_val, c in zip(lambdas, colors_l):
        R = np.exp(-2 * lam_val * np.abs(tau))
        ax.plot(tau, R, lw=2, color=c, label=f"$\\lambda={lam_val}$")

    ax.axvline(0, color=TX3, lw=0.7, ls="--")
    ax.set_title(r"$R_X(\tau)=e^{-2\lambda|\tau|}$ — КФ телеграфного сигнала")
    ax.set_xlabel(r"$\tau=t-s$")
    ax.set_ylabel(r"$R_X(\tau)$")
    ax.set_xlim(-3, 3)
    ax.legend(fontsize=9)

    save(fig, "sp_corr_telegraph")

    # ── 4. sp_bridge_corr ──────────────────────────────────────────────────
    # Поверхность КФ броуновского моста R(t,s) = min(t,s) - ts на [0,1]^2
    # + справа: КФ при фиксированных t для нескольких значений.
    tv = np.linspace(0, 1, 100)
    T2, S2 = np.meshgrid(tv, tv)
    R_bridge = np.minimum(T2, S2) - T2 * S2

    fig, axes = plt.subplots(1, 2, figsize=(10, 3.8))

    # Тепловая карта
    ax = axes[0]
    cmap = plt.colormaps["plasma"]
    img = ax.pcolormesh(T2, S2, R_bridge, cmap=cmap, shading="auto")
    fig.colorbar(img, ax=ax, label="$R_X(t,s)$")
    ax.set_title("КФ броуновского моста $\\min(t,s)-ts$")
    ax.set_xlabel("$t$")
    ax.set_ylabel("$s$")

    # Срезы при фиксированных t
    ax = axes[1]
    fixed_t = [0.2, 0.4, 0.5, 0.7, 0.9]
    cols = ["#22c55e", "#38bdf8", "#facc15", "#a855f7", "#f97316"]
    s_arr = np.linspace(0, 1, 300)
    for ft, c in zip(fixed_t, cols):
        R_slice = np.minimum(ft, s_arr) - ft * s_arr
        ax.plot(s_arr, R_slice, lw=1.8, color=c, label=f"$t={ft}$")
    ax.set_title("КФ моста при фиксированных $t$")
    ax.set_xlabel("$s$")
    ax.set_ylabel("$R_X(t,s)$")
    ax.legend(fontsize=8)
    ax.set_xlim(0, 1)

    save(fig, "sp_bridge_corr")


if __name__ == "__main__":
    build()
