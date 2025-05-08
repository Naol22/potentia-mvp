interface Transaction {
  id: number;
  userId: number;
  amount: number;
}

interface TransactionTableProps {
  transactions: Transaction[];
}

export default function TransactionTable({ transactions }: TransactionTableProps) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-200">
          <th className="p-2 text-left text-gray-700">ID</th>
          <th className="p-2 text-left text-gray-700">User ID</th>
          <th className="p-2 text-left text-gray-700">Amount</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((transaction) => (
          <tr key={transaction.id} className="border-b hover:bg-gray-50">
            <td className="p-2">{transaction.id}</td>
            <td className="p-2">{transaction.userId}</td>
            <td className="p-2">{transaction.amount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}