"use client";

import { messagesAtom, threadAtom } from "@/atoms";
import axios from "axios";
import { useAtom } from "jotai";
import { Thread } from "openai/resources/beta/threads/threads.mjs";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "./ui/button";

function Thread() {
  // Atom State
  const [, setThread] = useAtom(threadAtom);

  // State
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const response = await axios.get<{ thread: Thread }>(
        "/api/thread/create"
      );

      const newThread = response.data.thread;
      console.log("response", newThread);
      setThread(newThread);
      localStorage.setItem("thread", JSON.stringify(newThread));
      toast.success("Successfully created thread", {
        position: "bottom-center",
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to create thread", { position: "bottom-center" });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col mb-8">
      <h1 className="text-4xl font-semibold mb-4">Thread</h1>
      <div className="flex flex-row gap-x-4 w-full">
        <Button onClick={handleCreate}>
          {creating ? "Creating..." : "Create"}
        </Button>
      </div>
    </div>
  );
}

export default Thread;
