// // import { WebhookEvent } from '@clerk/nextjs/server'
// import { Webhook } from 'svix'
// import { headers } from 'next/headers'
// import { supabase } from '@/utilis/supaBaseClient'

// type UserWebhookEvent = {
//   data: {
//     id: string;
//     email_addresses: Array<{ email_address: string }>;
//     created_at: number;
//   };
//   type: string; 
// };

// export async function POST(req: Request) {
//   const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

//   if (!WEBHOOK_SECRET) {
//     throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
//   }

//   // Fix: await the headers
//   const headerPayload = await headers();
//   const svix_id = headerPayload.get("svix-id");
//   const svix_timestamp = headerPayload.get("svix-timestamp");
//   const svix_signature = headerPayload.get("svix-signature");

//   if (!svix_id || !svix_timestamp || !svix_signature) {
//     return new Response('Error occured -- no svix headers', {
//       status: 400
//     })
//   }

//   const payload = await req.json()
//   const body = JSON.stringify(payload);

//   const wh = new Webhook(WEBHOOK_SECRET);

//   try {
//     const evt = wh.verify(body, {
//       "svix-id": svix_id,
//       "svix-timestamp": svix_timestamp,
//       "svix-signature": svix_signature,
//     }) as UserWebhookEvent  // Changed type assertion here

//     const { id, email_addresses, created_at } = evt.data

//     // Only handle user creation event
//     if (evt.type === 'user.created') {
//       const { error } = await supabase
//         .from('users')
//         .insert({
//           id,
//           email: email_addresses[0].email_address,
//           created_at: new Date(created_at).toISOString(),
//           updated_at: new Date(created_at).toISOString()
//         })

//       if (error) {
//         console.error('Error creating user in Supabase:', error)
//         return new Response('Error creating user', { status: 500 })
//       }

//       return new Response('User created in Supabase', { status: 201 })
//     }

//     return new Response('Webhook received', { status: 200 })
//   } catch (err) {
//     console.error('Error verifying webhook:', err)
//     return new Response('Error occurred', {
//       status: 400
//     })
//   }
// }