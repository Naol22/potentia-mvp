interface Subscription {
  id: number;
  userId: number;
  status: string;
}

interface SubscriptionTableProps {
  subscriptions: Subscription[];
}

export default function SubscriptionTable({ subscriptions }: SubscriptionTableProps) {
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
        {subscriptions.map((subscription) => (
          <tr key={subscription.id} className="border-b hover:bg-gray-50">
            <td className="p-2">{subscription.id}</td>
            <td className="p-2">{subscription.userId}</td>
            <td className="p-2">{subscription.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}