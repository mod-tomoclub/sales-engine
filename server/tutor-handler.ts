/**
 * Tutor endpoint handler — runtime-agnostic (Cloudflare Pages Function in prod,
 * Vite dev middleware locally). One Claude call per student turn, structured
 * output validated against TutorTurnSchema. This is the §15 AI Gateway
 * implementation for the Level 1 live Learn phase.
 *
 * The API key never reaches the browser: the UI posts to /api/tutor and this
 * handler holds the key from the environment.
 */
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import {
  TutorTurnSchema,
  tutorMessages,
  tutorSystemPrompt,
  type TutorRequest,
  type TutorResponse,
} from "../src/level1/live-tutor";

export const TUTOR_MODEL = "claude-opus-5";

export class TutorHandlerError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

function isTutorRequest(x: unknown): x is TutorRequest {
  const r = x as TutorRequest;
  return !!r && typeof r === "object" && !!r.student && !!r.brief && Array.isArray(r.transcript) && Array.isArray(r.evidenceSoFar);
}

export async function handleTutor(body: unknown, apiKey: string | undefined): Promise<TutorResponse> {
  if (!apiKey) throw new TutorHandlerError("ANTHROPIC_API_KEY is not configured on the server", 500);
  if (!isTutorRequest(body)) throw new TutorHandlerError("Malformed tutor request", 400);

  const client = new Anthropic({ apiKey });
  try {
    const response = await client.messages.parse({
      model: TUTOR_MODEL,
      max_tokens: 2048,
      // Voice tutoring is latency-sensitive; turns are short and grounded in the brief.
      output_config: { effort: "low", format: zodOutputFormat(TutorTurnSchema) },
      system: [{ type: "text", text: tutorSystemPrompt(body.brief), cache_control: { type: "ephemeral" } }],
      messages: tutorMessages(body),
    });

    if (response.stop_reason === "refusal") {
      throw new TutorHandlerError(`Tutor declined this turn (${response.stop_details?.category ?? "unspecified"})`, 502);
    }
    const turn = response.parsed_output;
    if (!turn) throw new TutorHandlerError("Tutor returned an unparseable turn", 502);

    return {
      turn,
      usage: {
        model: response.model,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        cacheReadTokens: response.usage.cache_read_input_tokens ?? 0,
      },
    };
  } catch (err) {
    if (err instanceof TutorHandlerError) throw err;
    if (err instanceof Anthropic.AuthenticationError) throw new TutorHandlerError("Anthropic API key was rejected", 500);
    if (err instanceof Anthropic.RateLimitError) throw new TutorHandlerError("Tutor is rate-limited — try again in a moment", 429);
    if (err instanceof Anthropic.APIError) throw new TutorHandlerError(`Anthropic API error ${err.status}: ${err.message}`, 502);
    throw new TutorHandlerError(err instanceof Error ? err.message : "Unknown tutor error", 500);
  }
}
