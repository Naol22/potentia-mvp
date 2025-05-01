import TransactionTable from "@/components/TransactionTable";

export default async function TransactionsPage() {
  const res = await fetch("/api/adm/transactions", {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <div className="text-red-500">Error fetching transactions: {res.statusText}</div>
    );
  }

  const transactions = await res.json();

  return (
    <div>
      <h1 className="text-2xl font-bold text-blue-900 mb-4">Transactions Management</h1>
      <TransactionTable transactions={transactions} />
    </div>
  );
}