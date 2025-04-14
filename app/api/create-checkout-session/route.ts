export async function POST() {
  return new Response(JSON.stringify({ message: "Webhook temporarily disabled" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// import { NextResponse } from "next/server";
// import Stripe from "stripe";
// import { auth } from "@clerk/nextjs/server";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2025-02-24.acacia",
// });

// export async function POST(req: Request) {
//   try {
//     const { userId } = await auth();
//     const { planId, hashRateId, paymentMethod } = await req.json();

//     if (!userId) {
//       return NextResponse.json(
//         { error: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     // Base configuration
//     const paymentMethodTypes: string[] = ["card"];

//     // Add selected payment method if not card
//     if (paymentMethod !== "card") {
//       switch (paymentMethod) {
//         case "paypal":
//           paymentMethodTypes.push("paypal");
//           break;
//         case "apple_pay":
//         case "google_pay":
//           // Apple Pay and Google Pay are handled through the card payment method
//           // No need to add them to paymentMethodTypes
//           break;
//         case "klarna":
//           paymentMethodTypes.push("klarna");
//           break;
//         case "affirm":
//           paymentMethodTypes.push("affirm");
//           break;
//         case "alipay":
//           paymentMethodTypes.push("alipay");
//           break;
//         case "wechat_pay":
//           paymentMethodTypes.push("wechat_pay");
//           break;
//         default:
//           paymentMethodTypes.push(paymentMethod);
//       }
//     }

//     // Create checkout session with product IDs and user metadata
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types:
//         paymentMethodTypes as Stripe.Checkout.SessionCreateParams.PaymentMethodType[],
//       line_items: [
//         {
//           price: planId,
//           quantity: 1,
//         },
//         {
//           price: hashRateId,
//           quantity: 1,
//         },
//       ],
//       mode: "payment",
//       success_url: `${process.env.NEXT_PUBLIC_URL}/success`,
//       cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel`,
//       automatic_tax: { enabled: true },
//       metadata: {
//         userId: userId,
//         planId: planId,
//         hashRateId: hashRateId
//       }
//     });

//     return NextResponse.json({ sessionId: session.id });
//   } catch (error) {
//     console.error("Stripe error:", error);
//     return NextResponse.json(
//       { error: "Error creating checkout session" },
//       { status: 500 }
//     );
//   }
// }
