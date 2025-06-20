"use client";

export default function UserProfilePage() {
  return (
    <div className="flex min-h-screen w-screen flex-col items-center bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] p-6 text-white">
      <header className="mb-8 font-bold text-3xl">Mon Profil</header>

      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white/10 p-6 shadow-lg backdrop-blur-lg">
        {/* Avatar + nom */}
        <div className="flex flex-col items-center">
          <img src="https://i.pravatar.cc/100" alt="Avatar" className="mb-4 h-24 w-24 rounded-full border-4 border-blue-500 shadow-md" />
          <h2 className="font-semibold text-xl">Jean Dupont</h2>
          <p className="text-blue-200 text-sm">Disponible</p>
        </div>

        {/* Infos utilisateur */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between border-white/10 border-b py-2">
            <span className="text-blue-300">Email</span>
            <span>jean.dupont@email.com</span>
          </div>
          <div className="flex justify-between border-white/10 border-b py-2">
            <span className="text-blue-300">Téléphone</span>
            <span>+33 6 12 34 56 78</span>
          </div>
          <div className="flex justify-between border-white/10 border-b py-2">
            <span className="text-blue-300">Statut</span>
            <span>En ligne</span>
          </div>
        </div>

        {/* Bouton Modifier */}
        <div className="text-center">
          <button type="button" className="rounded-md bg-blue-500 px-4 py-2 font-medium text-white transition hover:bg-blue-600">
            Modifier le profil
          </button>
        </div>
      </div>
    </div>
  );
}
