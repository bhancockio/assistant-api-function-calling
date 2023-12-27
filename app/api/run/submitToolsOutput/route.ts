import { NextRequest } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const { runId, threadId, toolOutputs } = await req.json();

  if (!threadId)
    return Response.json({ error: "No thread id provided" }, { status: 400 });
  if (!runId)
    return Response.json({ error: "No run id provided" }, { status: 400 });

  const openai = new OpenAI();

  try {
    const run = await openai.beta.threads.runs.submitToolOutputs(
      threadId,
      runId,
      toolOutputs
    );

    console.log(run);

    return Response.json({ run: run });
  } catch (e) {
    console.log(e);
    return Response.json({ error: e });
  }
}
