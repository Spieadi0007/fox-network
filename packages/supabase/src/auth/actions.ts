"use server";

import { redirect } from "next/navigation";
import { createServerClient } from "../client/server";

const LANDING_URL =
  process.env.NEXT_PUBLIC_LANDING_URL ?? "http://localhost:3000";
const PLATFORM_URL =
  process.env.NEXT_PUBLIC_PLATFORM_URL || LANDING_URL;

export async function signInWithEmail(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/signin?error=${encodeURIComponent(error.message)}`);
  }

  redirect(PLATFORM_URL);
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
      redirectTo: `${LANDING_URL}/auth/callback`,
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
  redirect(LANDING_URL);
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
      redirectTo: `${LANDING_URL}/auth/callback?next=${encodeURIComponent("/signup?step=company-2")}`,
    },
  });

  if (error) {
    redirect(`/signup?step=company-1&error=${encodeURIComponent(error.message)}`);
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function completeCompanySetup(formData: FormData) {
  const companyName = formData.get("companyName") as string;
  const companySize = formData.get("companySize") as string;
  const industry = (formData.get("industry") as string) || null;
  const website = (formData.get("website") as string) || null;
  const description = (formData.get("description") as string) || null;
  const logoUrl = (formData.get("logoUrl") as string) || null;

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

  redirect(PLATFORM_URL);
}
