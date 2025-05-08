import SubscriptionTable from "@/components/SubscriptionTable";

export default async function SubscriptionsPage() {
  const res = await fetch("/api/adm/subscriptions", {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <div className="text-red-500">Error fetching subscriptions: {res.statusText}</div>
    );
  }

  const subscriptions = await res.json();

  return (
    <div>
      <h1 className="text-2xl font-bold text-blue-900 mb-4">Subscriptions Management</h1>
      <SubscriptionTable subscriptions={subscriptions} />
    </div>
  );
}