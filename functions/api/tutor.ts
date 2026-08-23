// Cloudflare Pages Function: POST /api/tutor → Claude. Set ANTHROPIC_API_KEY
// as an encrypted environment variable in the Pages project settings.
import { handleTutor, TutorHandlerError } from "../../server/tutor-handler";

interface Env {
  ANTHROPIC_API_KEY?: string;
}

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }): Promise<Response> => {
  try {
    const body = await request.json();
    const result = await handleTutor(body, env.ANTHROPIC_API_KEY);
    return Response.json(result);
  } catch (err) {
    const status = err instanceof TutorHandlerError ? err.status : 500;
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status });
  }
};
