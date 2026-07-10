import { NextResponse } from "next/server";
import {
  DEFAULT_LLM_MODEL,
  LLM_MODELS,
} from "@/config/llm";

export async function GET() {
  return NextResponse.json({
    active: DEFAULT_LLM_MODEL,
    configured: Boolean(LLM_MODELS[DEFAULT_LLM_MODEL].apiKey),
    models: Object.entries(LLM_MODELS).map(([key, config]) => ({
      key,
      provider: config.provider,
      model: config.model,
      baseUrl: config.baseUrl,
      enabled: config.enabled,
    })),
  });
}
