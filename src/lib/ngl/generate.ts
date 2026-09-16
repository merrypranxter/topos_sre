import { createServerFn } from "@tanstack/react-start";
import { extractOutputState, NGL_SYSTEM_PROMPT, NGL_USER_PREFIX } from "@/lib/sre";

export type NglResult =
  | { ok: true; text: string; usage?: { totalTokens?: number } }
  | { ok: false; error: string };

function nglUpstreamError(status: number, body: string): string {
  let code = "";
  let message = "";
  try {
    const parsed = JSON.parse(body) as { code?: string; error?: string; message?: string };
    code = parsed.code ?? "";
    message = parsed.error ?? parsed.message ?? "";
  } catch {
    message = body.slice(0, 240);
  }
  const quota =
    status === 402 ||
    status === 429 ||
    /spending-limit|out of credits|need a grok subscription|insufficient.?quota/i.test(
      `${code} ${message}`,
    );
  if (quota || (status === 403 && /spending-limit|credits|subscription/i.test(`${code} ${message}`))) {
    return "Generative layer quota exhausted (spending limit). HLC is still live — paste an OUTPUT_STATE into the manual bridge.";
  }
  if (status === 401 || status === 403) {
    return "Generative layer is unavailable. HLC is still live — paste an OUTPUT_STATE into the manual bridge.";
  }
  return `NGL upstream error ${status}${message ? `: ${message.slice(0, 180)}` : ""}`;
}

export const generateNgl = createServerFn({ method: "POST" })
  .validator((input: { opBlock: string; temperature: number }) => input)
  .handler(async ({ data }): Promise<NglResult> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, error: "Generative layer is unavailable in this environment." };

    const temperature = Math.min(1.4, Math.max(0.2, data.temperature));
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

    let res = await once();
    if (res.status >= 500) res = await once();
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: nglUpstreamError(res.status, text) };
    }

    const payload = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
      usage?: { total_tokens?: number };
    };
    const raw = payload.choices?.[0]?.message?.content ?? "";
    const text = extractOutputState(raw);
    if (!text) return { ok: false, error: "NGL returned an empty OUTPUT_STATE." };
    return { ok: true, text, usage: { totalTokens: payload.usage?.total_tokens } };
  });
