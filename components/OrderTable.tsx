interface Order {
  id: number;
  userId: number;
  status: string;
}

interface OrderTableProps {
  orders: Order[];
}

export default function OrderTable({ orders }: OrderTableProps) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-200">
          <th className="p-2 text-left text-gray-700">ID</th>
          <th className="p-2 text-left text-gray-700">User ID</th>
          <th className="p-2 text-left text-gray-700">Status</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order.id} className="border-b hover:bg-gray-50">
            <td className="p-2">{order.id}</td>
            <td className="p-2">{order.userId}</td>
            <td className="p-2">{order.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}