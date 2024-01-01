"use client";

import { assistantAtom, messagesAtom } from "@/atoms";
import axios from "axios";
import { useAtom } from "jotai";
import { Assistant } from "openai/resources/beta/assistants/assistants.mjs";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "./ui/button";

function Assistant() {
  // Atom State
  const [, setAssistant] = useAtom(assistantAtom);

  // State
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const response = await axios.get<{ assistant: Assistant }>(
        "/api/assistant/create"
      );

      const newAssistant = response.data.assistant;
      console.log("newAssistant", newAssistant);
      setAssistant(newAssistant);
      localStorage.setItem("assistant", JSON.stringify(newAssistant));
      toast.success("Successfully created assistant", {
        position: "bottom-center",
      });
    } catch (error) {
      console.log("error", error);
      toast.error("Error creating assistant", { position: "bottom-center" });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col mb-8">
      <h1 className="text-4xl font-semibold mb-4">Assistant</h1>
      <div className="flex flex-row gap-x-4 w-full">
        <Button onClick={handleCreate}>
          {creating ? "Creating..." : "Create"}
        </Button>
      </div>
    </div>
  );
}

export default Assistant;
