import { NextRequest } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const { runId, threadId, toolOutputs } = await req.json();

  if (!threadId)
    return Response.json({ error: "No thread id provided" }, { status: 400 });
  if (!runId)
    return Response.json({ error: "No run id provided" }, { status: 400 });
  if (!toolOutputs)
    return Response.json({ error: "No toolOutputs provided" }, { status: 400 });

  const openai = new OpenAI();

  try {
    const run = await openai.beta.threads.runs.submitToolOutputs(
      threadId,
      runId,
      { tool_outputs: toolOutputs }
    );

    console.log("run in submit tool output", run);

    return Response.json({ run: run, success: true });
  } catch (e) {
    console.log("Error in submit tool output", e);
    return Response.json({ error: e, success: false });
  }
}
