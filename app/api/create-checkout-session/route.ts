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
      if (paymentMethod === 'paypal') {
        paymentMethodTypes.push('paypal');
      } else if (paymentMethod !== 'apple_pay' && paymentMethod !== 'google_pay') {
        // For methods other than Apple/Google Pay (which use card)
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