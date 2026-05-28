export type LlmConfig = {
  apiKey: string;
  model: string;
};

export function getLlmConfig(): LlmConfig | null {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;
  return {
    apiKey,
    model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini"
  };
}
