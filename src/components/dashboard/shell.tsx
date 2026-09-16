import { useEffect, useState } from "react";
import { Download, HelpCircle, RotateCcw } from "lucide-react";
import { Bridge } from "@/components/dashboard/bridge";
import { ControllerPanel } from "@/components/dashboard/controller-panel";
import { GenerativePanel } from "@/components/dashboard/generative-panel";
import { Ignition } from "@/components/dashboard/ignition";
import { Button } from "@/components/ui/button";
import { useSreStore } from "@/store/sre-store";

export function DashboardShell() {
  const [boot, setBoot] = useState(false);
  const state = useSreStore((s) => s.state);
  const reset = useSreStore((s) => s.reset);
  const exportSession = useSreStore((s) => s.exportSession);

  useEffect(() => {
    const finish = () => setBoot(true);
    if (useSreStore.persist.hasHydrated()) finish();
    const unsub = useSreStore.persist.onFinishHydration(finish);
    const t = window.setTimeout(finish, 80);
    return () => {
      unsub();
      window.clearTimeout(t);
    };
  }, []);

  function download() {
    const dump = exportSession();
    if (!dump) return;
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `topos-sre-c${String(dump.state.cycle).padStart(3, "0")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function confirmReset() {
    if (!state) return;
    if (window.confirm("Reset this experiment and clear its current tape?")) reset();
  }

  if (!boot) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg text-fg">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">booting TOPOS-SRE…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <header className="sticky top-0 z-40 border-b border-fg/10 bg-bg/95 px-4 py-3 backdrop-blur lg:px-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <button type="button" onClick={() => state && confirmReset()} className="min-w-0 text-left" title={state ? "Reset experiment" : undefined}>
            <span className="text-sm font-medium tracking-tight text-fg">TOPOS-SRE</span>
            <p className="truncate font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted">
              Topological semantic recursion
            </p>
          </button>

          {state ? (
            <div className="flex items-center gap-1">
              <details className="relative">
                <summary className="inline-flex h-10 cursor-pointer list-none items-center gap-1.5 rounded-md px-2 text-xs text-muted hover:bg-elevated hover:text-fg">
                  <HelpCircle className="size-4" />
                  <span className="hidden sm:inline">Help</span>
                </summary>
                <div className="absolute right-0 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-fg/10 bg-surface p-4 shadow-2xl">
                  <p className="text-sm font-medium text-fg">How to drive this thing</p>
                  <ol className="mt-2 space-y-2 text-xs leading-relaxed text-muted">
                    <li><strong className="text-fg">1.</strong> Step once to watch one mutation happen.</li>
                    <li><strong className="text-fg">2.</strong> Run ×4 when you want a tiny automatic burst.</li>
                    <li><strong className="text-fg">3.</strong> Raise Variation for looser token mixing.</li>
                    <li><strong className="text-fg">4.</strong> Use a perturbation when the path gets boring or stuck.</li>
                    <li><strong className="text-fg">5.</strong> Ignore Controller Guts unless you want to inspect why it changed.</li>
                  </ol>
                </div>
              </details>
              <Button type="button" variant="ghost" size="sm" onClick={download} aria-label="Export session" title="Export session JSON">
                <Download />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={confirmReset} aria-label="Reset experiment" title="Reset experiment">
                <RotateCcw />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            </div>
          ) : null}
        </div>
      </header>

      {!state ? (
        <Ignition />
      ) : (
        <>
          <Bridge />
          <main className="mx-auto grid w-full max-w-7xl min-h-0 flex-1 grid-cols-1 divide-y divide-fg/10 lg:grid-cols-[minmax(0,1.25fr)_minmax(22rem,0.75fr)] lg:divide-x lg:divide-y-0">
            <GenerativePanel />
            <ControllerPanel />
          </main>
        </>
      )}
    </div>
  );
}
