import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const { planId, hashRateId, paymentMethod, btcAddress, minerId, facilityId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Base configuration
    const paymentMethodTypes: string[] = ["card"];

    // Add selected payment method if not card
    if (paymentMethod !== "card") {
      switch (paymentMethod) {
        case "paypal":
          paymentMethodTypes.push("paypal");
          break;
        case "apple_pay":
        case "google_pay":
          break;
        case "klarna":
          paymentMethodTypes.push("klarna");
          break;
        case "affirm":
          paymentMethodTypes.push("affirm");
          break;
        case "alipay":
          paymentMethodTypes.push("alipay");
          break;
        case "wechat_pay":
          paymentMethodTypes.push("wechat_pay");
          break;
        default:
          paymentMethodTypes.push(paymentMethod);
      }
    }

    // Create checkout session with subscription configuration
    const session = await stripe.checkout.sessions.create({
      payment_method_types:
        paymentMethodTypes as Stripe.Checkout.SessionCreateParams.PaymentMethodType[],
      line_items: [
        {
          price: planId, // This should be a recurring price ID in Stripe
          quantity: 1,
        },
        {
          price: hashRateId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel`,
      automatic_tax: { enabled: true },
      metadata: {
        userId: userId,
        planId: planId,
        hashRateId: hashRateId,
        btcAddress: btcAddress,
        minerId: minerId || '',
        facilityId: facilityId || '',
      },
      subscription_data: {
        metadata: {
          userId: userId,
          planId: planId,
          description: 'Mining subscription'
        }
      }
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Stripe error:", error);
    return NextResponse.json(
      { error: "Error creating checkout session" },
      { status: 500 }
    );
  }
}
