import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refreshes the auth token if needed — required reading, not optional,
  // per Supabase's Next.js App Router guidance (do not remove).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Forward a lightweight "is someone logged in" flag as a request header,
  // so Server Components (the nav header) can read it via next/headers
  // with zero extra network cost, instead of each one calling getUser()
  // again. That duplicate round trip to Supabase's Auth server was
  // running on every single page load, everywhere in the app.
  // Important: this flag only controls which nav links render (Log in
  // vs Log out) — it is NOT used to authorize anything. Anything that
  // actually needs a verified user (submitting a review, etc.) still
  // calls getUser() itself in lib/current-user.ts.
  const cookiesToCarry = supabaseResponse.cookies.getAll();
  request.headers.set("x-user-signed-in", user ? "1" : "0");
  supabaseResponse = NextResponse.next({ request });
  cookiesToCarry.forEach((cookie) => supabaseResponse.cookies.set(cookie));

  return supabaseResponse;
}
