import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia' // Use a stable API version
});

export async function POST(req: Request) {
  try {
    const { planId, hashRateId, paymentMethod } = await req.json();

    // Base configuration
    let paymentMethodTypes: string[] = ['card']; // Default always included
    
    // Add selected payment method if not card
    if (paymentMethod !== 'card') {
      switch (paymentMethod) {
        case 'paypal':
          paymentMethodTypes.push('paypal');
          break;
        case 'apple_pay':
        case 'google_pay':
          // Apple Pay and Google Pay are handled through the card payment method
          // No need to add them to paymentMethodTypes
          break;
        case 'klarna':
          paymentMethodTypes.push('klarna');
          break;
        case 'affirm':
          paymentMethodTypes.push('affirm');
          break;
        case 'alipay':
          paymentMethodTypes.push('alipay');
          break;
        case 'wechat_pay':
          paymentMethodTypes.push('wechat_pay');
          break;
        default:
          paymentMethodTypes.push(paymentMethod);
      }
    }

    // Create checkout session with product IDs
    const session = await stripe.checkout.sessions.create({
      payment_method_types: paymentMethodTypes as Stripe.Checkout.SessionCreateParams.PaymentMethodType[], // Cast to correct Stripe type
      line_items: [
        {
          price: planId,
          quantity: 1,
        },
        {
          price: hashRateId,
          quantity: 1,
        }
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel`,
      // Enable automatic tax calculation if needed
      automatic_tax: { enabled: true }
      // Remove the incorrect payment_method_options
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe error:', error);
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    );
  }
}