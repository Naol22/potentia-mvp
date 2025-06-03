import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { planId, cryptoAddress, paymentMethod } = await request.json();

  try {
    // Placeholder: Replace with actual NowPayments API call
    const response = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NOWPAYMENTS_API_KEY!, // Add to .env.local
      },
      body: JSON.stringify({
        price_amount: 100, // Dynamic from plan.price
        price_currency: "usd",
        pay_currency: "btc",
        order_id: planId,
        order_description: `Hashrate Plan ${planId}`,
        ipn_callback_url: `${request.headers.get("origin")}/api/webhook/nowpayments`, // Webhook for updates
        success_url: `${request.headers.get("origin")}/success`,
        cancel_url: `${request.headers.get("origin")}/checkout`,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create NowPayments invoice");
    }

    const data = await response.json();
    return NextResponse.json({ invoiceUrl: data.invoice_url });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to initiate NowPayments checkout", details: (error as Error).message },
      { status: 500 }
    );
  }
}