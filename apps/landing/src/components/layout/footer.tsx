import { Container } from "@/components/marketing/container";

const footerLinks = {
  Product: [
    { label: "Job Management", href: "#" },
    { label: "AI Validation", href: "#" },
    { label: "Dispatch", href: "#" },
    { label: "Compliance", href: "#" },
  ],
  Company: [
    { label: "About", href: "#about" },
    { label: "Careers", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Resources: [
    { label: "Documentation", href: "#" },
    { label: "API Reference", href: "#" },
    { label: "Support", href: "#" },
    { label: "Status", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer id="about" className="border-t border-stone-200/60">
      <Container className="py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-1.5">
              <img src="/fox-logo.svg" alt="Fox" className="h-8 w-8" />
              <span className="font-[family-name:var(--font-heading)] text-[17px] font-bold tracking-[-0.03em] text-stone-900">
                Fox<span className="text-fox-orange">Network</span>
              </span>
            </a>
            <p className="mt-4 max-w-xs text-[14px] leading-[1.7] text-stone-400">
              The command center for your field operations.
              Manage teams, validate work, and close jobs — all in one place.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-[13px] font-semibold text-stone-900">{title}</h4>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[13px] text-stone-400 transition-colors hover:text-stone-700"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-stone-200/60 pt-8 sm:flex-row">
          <p className="text-[12px] text-stone-400">
            &copy; {new Date().getFullYear()} FoxNetwork Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-[12px] text-stone-400 hover:text-stone-600">
              Privacy Policy
            </a>
            <a href="#" className="text-[12px] text-stone-400 hover:text-stone-600">
              Terms of Service
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
