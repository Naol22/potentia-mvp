import { NextResponse } from 'next/server';

// This data is only accessible server-side
const virtualTours = [
  { id: 'ethiopia', url: 'https://bit.ly/vistatour2' },
  { id: 'dubai', url: 'https://bit.ly/vistatour2' },
  { id: 'texas', url: 'https://bit.ly/vistatour2' },
  { id: 'paraguay', url: 'https://bit.ly/vistatour2' },
  { id: 'georgia', url: 'https://bit.ly/vistatour2' },
  { id: 'finland', url: 'https://bit.ly/vistatour2' },
];

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  // Access the id from context.params
  const { id } = context.params;
  
  if (!id) {
    return new Response('Tour ID is required', { status: 400 });
  }
  
  // Find the tour by ID
  const tour = virtualTours.find(tour => tour.id === id);
  
  if (!tour) {
    // If tour not found, redirect to a 404 page or return an error
    return new Response('Tour not found', { status: 404 });
  }
  
  // Instead of returning the URL directly, we'll redirect to it
  // This way the actual URL is never exposed in the client
  return NextResponse.redirect(tour.url);
}