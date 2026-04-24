import { AIRouter, getProjectPreset } from "ai-router";
import type { AIRequest, AIResponse } from "ai-router";

const preset = getProjectPreset("GMaps");

export const aiRouter = new AIRouter({
  ...preset,
  projectName: "GMaps",
});

/** Convenience wrapper — routes an AI request through the GMaps preset */
export async function routeAI(request: AIRequest): Promise<AIResponse> {
  return aiRouter.chat(request);
}

export { aiRouter as router };
export type { AIRequest, AIResponse };
