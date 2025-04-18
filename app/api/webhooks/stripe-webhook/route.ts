

import { headers } from 'next/headers'
import Stripe from 'stripe'
import { supabase } from '@/utilis/supaBaseClient'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia"
})

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get('stripe-signature')!

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const { userId, planId, btcAddress, minerId, facilityId } = session.metadata || {}

      // Store the transaction in Supabase
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          plan_id: planId,
          amount: session.amount_total! / 100,
          status: 'completed',
          stripe_payment_id: session.payment_intent as string,
          description: `Payment for ${session.metadata?.description || 'Unknown'}`
        })
        .select()
        .single()

      if (transactionError) {
        console.error('Error storing transaction:', transactionError)
        return new Response('Error storing transaction', { status: 500 })
      }

      // Calculate start and end dates (one month duration)
      const startDate = new Date()
      const endDate = new Date(startDate)
      endDate.setMonth(startDate.getMonth() + 1)

      // Create order record
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          plan_id: planId,
          facility_id: facilityId || null,
          miner_id: minerId || null,
          btc_address: btcAddress,
          stripe_payment_id: session.payment_intent as string,
          transaction_id: transactionData.id,
          status: 'completed',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        })

      if (orderError) {
        console.error('Error creating order:', orderError)
        return new Response('Error creating order', { status: 500 })
      }
    }

    return new Response('Webhook received', { status: 200 })
  } catch (err) {
    console.error('Error processing webhook:', err)
    return new Response('Webhook error', { status: 400 })
  }
}