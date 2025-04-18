import { NextResponse } from "next/server";
import { supabase } from "@/utils/supaBaseClient";

export async function GET() {
  try {
    const now = new Date().toISOString();
    
    // Update orders that have started but not yet marked as active
    const { error: activeError } = await supabase
      .from('orders')
      .update({ status: 'active' })
      .eq('status', 'completed')
      .lt('start_date', now)
      .gt('end_date', now);
    
    if (activeError) {
      console.error('Error updating active orders:', activeError);
      return NextResponse.json({ error: activeError.message }, { status: 500 });
    }

    // Get orders that need status check
    const { data: ordersToCheck, error: fetchError } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        plan_id,
        end_date,
        transaction_id,
        status
      `)
      .neq('status', 'expired')
      .lt('end_date', now);

    if (fetchError) {
      console.error('Error fetching orders:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Process each order
    for (const order of ordersToCheck || []) {
      // Check for recent transaction after the current end_date
      const { data: recentTransaction } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', order.user_id)
        .eq('plan_id', order.plan_id)
        .eq('status', 'completed')
        .gt('created_at', order.end_date)
        .order('created_at', { ascending: false })
        .limit(1);

      if (recentTransaction && recentTransaction.length > 0) {
        // New payment found, extend subscription
        const newEndDate = new Date(order.end_date);
        newEndDate.setMonth(newEndDate.getMonth() + 1);

        const { error: updateError } = await supabase
          .from('orders')
          .update({
            status: 'active',
            end_date: newEndDate.toISOString(),
            transaction_id: recentTransaction[0].id
          })
          .eq('id', order.id);

        if (updateError) {
          console.error(`Error updating order ${order.id}:`, updateError);
        }
      } else {
        // No new payment, mark as expired
        const { error: expireError } = await supabase
          .from('orders')
          .update({ status: 'expired' })
          .eq('id', order.id);

        if (expireError) {
          console.error(`Error expiring order ${order.id}:`, expireError);
        }
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Order statuses updated successfully",
      timestamp: now,
      ordersProcessed: ordersToCheck?.length || 0
    });
  } catch (error) {
    console.error('Unexpected error in CRON job:', error);
    return NextResponse.json({ 
      error: "An unexpected error occurred" 
    }, { status: 500 });
  }
}