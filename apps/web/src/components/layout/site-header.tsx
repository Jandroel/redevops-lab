import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ButtonLink } from "@/components/ui/button";

const navItems = [
  { href: "/analyze", label: "Analyze" },
  { href: "/examples", label: "Examples" },
  { href: "/report/demo", label: "Demo Report" },
  { href: "https://github.com/Jandroel/redevops-lab", label: "GitHub" }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-devops-border/80 bg-devops-bg/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="ReDevOps Lab home"
          className="rounded-md transition focus:outline-none focus:ring-2 focus:ring-devops-blue/70"
        >
          <BrandLogo />
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-devops-muted md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-devops-text">
              {item.label}
            </Link>
          ))}
        </nav>
        <ButtonLink href="/analyze" size="md" className="hidden sm:inline-flex">
          Analyze repo
        </ButtonLink>
      </div>
    </header>
  );
}
