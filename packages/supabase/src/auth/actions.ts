"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createServerClient } from "../client/server";

/**
 * Where OAuth should come back to.
 *
 * This has to be the host the user actually started on. Staff and clients
 * are one deployment reached on two subdomains, so a fixed environment
 * variable sends anyone who began on the wrong one to a callback on the
 * other — where their code will not exchange and the session is lost.
 * Reading it off the request keeps the round trip on one host.
 */
async function getAppOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (host) {
    const proto =
      h.get("x-forwarded-proto") ??
      (host.startsWith("localhost") || host.startsWith("127.0.0.1")
        ? "http"
        : "https");
    return `${proto}://${host}`;
  }
  return (
    process.env.NEXT_PUBLIC_LANDING_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000"
  );
}

export async function signInWithEmail(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/signin?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}

export async function signUpWithEmail(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/signup?success=Check your email to confirm your account");
}

export async function signInWithOAuth(provider: "google") {
  const supabase = await createServerClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${await getAppOrigin()}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/signin?error=${encodeURIComponent(error.message)}`);
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function signOut() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

// --- New signup flow actions ---

export async function signUpCompany(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const companyName = formData.get("companyName") as string;
  const companySize = formData.get("companySize") as string;
  const companyIndustry = (formData.get("industry") as string) || "";
  const companyWebsite = (formData.get("website") as string) || "";
  const companyDescription = (formData.get("description") as string) || "";
  const companyLogoUrl = (formData.get("logoUrl") as string) || "";

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        account_type: "company",
        company_name: companyName,
        company_size: companySize,
        company_industry: companyIndustry,
        company_website: companyWebsite,
        company_description: companyDescription,
        company_logo_url: companyLogoUrl,
      },
    },
  });

  if (error) {
    redirect(`/signup?step=company-2&error=${encodeURIComponent(error.message)}`);
  }

  redirect("/signup?success=Check your email to confirm your account");
}

export async function submitPartnerRequest(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = (formData.get("phone") as string) || null;
  const trade = formData.get("trade") as string;

  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("partner_requests").insert({
    name,
    email,
    phone,
    trade,
  });

  if (error) {
    redirect(`/signup?step=partner&error=${encodeURIComponent(error.message)}`);
  }

  redirect("/signup?success=partner_submitted");
}
export async function signInWithOAuthCompany(provider: "google") {
  const supabase = await createServerClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${await getAppOrigin()}/auth/callback?next=${encodeURIComponent("/signup?step=company-2")}`,
    },
  });

  if (error) {
    redirect(`/signup?step=company-1&error=${encodeURIComponent(error.message)}`);
  }

  if (data.url) {
    redirect(data.url);
  }
}

// --- Client signup / signin ---

export async function signUpClient(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const companyName = formData.get("companyName") as string;

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        account_type: "client",
        company_name: companyName,
        company_size: "1-10",
      },
    },
  });

  if (error) {
    redirect(`/client/signup?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/client/signup?success=Check your email to confirm your account");
}

export async function signInClient(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/client/signin?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/client/dashboard");
}

export async function completeCompanySetup(formData: FormData) {
  const companyName = formData.get("companyName") as string;
  const companySize = formData.get("companySize") as string;
  const industry = (formData.get("industry") as string) || null;
  const website = (formData.get("website") as string) || null;
  const description = (formData.get("description") as string) || null;
  const logoUrl = (formData.get("logoUrl") as string) || null;
  const networkType = (formData.get("networkType") as string) || null;

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signup?step=company-1&error=Please sign in first");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Use RPC to handle org creation + profile linking atomically (bypasses RLS)
  const { error: setupError } = await db.rpc("setup_company", {
    p_user_id: user.id,
    p_user_email: user.email!,
    p_user_name: user.user_metadata?.name || user.user_metadata?.full_name || null,
    p_avatar_url: user.user_metadata?.avatar_url || null,
    p_company_name: companyName,
    p_company_size: companySize,
    p_industry: industry,
    p_website: website,
    p_description: description,
    p_logo_url: logoUrl,
  });

  if (setupError) {
    redirect(`/signup?step=company-2&error=${encodeURIComponent(setupError.message)}`);
  }

  // Fetch the org the RPC just created/linked, and stamp the network type on it.
  // Best-effort: silently skipped if the column isn't there yet (migration 026).
  const { data: prof } = await db
    .from("profiles")
    .select("account_type, organization_id")
    .eq("id", user.id)
    .single();

  if (networkType && prof?.organization_id) {
    await db
      .from("organizations")
      .update({ network_type: networkType })
      .eq("id", prof.organization_id);
  }

  // Route by the account type the RPC actually set: once migration 025 is live,
  // company signups become clients (→ /client/dashboard).
  redirect(prof?.account_type === "client" ? "/client/dashboard" : "/dashboard");
}

// --- Invited member signup ---

export type InvitationDetails = {
  email: string;
  name: string | null;
  role: "admin" | "manager" | "technician" | "viewer";
  organizationName: string;
  status: "pending" | "accepted" | "revoked";
  isExpired: boolean;
};

/**
 * Read an invitation from its emailed token. Runs through a security-definer
 * RPC because the reader has no account yet, and RLS on `invitations` scopes
 * SELECT to the inviting organisation.
 */
export async function getInvitation(
  token: string
): Promise<InvitationDetails | null> {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("invitation_by_token", {
    p_token: token,
  });

  if (error || !data || data.length === 0) return null;

  const row = data[0];
  return {
    email: row.email,
    name: row.name ?? null,
    role: row.role,
    organizationName: row.organization_name,
    status: row.status,
    isExpired: row.is_expired,
  };
}

export async function acceptInvitation(formData: FormData) {
  const token = formData.get("token") as string;
  const name = ((formData.get("name") as string) || "").trim();
  const password = formData.get("password") as string;

  const fail = (message: string) =>
    redirect(`/invite/${token}?error=${encodeURIComponent(message)}`);

  // The email comes from the invitation, never from the form — otherwise
  // whoever held the link could sign up as any address they liked and be
  // dropped straight into the organisation.
  const invitation = await getInvitation(token);

  if (!invitation) fail("This invitation link is not valid.");
  if (invitation!.status === "revoked") fail("This invitation has been revoked.");
  if (invitation!.status === "accepted")
    fail("This invitation has already been used. Sign in instead.");
  if (invitation!.isExpired)
    fail("This invitation has expired. Ask for a new one.");
  if (password.length < 8) fail("Choose a password of at least 8 characters.");

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signUp({
    email: invitation!.email,
    password,
    options: {
      // No company_name: handle_new_user() must take the invitation branch
      // and join the inviting org, not create a second one.
      data: { name: name || invitation!.name || null, account_type: "company" },
    },
  });

  if (error) {
    fail(
      error.message.toLowerCase().includes("already registered")
        ? "You already have an account. Sign in and you will be added automatically."
        : error.message
    );
  }

  const { data: session } = await supabase.auth.getUser();
  if (!session?.user) {
    redirect("/signin?success=Check your email to confirm your account");
  }

  // Middleware routes by role from here.
  redirect("/dashboard");
}

export async function signInWithOAuthClient(provider: "google") {
  const supabase = await createServerClient();

  // Both outcomes land on the same place, and middleware sorts them out: an
  // existing client with an organisation is bounced straight to their
  // dashboard, while somebody arriving for the first time has no
  // organisation yet and gets the one remaining question.
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${await getAppOrigin()}/auth/callback?next=${encodeURIComponent(
        "/client/signup?step=company",
      )}`,
    },
  });

  if (error) {
    redirect(`/client/signin?error=${encodeURIComponent(error.message)}`);
  }

  if (data.url) {
    redirect(data.url);
  }
}

/**
 * Finish a client account created through Google.
 *
 * The password flow collects the company name up front and hands it to the
 * signup trigger as metadata. OAuth cannot: the user is already
 * authenticated by the time we get to ask. So the organisation is created
 * here instead, through a SECURITY DEFINER function, because a profile with
 * no organisation cannot insert one under RLS.
 *
 * No new migration: setup_company already does exactly this.
 */
export async function completeClientSetup(formData: FormData) {
  const companyName = (formData.get("companyName") as string)?.trim();
  if (!companyName) {
    redirect("/client/signup?step=company&error=Company+name+is+required");
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/client/signin");

  // setup_company is the right function despite the name: migration 025
  // repurposed it so a public signup creates an organisation and marks the
  // profile account_type='client', role='admin'. The size default matches
  // what signUpClient sends on the password path.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc("setup_company", {
    p_user_id: user.id,
    p_user_email: user.email ?? "",
    p_user_name:
      (user.user_metadata?.name as string) ??
      (user.user_metadata?.full_name as string) ??
      "",
    p_avatar_url: (user.user_metadata?.avatar_url as string) ?? null,
    p_company_name: companyName,
    p_company_size: "1-10",
  });

  if (error) {
    redirect(
      `/client/signup?step=company&error=${encodeURIComponent(error.message)}`,
    );
  }

  redirect("/client/dashboard");
}
