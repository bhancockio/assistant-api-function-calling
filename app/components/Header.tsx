"use client";

import { assistantAtom, threadAtom, runStateAtom, runAtom } from "@/atoms";
import { useAtom } from "jotai";
import React from "react";

function Header() {
  const [assistant] = useAtom(assistantAtom);
  const [thread] = useAtom(threadAtom);
  const [run] = useAtom(runAtom);
  const [runState] = useAtom(runStateAtom);

  return (
    <div className="flex flex-row justify-between text-xl font-semibold">
      <div className="flex-1 flex flex-col items-center">
        <span>Assistant:</span>
        <span className="text-blue-500 text-xs">{assistant?.id}</span>
      </div>
      <div className="flex-1 flex flex-col items-center">
        <span>Thread:</span>
        <span className="text-blue-500 text-xs">{thread?.id}</span>
      </div>
      <div className="flex-1 flex flex-col items-center">
        <span>Run:</span>
        <span className="text-blue-500 text-xs">{run?.id}</span>
      </div>
      <div className="flex-1 flex flex-col items-center">
        <span>Run State:</span>
        <span className="text-blue-500 text-xs">{runState}</span>
      </div>
    </div>
  );
}

export default Header;
