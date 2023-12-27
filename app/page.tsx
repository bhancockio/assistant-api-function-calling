"use client";

import Header from "./components/Header";
import Assistant from "./components/Assistant";
import Thread from "./components/Thread";
import Run from "./components/Run";
import ChatContainer from "./components/ChatContainer";
import StockPricesContainer from "./components/StockPricesContainer";

export default function Home() {
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
