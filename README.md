# MON ARTISAN — Votre artisan, à portée de main

Application de mise en relation entre clients et artisans (PWA — Next.js + Supabase),
conforme au cahier des charges `cahierdecharger.md`.

## Stack technique

- **Next.js 16** (App Router, Turbopack, Proxy) + React 19 + TypeScript
- **Supabase** : PostgreSQL, Auth, Storage, Realtime (messagerie & notifications)
- **Tailwind CSS v4**
- **PWA** : `manifest.json` + service worker (`public/sw.js`), installable sur téléphone,
  tablette et ordinateur.

## Mise en route

### 1. Créer un projet Supabase

Sur [supabase.com](https://supabase.com), créez un nouveau projet puis récupérez :
- l'URL du projet,
- la clé `anon` publique,
- la clé `service_role` (privée, jamais exposée au client).

### 2. Appliquer le schéma de base de données

Dans l'éditeur SQL de Supabase (ou via la CLI `supabase db push`), exécutez dans l'ordre
les fichiers du dossier `supabase/migrations` :

1. `0001_init.sql` — tables, enums, triggers, index
2. `0002_rls.sql` — Row Level Security (une politique par table)
3. `0003_seed.sql` — catégories de métiers, buckets de stockage, activation du Realtime

### 3. Variables d'environnement

Copiez `env.example` vers `.env.local` et renseignez vos clés Supabase ainsi que le numéro
WhatsApp de l'administrateur :

```bash
cp env.example .env.local
```

### 4. Installer et lancer

```bash
npm install
npm run dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

### 5. Générer les icônes PWA (déjà fait, à relancer si besoin)

```bash
node scripts/gen-icons.mjs
```

## Structure du projet

```
app/
  (public)/          Accueil, recherche d'artisans, catégories, page artisan publique
  (auth)/             Inscription, connexion, mot de passe oublié / réinitialisation
  client/              Espace client (demandes, prestations, favoris, avis, profil)
  artisan/             Espace artisan (demandes reçues, devis, prestations, profil pro, documents)
  admin/               Interface d'administration (utilisateurs, artisans, catégories,
                       demandes, prestations, avis, réclamations, paiements)
  messages/            Messagerie temps réel partagée client/artisan
  api/                 Route Handlers (mutations avec notifications serveur)
components/
  layout/              Navbar, en-têtes de tableau de bord, shell de navigation
  shared/               Composants réutilisables (cartes, formulaires, actions)
lib/
  supabase/            Clients Supabase (navigateur, serveur, admin, proxy/session)
  data/                Requêtes de lecture côté serveur
  types/               Types TypeScript reflétant le schéma SQL
  utils/               Formatage (FCFA, dates, distances, libellés de statut)
supabase/migrations/    Schéma SQL complet (tables, RLS, seed, storage, realtime)
public/                 Manifest PWA, service worker, icônes
```

## Fonctionnalités couvertes (version MVP du cahier des charges)

- Inscription/connexion client & artisan (email ou téléphone), mot de passe oublié
- Profils client et artisan complets (photo, métiers, zones, tarifs, portfolio, disponibilité)
- Recherche d'artisans par métier, ville, note, artisan vérifié
- Publication de demandes multi-prestations avec photos/vidéos, budget, urgence
- Réception des demandes par les artisans concernés, réponse (intéressé/refus/infos)
- Devis détaillés (main d'œuvre, matériaux, frais, délai) et négociation
- Suivi complet d'une prestation (publiée → devis accepté → programmée → en route →
  en cours → terminée → payée → clôturée)
- Messagerie temps réel avec pièces jointes
- Notifications en temps réel (nouvelle demande, devis, message, etc.)
- Notation et avis (avec modération admin)
- Favoris, réclamations/litiges
- Interface d'administration complète (utilisateurs, vérification artisans, catégories,
  demandes, prestations, avis, réclamations, paiements)
- Bouton WhatsApp flottant animé vers l'administrateur
- PWA installable (manifest + service worker + mode hors-ligne basique)

## Notes sur la sécurité

Toute la logique d'autorisation est appliquée par **Row Level Security** côté Postgres
(`supabase/migrations/0002_rls.sql`) : chaque utilisateur ne peut lire/écrire que ce qui
le concerne. Les Route Handlers (`app/api/**`) n'utilisent la clé `service_role` que pour
l'envoi de notifications, jamais pour contourner les autorisations métier.
