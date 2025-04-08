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
      const { userId, planId } = session.metadata || {}

      // Store the transaction in Supabase
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          plan_id: planId,
          amount: session.amount_total! / 100,
          status: 'completed',
          description: `Payment for ${session.metadata?.description || 'Unknown'}`
        })
        .select()
        .single()

      if (transactionError) {
        console.error('Error storing transaction:', transactionError)
        return new Response('Error storing transaction', { status: 500 })
      }

      // Get plan duration for end_date calculation
      const { data: planData, error: planError } = await supabase
        .from('plans')
        .select('duration')
        .eq('id', planId)
        .single()

      if (planError) {
        console.error('Error fetching plan:', planError)
        return new Response('Error fetching plan', { status: 500 })
      }

      // Calculate end date based on duration
      const startDate = new Date()
      let endDate = new Date(startDate)
      const duration = planData.duration
      const durationValue = parseInt(duration)
      
      if (duration.endsWith('d')) {
        endDate.setDate(startDate.getDate() + durationValue)
      } else if (duration.endsWith('m')) {
        endDate.setMonth(startDate.getMonth() + durationValue)
      } else if (duration.endsWith('y')) {
        endDate.setFullYear(startDate.getFullYear() + durationValue)
      }

      // Create user_plan record
      const { error: userPlanError } = await supabase
        .from('user_plans')
        .insert({
          user_id: userId,
          plan_id: planId,
          transaction_id: transactionData.id,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        })

      if (userPlanError) {
        console.error('Error creating user plan:', userPlanError)
        return new Response('Error creating user plan', { status: 500 })
      }
    }

    return new Response('Webhook received', { status: 200 })
  } catch (err) {
    console.error('Error processing webhook:', err)
    return new Response('Webhook error', { status: 400 })
  }
}