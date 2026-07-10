const apiKey = process.env.DEEPSEEK_API_KEY;
const baseUrl = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";

if (!apiKey) {
  console.error(
    "DEEPSEEK_API_KEY is missing. Add your DeepSeek token to .env.local.",
  );
  process.exit(1);
}

const models = {
  deepseek_v4_flash: "deepseek-v4-flash",
  deepseek_v4_pro: "deepseek-v4-pro",
};

const selectedKey = process.env.MODEL_KEY;
if (selectedKey && !(selectedKey in models)) {
  console.error(`Unknown MODEL_KEY: ${selectedKey}`);
  process.exit(1);
}
const selectedModels = selectedKey
  ? [[selectedKey, models[selectedKey]]]
  : Object.entries(models);

for (const [key, model] of selectedModels) {
  const startedAt = Date.now();
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: 'Return JSON only in this format: {"ok":true}.',
          },
          { role: "user", content: "Test the connection." },
        ],
        response_format: { type: "json_object" },
        thinking: { type: "disabled" },
        temperature: 0,
        max_tokens: 32,
        stream: false,
      }),
      signal: AbortSignal.timeout(45_000),
    });
    const payload = await response.json();
    const content = payload.choices?.[0]?.message?.content;
    console.log(
      `${response.ok ? "PASS" : "FAIL"} ${key} (${model}) ${response.status} ${Date.now() - startedAt}ms`,
      response.ok && typeof content === "string" ? content.slice(0, 100) : "",
    );
  } catch (error) {
    console.log(
      `ERROR ${key} (${model}) ${Date.now() - startedAt}ms`,
      error instanceof Error ? error.message : error,
    );
  }
}
