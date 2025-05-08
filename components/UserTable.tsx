interface User {
  id: number;
  email: string;
  name: string;
}

interface UserTableProps {
  users: User[];
}

export default function UserTable({ users }: UserTableProps) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-200">
          <th className="p-2 text-left text-gray-700">ID</th>
          <th className="p-2 text-left text-gray-700">Email</th>
          <th className="p-2 text-left text-gray-700">Name</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id} className="border-b hover:bg-gray-50">
            <td className="p-2">{user.id}</td>
            <td className="p-2">{user.email}</td>
            <td className="p-2">{user.name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}