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
import React, { useEffect, useState } from "react";
import { Run } from "openai/resources/beta/threads/runs/runs.mjs";
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
          setMessages(newMessages);
        });
    } catch (error) {
      console.log("error", error);
      toast.error("Error fetching messages", { position: "bottom-center" });
    }
  };

  const handleSubmitAction = async () => {
    setStockPrices([]);
    run?.required_action?.submit_tool_outputs.tool_calls.forEach(
      (toolCall, index) => {
        console.log(`toolCall ${index}`, toolCall);
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

          axios
            .get<{
              price: number | null;
              success: boolean;
              error?: string;
            }>(`/api/stock?symbol=${symbol}`)
            .then((resp) => {
              const { error, success, price } = resp.data;
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

              setStockPrices((prev) => [...prev, newStockPrice]);

              // TODO: Call submitToolsOutput
              // https://platform.openai.com/docs/api-reference/runs
              // https://platform.openai.com/docs/api-reference/runs/modifyRun
              /**
               * When a run has the status: "requires_action" and required_action.type
               * is submit_tool_outputs, this endpoint can be used to submit the outputs
               * from the tool calls once they're all completed. All outputs must
               * be submitted in a single request.
               */
            })
            .catch((err) => {
              console.error("Error fetching stock price", err);
            });
        } else {
          throw new Error(
            `Unknown tool call function: ${toolCall.function.name}`
          );
        }
      }
    );
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
