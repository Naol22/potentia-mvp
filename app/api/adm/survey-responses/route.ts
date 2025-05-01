
import { NextResponse } from "next/server";
import { supabase } from "@/utils/supaBaseClient";

export async function GET() {
  

  const { data, error } = await supabase
    .from("survey_responses")
    .select("*, users(*), surveys(*)")
    .order("id", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}