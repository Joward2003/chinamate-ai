import "server-only";

import {
  LLM_FALLBACK_ORDER,
  getLlmConfig,
  type LlmModelKey,
} from "@/config/llm";

type LlmMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  error?: {
    message?: string;
  };
};

export class LlmConfigurationError extends Error {}

export type LlmJsonResult<T> = {
  data: T;
  modelKey: LlmModelKey;
  model: string;
};

export async function generateJsonWithFallback<T>({
  messages,
  modelKeys = LLM_FALLBACK_ORDER,
}: {
  messages: LlmMessage[];
  modelKeys?: LlmModelKey[];
}): Promise<LlmJsonResult<T>> {
  const errors: string[] = [];

  for (const modelKey of modelKeys) {
    try {
      const data = await generateJsonWithModel<T>({ messages, modelKey });
      const config = getLlmConfig(modelKey);
      console.info(`[ChinaMate LLM] ${config.model} completed successfully.`);
      return { data, modelKey, model: config.model };
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      errors.push(`${modelKey}: ${message}`);
      console.warn(`[ChinaMate LLM] ${modelKey} failed; trying fallback: ${message}`);
    }
  }

  throw new Error(`All configured DeepSeek models failed. ${errors.join(" | ")}`);
}

async function generateJsonWithModel<T>({
  messages,
  modelKey,
}: {
  messages: LlmMessage[];
  modelKey: LlmModelKey;
}): Promise<T> {
  const config = getLlmConfig(modelKey);

  if (!config.apiKey) {
    throw new LlmConfigurationError(
      "DEEPSEEK_API_KEY is not configured. Add it to .env.local.",
    );
  }

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      response_format: { type: "json_object" },
      thinking: { type: "disabled" },
      stream: false,
    }),
    signal: AbortSignal.timeout(config.timeoutMs),
    cache: "no-store",
  });

  const payload = (await response.json()) as ChatCompletionResponse;
  if (!response.ok) {
    throw new Error(
      payload.error?.message ?? `DeepSeek API request failed (${response.status}).`,
    );
  }

  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("The model returned an empty response.");

  return parseJsonFromModel<T>(content);
}

function parseJsonFromModel<T>(content: string): T {
  const trimmed = content.trim();

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
    if (fenced) return JSON.parse(fenced.trim()) as T;

    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1)) as T;
    }
    throw new Error("The model response did not contain valid JSON.");
  }
}
