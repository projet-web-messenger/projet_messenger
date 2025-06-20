"use client";

import { useState } from "react";

export default function UserProfilePage() {
  // État utilisateur simulé
  const [profile, setProfile] = useState({
    name: "Jean Dupont",
    email: "jean.dupont@email.com",
    phone: "+33 6 12 34 56 78",
    status: "Disponible",
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // Simule la sauvegarde (tu peux intégrer un appel API ici)
    setIsEditing(false);
    // Profil mis à jour (ajoute ici une notification utilisateur si besoin)
  };

  return (
    <div className="flex min-h-screen w-screen flex-col items-center bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] p-6 text-white">
      <header className="mb-8 font-bold text-3xl">Mon Profil</header>

      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white/10 p-6 shadow-lg backdrop-blur-lg">
        {/* Avatar + nom */}
        <div className="flex flex-col items-center">
          <img src="https://i.pravatar.cc/100" alt="Avatar" className="mb-4 h-24 w-24 rounded-full border-4 border-blue-500 shadow-md" />
          {!isEditing ? (
            <>
              <h2 className="font-semibold text-xl">{profile.name}</h2>
              <p className="text-blue-200 text-sm">{profile.status}</p>
            </>
          ) : (
            <>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                className="mb-1 w-full rounded-md bg-white/10 px-3 py-1 text-white placeholder:text-blue-300 focus:outline-none"
                placeholder="Nom"
              />
              <input
                type="text"
                name="status"
                value={profile.status}
                onChange={handleChange}
                className="w-full rounded-md bg-white/10 px-3 py-1 text-white placeholder:text-blue-300 focus:outline-none"
                placeholder="Statut"
              />
            </>
          )}
        </div>

        {/* Infos utilisateur */}
        <div className="space-y-3 text-sm">
          {["email", "phone"].map((field) =>
            isEditing ? (
              <input
                key={field}
                type="text"
                name={field}
                value={profile[field as keyof typeof profile]}
                onChange={handleChange}
                placeholder={field === "email" ? "Email" : "Téléphone"}
                className="w-full rounded-md bg-white/10 px-3 py-2 text-white placeholder:text-blue-300 focus:outline-none"
              />
            ) : (
              <div key={field} className="flex justify-between border-white/10 border-b py-2">
                <span className="text-blue-300 capitalize">{field === "email" ? "Email" : "Téléphone"}</span>
                <span>{profile[field as keyof typeof profile]}</span>
              </div>
            ),
          )}
        </div>

        {/* Actions */}
        <div className="text-center">
          {!isEditing ? (
            <button
              type="button"
              className="rounded-md bg-blue-500 px-4 py-2 font-medium text-white transition hover:bg-blue-600"
              onClick={() => setIsEditing(true)}
            >
              Modifier le profil
            </button>
          ) : (
            <div className="space-x-4">
              <button type="button" className="rounded-md bg-green-500 px-4 py-2 font-medium text-white transition hover:bg-green-600" onClick={handleSave}>
                Enregistrer
              </button>
              <button
                className="rounded-md bg-gray-500 px-4 py-2 font-medium text-white transition hover:bg-gray-600"
                type="button"
                onClick={() => setIsEditing(false)}
              >
                Annuler
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
