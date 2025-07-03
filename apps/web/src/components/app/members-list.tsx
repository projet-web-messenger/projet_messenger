export function MembersList() {
  // Données de test pour montrer le composant
  const members = [
    { id: 1, name: "John Doe", status: "online", avatar: "🧑‍💻" },
    { id: 2, name: "Jane Smith", status: "away", avatar: "👩‍💼" },
    { id: 3, name: "Bob Wilson", status: "offline", avatar: "👨‍🔬" },
  ];

  return (
    <div className="space-y-2">
      {members.map((member) => (
        <div key={member.id} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
          <div className="relative">
            <span className="text-sm">{member.avatar}</span>
            <div
              className={`-bottom-0.5 -right-0.5 absolute h-2.5 w-2.5 rounded-full border border-white dark:border-gray-900 ${
                member.status === "online" ? "bg-green-500" : member.status === "away" ? "bg-yellow-500" : "bg-gray-400"
              }`}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-gray-900 text-sm dark:text-white">{member.name}</p>
            <p className="text-gray-500 text-xs capitalize dark:text-gray-400">{member.status}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
