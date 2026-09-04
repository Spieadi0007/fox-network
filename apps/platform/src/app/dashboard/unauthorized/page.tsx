import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="font-[family-name:var(--font-heading)] text-6xl font-bold text-stone-900">
        403
      </h1>
      <p className="text-lg text-stone-500">
        You don&apos;t have permission to access this page.
      </p>
      <Link
        href="/dashboard"
        className="mt-4 rounded-full bg-stone-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-stone-800"
      >
        Back to Dashboard
      </Link>
    </main>
  );
}
