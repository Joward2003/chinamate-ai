export type LlmModelKey = "deepseek_v4_pro" | "deepseek_v4_flash";

export type LlmModelConfig = {
  provider: "deepseek";
  model: string;
  baseUrl: string;
  apiKey: string | undefined;
  temperature: number;
  maxTokens: number;
  timeoutMs: number;
  enabled: boolean;
};

const deepseekBaseUrl =
  process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";
const requestTimeoutMs = Number(process.env.LLM_TIMEOUT_MS ?? 30_000);

/**
 * DeepSeek official model dictionary. Secrets always come from server-only
 * environment variables and are never sent to browser code.
 */
export const LLM_MODELS: Record<LlmModelKey, LlmModelConfig> = {
  deepseek_v4_pro: {
    provider: "deepseek",
    model: "deepseek-v4-pro",
    baseUrl: deepseekBaseUrl,
    apiKey: process.env.DEEPSEEK_API_KEY,
    temperature: 0.1,
    maxTokens: 2400,
    timeoutMs: requestTimeoutMs,
    enabled: true,
  },
  deepseek_v4_flash: {
    provider: "deepseek",
    model: "deepseek-v4-flash",
    baseUrl: deepseekBaseUrl,
    apiKey: process.env.DEEPSEEK_API_KEY,
    temperature: 0.1,
    maxTokens: 2400,
    timeoutMs: requestTimeoutMs,
    enabled: true,
  },
};

const configuredDefault = process.env.LLM_MODEL as LlmModelKey | undefined;

export const DEFAULT_LLM_MODEL: LlmModelKey =
  configuredDefault && configuredDefault in LLM_MODELS
    ? configuredDefault
    : "deepseek_v4_flash";

const configuredFallbacks = (
  process.env.LLM_FALLBACK_MODELS ??
  "deepseek_v4_flash,deepseek_v4_pro"
)
  .split(",")
  .map((item) => item.trim())
  .filter((item): item is LlmModelKey => item in LLM_MODELS);

export const LLM_FALLBACK_ORDER: LlmModelKey[] = [
  ...new Set([DEFAULT_LLM_MODEL, ...configuredFallbacks]),
];

export function getLlmConfig(modelKey = DEFAULT_LLM_MODEL): LlmModelConfig {
  const config = LLM_MODELS[modelKey];
  if (!config || !config.enabled) {
    throw new Error(`LLM model "${modelKey}" is not configured or enabled.`);
  }
  return config;
}
