import { NextResponse } from "next/server";
import { supabase } from "@/utilis/supaBaseClient";

// This function will be triggered by Vercel Cron
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
    
    // Update orders that have expired
    const { error: expiredError } = await supabase
      .from('orders')
      .update({ status: 'expired' })
      .neq('status', 'expired')
      .lt('end_date', now);
    
    if (expiredError) {
      console.error('Error updating expired orders:', expiredError);
      return NextResponse.json({ error: expiredError.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Order statuses updated successfully",
      timestamp: now
    });
  } catch (error) {
    console.error('Unexpected error in CRON job:', error);
    return NextResponse.json({ 
      error: "An unexpected error occurred" 
    }, { status: 500 });
  }
}