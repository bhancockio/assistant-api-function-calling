import axios from "axios";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return Response.json({ error: "No symbol provided" }, { status: 400 });
  }

  const finnhubToken = process.env.FINNHUB_API_KEY;

  if (!finnhubToken) {
    return Response.json(
      { error: "No finnhub token provided" },
      { status: 400 }
    );
  }

  const response = await axios.get(
    `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finnhubToken}`
  );

  if (response.status !== 200) {
    return Response.json({
      error: "Something went wrong fetching price",
      price: null,
      success: false,
    });
  }

  return Response.json({ price: response.data.c as number, success: true });
}
