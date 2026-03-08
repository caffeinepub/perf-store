# Perf Store

## Current State
- Flutter-to-React perfume store with Login, Signup, Home (product grid), Cart, Orders, and Partner Dashboard tabs.
- Backend stores perfumes, carts, orders, partner stats (sales/commission/referral link).
- Partner page shows stats only; no ability to add products for sale.
- No contact/service number displayed anywhere.

## Requested Changes (Diff)

### Add
- Partner product submission form: partners can submit a product (name, price, image URL, description) directly from the Partner tab. Submissions are stored on the backend and pending admin approval before appearing in the store.
- Service/contact number (0756633420) displayed prominently -- in the app footer/contact section and on the Partner page so partners can reach the store owner.
- New backend functions: `submitPartnerProduct`, `getPartnerProducts`, `approvePartnerProduct` (admin only), `getPendingPartnerProducts` (admin only).
- New type `PartnerProduct` with fields: id, name, imageUrl, price, description, submittedBy (Principal), status (pending/approved/rejected).

### Modify
- PartnerPage: add "List a Product" section with a form below the stats cards.
- PartnerPage: add a "Contact Us" section displaying the service number.
- HomePage: approved partner products appear in the main product grid alongside existing perfumes.
- backend.d.ts: add new types and methods for partner products.

### Remove
- Nothing removed.

## Implementation Plan
1. Update `main.mo` to add `PartnerProduct` type and the four new functions.
2. Regenerate `backend.d.ts` with new types/methods.
3. Update `useQueries.ts` to add hooks: `useSubmitPartnerProduct`, `usePartnerProducts`.
4. Update `PartnerPage.tsx` to include the product submission form and contact section.
5. Update `HomePage.tsx` to merge approved partner products into the product grid.
