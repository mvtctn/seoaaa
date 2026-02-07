
# Auth System Setup

We have implemented a secure authentication system using **Supabase Auth** and **Next.js Middleware**.

## Key Components

1.  **Middleware (`middleware.ts`)**:
    *   Automatically runs on every request for `/dashboard` and `/user`.
    *   Checks for a valid Supabase session using cookies.
    *   Redirects unauthenticated users to `/login`.
    *   Redirects authenticated users from `/login` to `/dashboard`.

2.  **Supabase Helpers (`lib/supabase/`)**:
    *   `client.ts`: For Client Components (Client-side usage).
    *   `server.ts`: For Server Components and Server Actions (Server-side usage).

3.  **Pages**:
    *   `/login`: Login form (Email/Password).
    *   `/user`: User profile page with "Sign Out" button.
    *   `/auth/signout`: API route to handle sign out logic.

## How to Use

1.  **Environment Variables**: Ensure your `.env` contains:
    ```
    NEXT_PUBLIC_SUPABASE_URL=...
    NEXT_PUBLIC_SUPABASE_ANON_KEY=...
    ```

2.  **Users**:
    *   You can create users in your **Supabase Dashboard > Authentication > Users**.
    *   Or enable the "Sign Up" logic in `app/login/page.tsx` if you want public registration.

3.  **Protecting New Routes**:
    *   To protect a new route (e.g., `/admin`), add it to the matcher or logic in `middleware.ts`.

## Troubleshooting

*   **Login Loop**: Ensure cookies are being set correctly. Check browser console for cookie errors.
*   **500 Error**: If `lib/supabase/server.ts` fails, it might be due to missing environment variables.
