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

let skipRemote = false;

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
    if (!apiKey || skipRemote) return onboard(data.opBlock, temperature);

    const body = {
      model: "grok-4.5",
      temperature,
      max_tokens: 420,
      messages: [
        { role: "system", content: NGL_SYSTEM_PROMPT },
        { role: "user", content: `${NGL_USER_PREFIX}${data.opBlock}` },
      ],
    };

    const once = async () =>
      fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

    try {
      let res = await once();
      if (res.status >= 500) res = await once();
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
