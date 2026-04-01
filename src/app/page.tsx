import { redirect } from 'next/navigation';

export default function Home() {
  // In a real implementation we would check for a session.
  // For now, redirect straight to the daily tab as if authenticated.
  redirect('/daily');
}
