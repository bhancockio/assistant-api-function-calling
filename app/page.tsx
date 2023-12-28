"use client";

import Header from "./components/Header";
import Assistant from "./components/Assistant";
import Thread from "./components/Thread";
import Run from "./components/Run";
import ChatContainer from "./components/ChatContainer";
import StockPricesContainer from "./components/StockPricesContainer";
import { useAtom } from "jotai";
import {
  assistantAtom,
  isValidRunState,
  runAtom,
  runStateAtom,
  threadAtom,
} from "@/atoms";
import { useEffect } from "react";

export default function Home() {
  // Atom State
  const [, setAssistant] = useAtom(assistantAtom);
  const [, setThread] = useAtom(threadAtom);
  const [, setRun] = useAtom(runAtom);
  const [, setRunState] = useAtom(runStateAtom);

  // Load default data
  useEffect(() => {
    if (typeof window !== "undefined") {
      const localAssistant = localStorage.getItem("assistant");
      if (localAssistant) {
        setAssistant(JSON.parse(localAssistant));
      }
      const localThread = localStorage.getItem("thread");
      if (localThread) {
        setThread(JSON.parse(localThread));
      }
      const localRun = localStorage.getItem("run");
      if (localRun) {
        setRun(JSON.parse(localRun));
      }
      const localRunState = localStorage.getItem("runState");
      if (localRunState && isValidRunState(localRunState)) {
        setRunState(localRunState);
      }
    }
  }, []);

  return (
    <main className="flex flex-col">
      <Header />
      <div className="flex flex-row mt-20 gap-x-10">
        {/* Actions */}
        <div className="flex flex-col w-full">
          <Assistant />
          <Thread />
          <Run />
        </div>
        {/* Chat */}
        <div className="w-full">
          <ChatContainer />
        </div>
        <div className="w-full">
          <StockPricesContainer />
        </div>
      </div>
    </main>
  );
}
