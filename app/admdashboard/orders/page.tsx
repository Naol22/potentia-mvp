import OrderTable from "@/components/OrderTable";

export default async function OrdersPage() {
  const res = await fetch("/api/adm/orders", {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <div className="text-red-500">Error fetching orders: {res.statusText}</div>
    );
  }

  const orders = await res.json();

  return (
    <div>
      <h1 className="text-2xl font-bold text-blue-900 mb-4">Orders Management</h1>
      <OrderTable orders={orders} />
    </div>
  );
}