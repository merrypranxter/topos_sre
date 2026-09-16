import { createServerFn } from "@tanstack/react-start";
import { extractOutputState, NGL_SYSTEM_PROMPT, NGL_USER_PREFIX } from "@/lib/sre";
import { executeOpBlock } from "@/lib/ngl/local";

export type NglResult =
  | { ok: true; text: string; usage?: { totalTokens?: number }; source: "remote" | "onboard" }
  | { ok: false; error: string };

function isQuotaFailure(status: number, body: string): boolean {
  return (
    status === 402 ||
    status === 429 ||
    (status === 403 && /spending-limit|credits|subscription/i.test(body)) ||
    /spending-limit|out of credits|need a grok subscription|insufficient.?quota/i.test(body)
  );
}

// Remote generation is deliberately OFF unless both XAI_API_KEY exists and
// XAI_REMOTE_ENABLED=true is set. The standalone Netlify UI does not import
// this module at all; it uses the zero-cost local executor in sre-store.ts.
let skipRemote = false;
let remoteCalls = 0;

function onboard(opBlock: string, temperature: number): NglResult {
  const text = executeOpBlock(opBlock, temperature).trim();
  if (!text) return { ok: false, error: "NGL returned an empty OUTPUT_STATE." };
  return { ok: true, text, source: "onboard" };
}

export const generateNgl = createServerFn({ method: "POST" })
  .validator((input: { opBlock: string; temperature: number }) => input)
  .handler(async ({ data }): Promise<NglResult> => {
    const temperature = Math.min(1.4, Math.max(0.2, data.temperature));
    const apiKey = process.env.XAI_API_KEY;
    const remoteEnabled = process.env.XAI_REMOTE_ENABLED === "true";
    const configuredCap = Number(process.env.XAI_REMOTE_CALL_CAP ?? "12");
    const remoteCallCap = Number.isFinite(configuredCap) ? Math.max(1, Math.min(100, configuredCap)) : 12;

    if (!remoteEnabled || !apiKey || skipRemote || remoteCalls >= remoteCallCap) {
      return onboard(data.opBlock, temperature);
    }

    remoteCalls += 1;

    const body = {
      model: "grok-4.5",
      temperature,
      max_tokens: 220,
      messages: [
        { role: "system", content: NGL_SYSTEM_PROMPT },
        { role: "user", content: `${NGL_USER_PREFIX}${data.opBlock}` },
      ],
    };

    try {
      // No automatic retry: one click may cause at most one paid request.
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        if (isQuotaFailure(res.status, text) || res.status === 401 || res.status === 403) {
          skipRemote = true;
        }
        return onboard(data.opBlock, temperature);
      }

      const payload = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
        usage?: { total_tokens?: number };
      };
      const raw = payload.choices?.[0]?.message?.content ?? "";
      const text = extractOutputState(raw);
      if (!text) return onboard(data.opBlock, temperature);
      return { ok: true, text, usage: { totalTokens: payload.usage?.total_tokens }, source: "remote" };
    } catch {
      return onboard(data.opBlock, temperature);
    }
  });
