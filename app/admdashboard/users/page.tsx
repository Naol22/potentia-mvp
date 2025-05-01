import UserTable from "@/components/UserTable";

export default async function UsersPage() {
  const res = await fetch("/api/adm/users", {
    cache: "no-store", // Ensures fresh data
  });

  if (!res.ok) {
    return (
      <div className="text-red-500">Error fetching users: {res.statusText}</div>
    );
  }

  const users = await res.json();

  return (
    <div>
      <h1 className="text-2xl font-bold text-blue-900 mb-4">Users Management</h1>
      <UserTable users={users} />
    </div>
  );
}