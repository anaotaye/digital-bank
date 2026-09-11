"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { LogoLockup } from "@/components/brand";
import { navItems, isNavActive } from "./nav-items";

export function SideNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { customer, logout } = useAuth();

  const onLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <aside
      className="fixed top-0 bottom-0 left-0 hidden w-64 flex-col border-r border-ink-200 bg-paper/60 px-5 py-8 backdrop-blur-sm lg:flex"
      aria-label="Primary"
    >
      <div className="mb-12 px-2">
        <LogoLockup orientation="horizontal" size="sm" />
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isNavActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 font-sans text-sm font-medium transition-colors",
                active
                  ? "bg-primary-tint text-primary"
                  : "text-ink-500 hover:bg-shell hover:text-ink-900",
              )}
            >
              <Icon
                className="h-[18px] w-[18px]"
                strokeWidth={active ? 2.25 : 1.75}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: user + logout */}
      <div className="mt-auto border-t border-ink-200 pt-6">
        {customer && (
          <div className="mb-3 flex items-center gap-3 px-2">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-serif text-sm font-medium text-cream italic"
              style={{
                background: "linear-gradient(135deg, #C9522F, #B7863C)",
                fontVariationSettings: "'SOFT' 100",
              }}
            >
              {initials(customer.firstName, customer.lastName).slice(0, 1)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-sans text-sm font-medium text-ink-900">
                {customer.firstName} {customer.lastName}
              </div>
              <div className="truncate font-sans text-xs text-ink-500">
                {customer.email}
              </div>
            </div>
          </div>
        )}
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 font-sans text-sm text-ink-500 transition-colors hover:bg-shell hover:text-ink-900"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.75} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
