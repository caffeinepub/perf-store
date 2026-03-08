# Perf Store

## Current State
- Login/Signup pages have email and password input fields but the actual authentication is powered by Internet Identity (II) popup via `useInternetIdentity`. Email/password fields are cosmetic only.
- The backend uses `authorization` component (AccessControl + MixinAuthorization) with Principal-based roles.
- All backend calls are authenticated via the user's Internet Identity principal.

## Requested Changes (Diff)

### Add
- Backend: `emailCredentials` stable map storing `email -> { hashedPassword, salt, principal }` to associate email/password pairs with a unique pseudo-principal.
- Backend: `registerWithEmail(email, password)` -- creates a new credential entry, assigns a stable user principal, registers it with AccessControl as a user.
- Backend: `loginWithEmail(email, password)` -- verifies credentials, returns a session token (short-lived random token stored in a `sessions` map).
- Backend: `verifySession(token)` -- returns the principal associated with a session token (used by frontend to verify session).
- Backend: `logoutSession(token)` -- invalidates a session token.
- Frontend: A new `useEmailAuth` hook managing email/password auth state using the session token stored in localStorage.
- Frontend: Login and Signup pages now call `loginWithEmail` / `registerWithEmail` on the backend and transition to the main app on success, without using II popup.
- Frontend: App.tsx uses `useEmailAuth` instead of `useInternetIdentity` to determine authenticated state.
- Frontend: After login, all actor calls use an anonymous identity but pass the session token as a header/query param to the backend for auth context -- OR simpler: store the principal returned from session and use it to identify the user, with backend API checking the session token passed as an argument.

### Modify
- Backend: Sensitive endpoints that currently check `caller` principal will be adapted. Since Internet Computer doesn't allow custom HTTP headers for auth, the pattern will be: the user authenticates via email/password to get a session token, then calls that session token as an argument alongside backend calls that need auth.
- Actually, simpler approach: keep II as the underlying auth mechanism but wrap the email/password flow so that when a user registers with email/password, it still opens an II session. The email/password are stored and checked against each other; on success, II login is triggered automatically.
- **Revised approach (cleanest)**: Store email/password credentials on the backend. Login checks credentials. On success, return a session token. Frontend stores token. Backend endpoints accept an optional `sessionToken` parameter for calls that need it, looked up to get the calling principal. This avoids breaking all existing backend auth logic.

### Remove
- Nothing removed; II login stays as a secondary option but email/password becomes the primary displayed method.

## Implementation Plan
1. Add `emailCredentials`, `sessions`, stable counters to backend main.mo.
2. Add `registerWithEmail(email, password)` -- hashes password (XOR-based simple hash since no crypto library), stores credential, auto-registers principal with AccessControl.
3. Add `loginWithEmail(email, password)` -- verifies credential, creates session token, returns it.
4. Add `verifySession(token)` -- returns `?Principal`.
5. Add `logoutSession(token)` -- removes session.
6. Add `getMyPrincipalFromSession(token)` helper used by frontend-facing queries.
7. Update frontend `App.tsx` to use email auth state from localStorage session token.
8. Update `LoginPage.tsx` to call `actor.loginWithEmail(email, password)`, store token, set auth.
9. Update `SignupPage.tsx` to call `actor.registerWithEmail(email, password)`.
10. Create `useEmailAuth` hook to manage session token state.
11. Keep the existing `useInternetIdentity` hook but don't show the II button in the UI.
12. The backend actor calls that require `caller` principal: since the calls are made with anonymous identity + session token, need to add session-token variants of the key mutations (addToCart, placeOrder, submitRefundRequest, submitReview, etc.) OR pass the token as argument.
13. **Simplest viable approach**: Add `loginWithEmail` / `registerWithEmail` to backend. On success, the frontend ALSO calls `login()` from II silently (if possible) OR we keep II as the actual auth and just gate it behind email/password check. On email/password verification success, auto-trigger the II popup to complete the actual ICP identity setup -- but this is confusing UX.
14. **Final decision**: Implement a pure email/password auth layer where the session token IS the identity. All backend mutations will accept `sessionToken: Text` as a parameter instead of relying on `caller`. New session-aware versions of all protected endpoints will be added. The existing `caller`-based ones remain for backward compat.
