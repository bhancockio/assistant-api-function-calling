"use client";

import {
  assistantAtom,
  messagesAtom,
  runAtom,
  runStateAtom,
  stockPricesAtom,
  threadAtom,
} from "@/atoms";
import axios from "axios";
import { useAtom } from "jotai";
import React, { use, useEffect, useState } from "react";
import {
  Run,
  RunSubmitToolOutputsParams,
} from "openai/resources/beta/threads/runs/runs.mjs";
import toast from "react-hot-toast";
import { ThreadMessage } from "openai/resources/beta/threads/messages/messages.mjs";
import { Button } from "./ui/button";

function Run() {
  // Atom State
  const [thread] = useAtom(threadAtom);
  const [run, setRun] = useAtom(runAtom);
  const [, setMessages] = useAtom(messagesAtom);
  const [assistant] = useAtom(assistantAtom);
  const [runState, setRunState] = useAtom(runStateAtom);
  const [, setStockPrices] = useAtom(stockPricesAtom);

  // State
  const [creating, setCreating] = useState(false);
  const [pollingIntervalId, setPollingIntervalId] =
    useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clean up polling on unmount
    return () => {
      if (pollingIntervalId) clearInterval(pollingIntervalId);
    };
  }, [pollingIntervalId]);

  useEffect(() => {
    if (!run) return;
    startPolling(run.id);
  }, [run]);

  const startPolling = (runId: string) => {
    if (!thread) return;
    const intervalId = setInterval(async () => {
      try {
        const response = await axios.get<{ run: Run }>(
          `/api/run/retrieve?threadId=${thread.id}&runId=${runId}`
        );
        const updatedRun = response.data.run;

        setRun(updatedRun);
        setRunState(updatedRun.status);

        if (
          ["cancelled", "failed", "completed", "expired"].includes(
            updatedRun.status
          )
        ) {
          clearInterval(intervalId);
          setPollingIntervalId(null);
          fetchMessages();
        }
      } catch (error) {
        console.error("Error polling run status:", error);
        clearInterval(intervalId);
        setPollingIntervalId(null);
      }
    }, 500);

    setPollingIntervalId(intervalId);
  };

  const handleCreate = async () => {
    if (!assistant || !thread) return;

    setCreating(true);
    try {
      const response = await axios.get<{ run: Run }>(
        `/api/run/create?threadId=${thread.id}&assistantId=${assistant.id}`
      );

      const newRun = response.data.run;
      setRunState(newRun.status);
      setRun(newRun);
      toast.success("Run created", { position: "bottom-center" });
      localStorage.setItem("run", JSON.stringify(newRun));

      // Start polling after creation
      startPolling(newRun.id);
    } catch (error) {
      toast.error("Error creating run.", { position: "bottom-center" });
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  const fetchMessages = async () => {
    if (!thread) return;

    try {
      axios
        .get<{ messages: ThreadMessage[] }>(
          `/api/message/list?threadId=${thread.id}`
        )
        .then((response) => {
          let newMessages = response.data.messages;

          // Sort messages in descending order by createdAt
          newMessages = newMessages.sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          );

          // Only add user messages and not function calls
          newMessages = newMessages.filter(
            (message) => message.role === "user"
          );
          setMessages(newMessages);
        });
    } catch (error) {
      console.log("error", error);
      toast.error("Error fetching messages", { position: "bottom-center" });
    }
  };

  const handleSubmitAction = async () => {
    setStockPrices([]);
    const toolOutputs: RunSubmitToolOutputsParams.ToolOutput[] = [];

    for (const toolCall of run?.required_action?.submit_tool_outputs
      .tool_calls ?? []) {
      console.log(`toolCall`, toolCall);
      if (toolCall.function.name === "getStockInfo") {
        const { symbol, logoURL, success, errorMessage } = JSON.parse(
          toolCall.function.arguments
        );
        if (!success || errorMessage) {
          toast.error(
            errorMessage ?? "Something went wrong fetching data for stocks",
            { position: "bottom-center" }
          );
        }
        if (!symbol) {
          toast.error("No symbol found", { position: "bottom-center" });
        }

        try {
          const response = await axios.get<{
            price: number | null;
            success: boolean;
            error?: string;
          }>(`/api/stock?symbol=${symbol}`);

          const { error, success, price } = response.data;
          if (!success || error || !price) {
            toast.error(error ?? "Something went wrong fetching stock", {
              position: "bottom-center",
            });
            return;
          }

          const newStockPrice = {
            symbol,
            logoURL: logoURL ?? "",
            price,
          };

          console.log("new stock price", newStockPrice);

          toolOutputs.push({
            tool_call_id: toolCall.id,
            output: JSON.stringify(newStockPrice),
          });

          setStockPrices((prev) => [...prev, newStockPrice]);
        } catch (error) {
          console.log("Error fetching stock", error);
          toast.error("Error fetching stock", { position: "bottom-center" });
        }
      } else {
        throw new Error(
          `Unknown tool call function: ${toolCall.function.name}`
        );
      }
    }

    console.log("toolOutputs", toolOutputs);
    if (toolOutputs.length > 0) {
      const response = await axios.post<{ run: Run; success: boolean }>(
        "/api/run/submit-tool-output",
        {
          runId: run?.id,
          threadId: thread?.id,
          toolOutputs: toolOutputs,
        }
      );

      console.log("Response data from submit tool output", response.data);

      if (response.data.success) {
        toast.success("Submitted action", { position: "bottom-center" });
        setRun(response.data.run);
      } else {
        toast.success("Submitted action", { position: "bottom-center" });
      }
    }
  };

  return (
    <div className="flex flex-col mb-8">
      <h1 className="text-4xl font-semibold mb-4">Run</h1>
      <div className="flex flex-row gap-x-4 w-full">
        <Button
          onClick={handleCreate}
          disabled={creating || !assistant || !thread}
        >
          {creating ? "Creating..." : "Create"}
        </Button>
        <Button
          onClick={handleSubmitAction}
          disabled={runState !== "requires_action"}
        >
          Submit Action
        </Button>
      </div>
    </div>
  );
}

export default Run;
