import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Download, RotateCcw } from "lucide-react";
import { Bridge } from "@/components/dashboard/bridge";
import { ControllerPanel } from "@/components/dashboard/controller-panel";
import { GenerativePanel } from "@/components/dashboard/generative-panel";
import { Ignition } from "@/components/dashboard/ignition";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
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

  if (!boot) {
    return (
      <div className="flex min-h-dvh flex-col bg-bg text-fg">
        <header className="flex items-center justify-between gap-3 border-b border-fg/10 px-4 py-3 lg:px-5">
          <div className="min-w-0">
            <span className="text-sm font-medium tracking-tight text-fg">TOPOS-SRE</span>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted">
              Topological semantic recursion
            </p>
          </div>
        </header>
        <Ignition />
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex min-h-dvh flex-col bg-bg text-fg">
        <header className="flex items-center justify-between gap-3 border-b border-fg/10 px-4 py-3 lg:px-5">
          <div className="min-w-0">
            <Link to="/" className="text-sm font-medium tracking-tight text-fg">
              TOPOS-SRE
            </Link>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted">
              Topological semantic recursion
            </p>
          </div>
          <nav className="flex items-center gap-1">
            <Link
              to="/spec"
              className="inline-flex h-11 items-center px-3 font-mono text-[0.7rem] uppercase tracking-wider text-muted hover:text-fg"
            >
              Spec
            </Link>
            {state ? (
              <>
                <Button type="button" variant="ghost" size="icon" onClick={download} aria-label="Export session">
                  <Download />
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={reset} aria-label="Reset">
                  <RotateCcw />
                </Button>
              </>
            ) : null}
          </nav>
        </header>

        {!state ? (
          <Ignition />
        ) : (
          <>
            <div className="grid min-h-0 flex-1 grid-cols-1 divide-y divide-fg/10 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
              <ControllerPanel />
              <GenerativePanel />
            </div>
            <Bridge />
          </>
        )}
      </div>
    </TooltipProvider>
  );
}
