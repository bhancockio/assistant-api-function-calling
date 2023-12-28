import { stockPricesAtom } from "@/atoms";
import { useAtom } from "jotai";
import React from "react";

function StockPricesContainer() {
  const [stockPrices] = useAtom(stockPricesAtom);

  console.log("stockPrices", stockPrices);
  // TODO: Make prettier and show logos

  return (
    <div className="flex flex-col w-full p-4">
      <h1 className="text-4xl font-semibold mb-6 text-gray-800">
        Stock Prices
      </h1>
      <div className="divide-y divide-gray-200">
        {stockPrices.map((stockPrice) => (
          <div
            className="flex flex-row items-center justify-between py-2"
            key={stockPrice.symbol}
          >
            <div className="flex items-center space-x-3">
              {stockPrice.logoURL && (
                <img
                  src={stockPrice.logoURL}
                  alt={`${stockPrice.symbol} logo`}
                  className="h-10 w-10 object-contain"
                />
              )}
              <span className="text-lg font-medium text-gray-600">
                {stockPrice.symbol}
              </span>
            </div>
            <span className="text-lg font-medium text-green-600">
              ${stockPrice.price.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StockPricesContainer;
