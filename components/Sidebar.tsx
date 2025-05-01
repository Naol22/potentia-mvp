import Link from "next/link";

export default function Sidebar() {
  const sections = [
    { href: "/admdashboard/users", label: "Users" },
    { href: "/admdashboard/transactions", label: "Transactions" },
    { href: "/admdashboard/subscriptions", label: "Subscriptions" },
    { href: "/admdashboard/orders", label: "Orders" },
    { href: "/admdashboard/survey-responses", label: "Survey Responses" },
  ];

  return (
    <aside className="w-64 bg-gray-100 p-4 shadow-md">
      <nav>
        <ul className="space-y-2">
          {sections.map((section) => (
            <li key={section.href}>
              <Link
                href={section.href}
                className="block rounded-md px-4 py-2 text-gray-700 hover:bg-blue-500 hover:text-white transition-colors"
              >
                {section.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}