# Perf Store

## Current State
- Email/password login and registration exist
- Sessions are managed via tokens stored in localStorage
- No "forgot password" flow exists
- No security question is collected during registration
- Admin/partner panel exists in PartnerPage but has no user management capabilities
- Backend has `registerWithEmail`, `loginWithEmail`, `verifySession`, `logoutSession` functions

## Requested Changes (Diff)

### Add
- **Security question on signup**: During registration, users pick a security question (e.g. "What is your mother's maiden name?") and provide an answer. The answer is stored hashed alongside their credential.
- **Forgot Password flow**: On the login screen, a "Forgot Password?" link opens a multi-step flow: (1) enter email, (2) answer security question, (3) set a new password. All frontend-only using backend calls.
- **Admin password reset panel**: In the PartnerPage (admin-only section), a new tab/card shows all registered users' emails. Admin can select a user and set a new password for them directly.

### Modify
- `registerWithEmail` backend function: accept two extra params `securityQuestion` and `securityAnswerHash` and store them in `EmailCredential`.
- `EmailCredential` type: add `securityQuestion: Text` and `securityAnswerHash: Text` fields.
- New backend functions:
  - `getSecurityQuestion(email)` → returns the question text (or null if email not found)
  - `resetPasswordWithSecurityAnswer(email, answerHash, newPassword)` → validates answer and updates password hash
  - `adminResetPassword(email, newPassword)` → admin-only, directly resets a user's password
  - `getAllUserEmails()` → admin-only, returns list of registered emails
- `SignupPage.tsx`: add security question selector + answer field
- `LoginPage.tsx`: add "Forgot Password?" link that navigates to a ForgotPasswordPage
- New `ForgotPasswordPage.tsx`: step 1 (enter email) → step 2 (answer question) → step 3 (new password)
- `PartnerPage.tsx`: add an admin-only "User Management" section with password reset capability

### Remove
- Nothing removed

## Implementation Plan
1. Update `EmailCredential` type and `registerWithEmail` in `main.mo` to accept + store security question and answer hash.
2. Add `getSecurityQuestion`, `resetPasswordWithSecurityAnswer`, `adminResetPassword`, `getAllUserEmails` to `main.mo`.
3. Update `SignupPage.tsx` to add security question dropdown + answer field.
4. Create `ForgotPasswordPage.tsx` with 3-step flow.
5. Update `LoginPage.tsx` to add "Forgot Password?" button that navigates to ForgotPasswordPage.
6. Update `App.tsx` to add `forgotPassword` as an auth view and render `ForgotPasswordPage`.
7. Update `PartnerPage.tsx` to add admin user management panel with password reset.
8. Validate and build.
