import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-devops-border/80 bg-slate-950/60">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-devops-muted sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p>ReDevOps Lab - built by Jandroel.</p>
        <div className="flex gap-5">
          <Link href="/examples" className="hover:text-devops-text">
            Examples
          </Link>
          <Link href="/report/demo" className="hover:text-devops-text">
            Demo
          </Link>
          <Link href="/analyze" className="hover:text-devops-text">
            Analyze
          </Link>
          <Link href="https://github.com/Jandroel/redevops-lab" className="hover:text-devops-text">
            GitHub
          </Link>
        </div>
      </div>
    </footer>
  );
}
