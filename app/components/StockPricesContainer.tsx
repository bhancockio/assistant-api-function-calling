import { stockPricesAtom } from "@/atoms";
import { useAtom } from "jotai";
import React from "react";

function StockPricesContainer() {
  const [stockPrices] = useAtom(stockPricesAtom);

  console.log("stockPrices", stockPrices);

  return (
    <div className="flex flex-col w-full">
      <h1 className="text-4xl font-semibold mb-4">Stock Prices</h1>
      {stockPrices.map((stockPrice) => (
        <div className="flex flex-row justify-between" key={stockPrice.symbol}>
          <div>{stockPrice.symbol}</div>
          <div>{stockPrice.price}</div>
        </div>
      ))}
    </div>
  );
}

export default StockPricesContainer;
