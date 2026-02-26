# CLAUDE.md — Trader Joe's Shopping List App

This file provides context for AI assistants working on this codebase.

## Project Overview

A React-based shopping list app themed around Trader Joe's products. Users can manage product lists, mark favorites, build a shopping cart, and share their lists with family via share codes. Data is persisted locally and synced to Firebase Firestore in real time.

**Live deployment:** Netlify (auto-deploys from `master` branch)
**Backend:** Firebase Firestore + Firebase Authentication (Google Sign-In)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19.2.0 (Create React App) |
| Backend/DB | Firebase 12.9.0 (Firestore + Auth) |
| Styling | Custom CSS (App.css) + DaisyUI (Tailwind-based) |
| Testing | React Testing Library + Jest |
| Deployment | Netlify |

---

## Repository Structure

```
trader-joes/
├── public/                  # Static assets & HTML entry point
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Favorites.jsx    # Favorites tab display
│   │   ├── Login.jsx        # Auth screen (Google + share code)
│   │   ├── ProductList.jsx  # Main product grid with filter/search
│   │   ├── ProductSearch.jsx# Legacy/unused component
│   │   ├── ShoppingList.jsx # Cart panel with totals + checkout
│   │   └── productData.js   # Unused placeholder
│   ├── context/
│   │   └── AuthContext.js   # Firebase auth + guest session state
│   ├── data/
│   │   └── sampleData.js    # Default product catalog (12 items)
│   ├── firebase/
│   │   ├── config.js        # Firebase app init from env vars
│   │   └── firebaseService.js # All Firestore read/write helpers
│   ├── utils/
│   │   └── localStorage.js  # Local persistence helpers
│   ├── App.js               # Root component (all core state + logic)
│   ├── App.css              # All custom styles (~1,161 lines)
│   ├── App.test.js          # Placeholder test (needs updating)
│   ├── index.js             # Entry point — wraps App in AuthProvider
│   └── index.css            # Global styles + Tailwind imports
├── .env.example             # Required environment variables template
├── FIREBASE_SETUP.md        # Step-by-step Firebase configuration guide
├── README.md                # CRA boilerplate docs
└── package.json
```

---

## Development Commands

```bash
npm start        # Start dev server at http://localhost:3000
npm test         # Run tests in watch mode
npm run build    # Production build to /build
```

No eject has been performed — stay within CRA conventions.

---

## Environment Setup

Copy `.env.example` to `.env` and populate with Firebase credentials. All variables must use the `REACT_APP_` prefix to be exposed to the browser:

```
REACT_APP_FIREBASE_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN
REACT_APP_FIREBASE_PROJECT_ID
REACT_APP_FIREBASE_STORAGE_BUCKET
REACT_APP_FIREBASE_MESSAGING_SENDER_ID
REACT_APP_FIREBASE_APP_ID
```

The `.env` file is gitignored. Never commit real credentials. For Netlify, set these in the Netlify dashboard under Site Settings → Environment Variables.

---

## Authentication Model

Two auth modes are supported, managed by `AuthContext.js`:

1. **Google Sign-In** — Full owner access. User can manage products, generate share codes, and sync data under their Firebase UID.
2. **Guest via Share Code** — Read-oriented access. Guest enters an 8-character share code (format: `ABCD-1234`), which resolves to the owner's UID via a Firestore lookup. Guest sees the owner's data.

The `effectiveUserId` in `AuthContext` is used throughout — it returns the guest's `ownerUserId` when in guest mode, otherwise the authenticated user's UID.

```js
// From AuthContext.js
const effectiveUserId = guestOwnerUserId || user?.uid || null;
```

Guest state is stored in `sessionStorage` (cleared on tab close).

---

## Data Architecture

### Firestore Collections

**`users/{userId}`** — Primary user document:
```js
{
  products: Product[],      // Full product catalog
  favorites: string[],      // Array of product IDs (as strings)
  cart: Product[],          // Products added to cart
  shareCode: string,        // e.g. "ABCD-1234"
  updatedAt: Timestamp
}
```

**`shareCodes/{shareCode}`** — Reverse lookup index:
```js
{
  ownerId: string,          // Firebase UID of list owner
  createdAt: Timestamp
}
```

### Product Schema
```js
{
  id: number,         // Date.now() at creation time
  name: string,
  price: number,      // Float, e.g. 3.99
  category: string,   // "Produce" | "Pantry" | "Snacks" | "Frozen" | "Dairy"
  imageUrl: string    // Optional URL
}
```

### Local Storage Fallback

`src/utils/localStorage.js` provides fallback persistence when Firebase is unavailable:
- `saveProducts` / `loadProducts`
- `saveFavorites` / `getFavorites`
- `saveCart` / `getCart`
- `clearAllData`

---

## State Management

All core state lives in `App.js` using React hooks:

| State Variable | Type | Purpose |
|---|---|---|
| `products` | `Product[]` | Full product catalog |
| `favorites` | `string[]` | IDs of favorited products |
| `cart` | `Product[]` | Items in shopping cart |
| `searchQuery` | `string` | Product search filter |
| `activeTab` | `string` | Active UI tab |
| `editingProduct` | `Product\|null` | Product currently being edited |

### Real-Time Sync & Conflict Prevention

Firebase real-time updates are subscribed via `subscribeToFirebaseUpdates`. To prevent circular save loops (where an incoming Firebase update triggers a save back to Firebase), a ref flag is used:

```js
const isFirebaseUpdate = useRef(false);

// In the Firebase listener callback:
isFirebaseUpdate.current = true;
setProducts(data.products);
// ...
isFirebaseUpdate.current = false;

// In save useEffects:
if (isFirebaseUpdate.current) return; // Skip — came from Firebase
```

When modifying sync logic, preserve this pattern carefully.

---

## Key Firebase Service Functions

All in `src/firebase/firebaseService.js`:

| Function | Description |
|---|---|
| `generateShareCode()` | Creates 8-char code (XXXX-XXXX) using unambiguous charset |
| `saveShareCode(userId, shareCode)` | Writes to both `users` and `shareCodes` collections |
| `deleteShareCode(shareCode)` | Removes from `shareCodes` collection |
| `lookupShareCode(shareCode)` | Returns `ownerId` from share code |
| `saveProductsToFirebase(userId, products)` | Syncs product list |
| `saveFavoritesToFirebase(userId, favorites)` | Syncs favorites |
| `saveCartToFirebase(userId, cart)` | Syncs cart |
| `loadDataFromFirebase(userId)` | One-time load of user data |
| `subscribeToFirebaseUpdates(userId, callback)` | Real-time listener (returns unsubscribe fn) |

**Share code charset:** `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` — intentionally excludes `I`, `O`, `0`, `1` to avoid visual confusion.

---

## Component Responsibilities

### `App.js`
The central hub. Manages all state, Firebase sync, and passes handlers down as props. Key responsibilities:
- Product CRUD (add, edit, delete)
- Favorites toggle
- Cart management
- Share code generation/revocation
- JSON export/import
- Reset to sample data

### `ProductList.jsx`
Renders the product grid. Accepts `products`, `favorites`, `cart`, `searchQuery`, and event handlers. Filters products by category and search query internally. Shows edit/delete controls only for owners (not guests).

### `Login.jsx`
Shown when no user is authenticated. Provides Google Sign-In button and a share code text input. Validates format (uppercase, max 9 chars including dash).

### `ShoppingList.jsx`
Right panel showing cart items. Computes and displays the running total. Checkout clears the cart after a confirmation prompt.

### `Favorites.jsx`
Simple tab content listing favorited products. Minimal component.

### `AuthContext.js`
Provides `user`, `effectiveUserId`, `isGuest`, `guestOwnerUserId`, `signIn`, `signOut`, `signInAsGuest` via `useAuth()` hook.

---

## Styling Conventions

- **Primary file:** `src/App.css` (~1,161 lines) — all custom styles live here
- **Component classes:** DaisyUI utility classes (e.g., `btn`, `badge`, `card`) used directly in JSX
- **Brand color:** `#a33b3b` (Trader Joe's red/brown)
- **Category accent colors:**
  - Frozen: blue
  - Pantry: orange
  - Snacks: purple
  - Produce: green
  - Dairy: yellow
- **Responsive breakpoints:** 768px (tablet), 480px (mobile)
- **Layout:** CSS Grid with `auto-fill, minmax()` for product cards

Avoid adding separate CSS files per component — all styles belong in `App.css`.

---

## Testing

The test suite currently has a placeholder test in `App.test.js` that references the default CRA template and will fail. When adding features, write tests using React Testing Library:

```js
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
```

Tests involving Firebase or AuthContext require mocking those modules. Run tests with `npm test`.

---

## Common Pitfalls

1. **Circular Firebase sync:** Always check `isFirebaseUpdate.current` before saving in `useEffect` hooks that respond to state changes synced from Firebase.
2. **Guest vs. owner logic:** Use `effectiveUserId` (from `AuthContext`) for all Firebase operations. Use `isGuest` to conditionally hide edit/delete controls.
3. **Product IDs are numbers:** Generated with `Date.now()`. Favorites are stored as `string[]` — coerce IDs when comparing: `String(product.id)`.
4. **Share code format:** Always uppercase, dash at position 4 (`XXXX-XXXX`). The Login component enforces this on input.
5. **Environment variables:** Must restart `npm start` after changing `.env`. Netlify requires re-deploy after env var changes.
6. **No router:** This is a single-page app with tab-based navigation — no React Router. Tabs are controlled by the `activeTab` state in `App.js`.

---

## Deployment

**Platform:** Netlify
**Trigger:** Auto-deploy on push to `master`
**Build command:** `npm run build`
**Publish directory:** `build`

Environment variables must be configured in the Netlify dashboard. The `.netlify-deploy-trigger` file contains a timestamp used to force redeployment when env vars change.

Refer to `FIREBASE_SETUP.md` for complete Firebase project configuration instructions.

---

## Git Conventions

- Commit messages are descriptive and imperative (e.g., `Fix real-time sync: prevent save effects from overwriting Firebase updates`)
- No linting bypass (`--no-verify`) — fix lint errors before committing
- The `master` branch is the production branch and triggers Netlify deploys
