import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const now = new Date();
    const nowISOString = now.toISOString();

    const { data: ordersToCheck, error: fetchError } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        plan_id,
        next_billing_date,
        transaction_id,
        status,
        is_active,
        auto_renew
      `)
      .eq('is_active', true)
      .neq('status', 'expired')
      .lte('next_billing_date', nowISOString);

    if (fetchError) {
      console.error('Error fetching orders:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!ordersToCheck || ordersToCheck.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No orders to process",
        timestamp: nowISOString,
        ordersProcessed: 0,
      });
    }

    const expiredOrderIds: string[] = [];
    const errors: string[] = [];

    for (const order of ordersToCheck) {
      if (order.auto_renew) {
        // Future-proofing: If auto_renew is true, we could initiate a new payment here
        // For now, since auto_renew is always false, we skip this
        continue;
      } else {
        // No auto-renewal, mark as expired
        expiredOrderIds.push(order.id);

        // Placeholder for user notification
        // await notifyUser(order.user_id, order.id, 'Your subscription has expired. Please renew to continue mining.');
      }
    }

    if (expiredOrderIds.length > 0) {
      const { error: expireError } = await supabase
        .from('orders')
        .update({ status: 'expired', is_active: false })
        .in('id', expiredOrderIds);

      if (expireError) {
        console.error('Error batch expiring orders:', expireError);
        errors.push(`Failed to expire orders: ${expireError.message}`);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        message: "Order status updates completed with errors",
        timestamp: nowISOString,
        ordersProcessed: ordersToCheck.length,
        errors,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Order statuses updated successfully",
      timestamp: nowISOString,
      ordersProcessed: ordersToCheck.length,
    });
  } catch (error) {
    console.error('Unexpected error in CRON job:', error);
    return NextResponse.json({
      error: "An unexpected error occurred",
    }, { status: 500 });
  }
}