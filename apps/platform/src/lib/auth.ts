import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { type Role, type Action, hasPermission } from "@fox/shared";

export async function getAuthUser() {
  const headerStore = await headers();
  const id = headerStore.get("x-user-id");
  const email = headerStore.get("x-user-email");
  const role = headerStore.get("x-user-role") as Role | null;

  if (!id || !email || !role) {
    return null;
  }

  return { id, email, role };
}

export async function requirePermission(action: Action) {
  const user = await getAuthUser();

  if (!user) {
    redirect(process.env.NEXT_PUBLIC_LANDING_URL ?? "http://localhost:3000");
  }

  if (!hasPermission(user.role, action)) {
    redirect("/unauthorized");
  }

  return user;
}
