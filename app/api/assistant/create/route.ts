import OpenAI from "openai";

export async function GET() {
  const openai = new OpenAI();

  try {
    const assistant = await openai.beta.assistants.create({
      instructions: `
      You are a professional stock analyst. 
      I will ask you for the current price of a stock, and you will tell me the price and provide me a link to the logo of the company.
        `,
      name: "Stock Info Assistant",
      tools: [
        {
          type: "function",
          function: {
            name: "getStockInfo",
            description:
              "Returns the current price and link to the logo of a stock.",
            parameters: {
              type: "object",
              properties: {
                symbol: {
                  type: "string",
                  description: "The stock symbol to get information for.",
                },
                logoURL: {
                  type: "string",
                  description:
                    "The url to the logo of the stock symbol. Example: https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Tesla_logo.png/600px-Tesla_logo.png",
                },
                success: {
                  type: "boolean",
                  description:
                    "Whether or not the function was successful in finding the symbol of the stock and a url to the stock symbol.",
                },
                errorMessage: {
                  type: "string",
                  description:
                    "A message to return to the user if the function was not successful.",
                },
              },
              required: ["symbol", "logoURL", "success"],
            },
          },
        },
      ],
      model: "gpt-4-1106-preview",
    });

    console.log(assistant);

    return Response.json({ assistant: assistant });
  } catch (e) {
    console.log(e);
    return Response.json({ error: e });
  }
}
