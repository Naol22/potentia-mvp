import { createServerSupabaseClient } from '@/lib/supabase';
import { Miner } from '@/types';
import { NextResponse } from 'next/server';

export async function GET() {
  const client = createServerSupabaseClient();
  try {
    const { data, error } = await client
      .from('miners')
      .select('id, name, details, created_at')
      .order('name', { ascending: true });

      if (error) {
        console.error("[Miners Table API] Error fetching miners:", {
          message: error.message,
          details: error.details,
          code: error.code,
        });
        throw new Error("Failed to fetch miners");
      }
  
      const miners: Miner[] = data;
      console.log("[Miners Plans API] Successfully fetched miners:", miners);
      return NextResponse.json(miners);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("[Miners API] Error fetching miners:", {
          message: error.message,
          stack: error.stack,
        });
        return NextResponse.json(
          {
            error: "Internal Server Error",
            details: error.message,
          },
          { status: 500 }
        );
      }
  
      return NextResponse.json(
        {
          error: "Internal Server Error",
          details: "Unknown error",
        },
        { status: 500 }
      );
    }
  }