"""Запускает все fig_*.py в этой папке (каждый со своим build())."""
import importlib, os, sys, glob

HERE = os.path.dirname(__file__)
sys.path.insert(0, HERE)

def main():
    mods = sorted(os.path.basename(p)[:-3] for p in glob.glob(os.path.join(HERE, "fig_*.py")))
    n = 0
    for m in mods:
        mod = importlib.import_module(m)
        if hasattr(mod, "build"):
            mod.build(); n += 1
        else:
            print("skip (no build()):", m)
    print(f"done: {n} modules")

if __name__ == "__main__":
    main()
