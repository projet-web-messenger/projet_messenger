"use client";

const users = [
  { id: 1, name: "Alice Martin", email: "alice@example.com", status: "online" },
  { id: 2, name: "Jean Dupont", email: "jean@example.com", status: "offline" },
  { id: 3, name: "Fatima N'Diaye", email: "fatima@example.com", status: "online" },
  { id: 4, name: "Leo Zhang", email: "leo@example.com", status: "away" },
];

export default function UserListPage() {
  return (
    <div className="main flex h-screen w-screen flex-col items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] px-4 py-10">
      {/* Main Card */}
      <div className="mx-8 w-6/7 max-w-5xl rounded-3xl bg-white/10 p-8 shadow-xl backdrop-blur-xl">
        <h1 className="mb-6 text-center font-bold text-3xl text-white">User List</h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between rounded-xl bg-white/10 px-6 py-4 text-white shadow-md">
              <div>
                <h2 className="font-semibold text-lg">{user.name}</h2>
                <p className="text-blue-100 text-sm">{user.email}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 font-medium text-sm ${
                  user.status === "online"
                    ? "bg-green-500/30 text-green-300"
                    : user.status === "offline"
                      ? "bg-red-500/30 text-red-300"
                      : "bg-yellow-500/30 text-yellow-200"
                }`}
              >
                {user.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
