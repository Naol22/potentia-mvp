

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

    // Handle initial checkout completion
    if (event.type === 'checkout.session.completed') {
      // Your existing checkout.session.completed handling code
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
    
    // Handle recurring subscription payments
    else if (event.type === 'invoice.paid') {
      const invoice = event.data.object as Stripe.Invoice
      
      // Get subscription details to find the customer
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
      
      // Extract user ID and plan ID directly from subscription metadata
      const { userId, planId } = subscription.metadata
      
      if (!userId || !planId) {
        console.error('Missing userId or planId in subscription metadata')
        return new Response('Missing metadata', { status: 400 })
      }
      
      // Store the transaction
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          plan_id: planId,
          amount: invoice.amount_paid / 100,
          status: 'completed',
          stripe_payment_id: invoice.payment_intent as string,
          description: `Recurring payment for ${subscription.metadata.description || 'subscription'}`
        })
        .select()
        .single()
        
      if (transactionError) {
        console.error('Error storing transaction:', transactionError)
        return new Response('Error storing transaction', { status: 500 })
      }
      
      // Find the existing order to update
      const { data: existingOrder, error: fetchError } = await supabase
        .from('orders')
        .select('id, end_date')
        .eq('user_id', userId)
        .eq('plan_id', planId)
        .order('created_at', { ascending: false })
        .limit(1)
        
      if (fetchError || !existingOrder || existingOrder.length === 0) {
        console.error('Error finding existing order:', fetchError)
        return new Response('Error finding order', { status: 500 })
      }
      
      // Calculate new end date (extend by 1 month from previous end date)
      const currentEndDate = new Date(existingOrder[0].end_date)
      const newEndDate = new Date(currentEndDate)
      newEndDate.setMonth(newEndDate.getMonth() + 1)
      
      // Update the order with new end date and transaction
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'active',
          transaction_id: transactionData.id,
          stripe_payment_id: invoice.payment_intent as string,
          end_date: newEndDate.toISOString()
        })
        .eq('id', existingOrder[0].id)
        
      if (updateError) {
        console.error('Error updating order:', updateError)
        return new Response('Error updating order', { status: 500 })
      }
    }

    return new Response('Webhook received', { status: 200 })
  } catch (err) {
    console.error('Error processing webhook:', err)
    return new Response('Webhook error', { status: 400 })
  }
}