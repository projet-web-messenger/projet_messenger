
# 📬 Projet Messenger – Branch `feature/graphql-v3`

## 📥 Clonage du projet

```bash
git clone https://github.com/projet-web-messenger/projet_messenger.git
```

## 🛠️ Préparation

- Se placer dans le dossier du projet :
  ```bash
  cd projet_messenger
  ```

- Se positionner sur la branche `feature/graphql-v3` :
  ```bash
  git checkout feature/graphql-v3
  ```

- Créer et configurer deux fichiers `.env` :
  - Un fichier `.env` dans `apps/backend`
  - Un fichier `.env` dans `apps/web`

> ⚠️ Assurez-vous que chaque fichier `.env` contient toutes les variables d’environnement nécessaires.

- Installer les dépendances :
  ```bash
  pnpm install
  ```

---

## 🚀 Lancement de l'application

### 1. Lancer Docker Desktop

- Ouvrir l’application **Docker Desktop** et s'assurer qu’elle est bien **en marche** et **connectée**.

### 2. Lancer les services back-end

- Se rendre dans le dossier `apps/backend` :
  ```bash
  cd apps/backend
  ```

- Démarrer les conteneurs :
  ```bash
  docker-compose up
  ```

### 3. Initialiser la base de données Prisma

- Ouvrir un **nouveau terminal**, puis :
  ```bash
  cd apps/backend
  npx prisma generate
  npx prisma migrate dev --name init
  ```

### 4. Lancer l’application complète

- Revenir à la racine du projet :
  ```bash
  cd ../..
  pnpm dev
  ```

---

## ✅ Résumé des commandes

```bash
git clone https://github.com/projet-web-messenger/projet_messenger.git
cd projet_messenger
git checkout feature/graphql-v3
pnpm install
```

```bash
# Terminal 1
cd apps/backend
docker-compose up
```

```bash
# Terminal 2
cd apps/backend
npx prisma generate
npx prisma migrate dev --name init
```

```bash
# Retour à la racine du projet
cd ../..
pnpm dev
```

---

## 🐳 Remarques

- L’application **Docker Desktop** doit être **lancée et connectée** avant d'exécuter `docker-compose up`.
- La base de données sera automatiquement gérée par Docker à l'aide du fichier `docker-compose.yml` dans `apps/backend`.
