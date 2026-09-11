import { BottomNav } from "@/components/nav/bottom-nav";
import { SideNav } from "@/components/nav/side-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <SideNav />

      <main className="pb-24 lg:pb-8 lg:pl-64">
        <div className="mx-auto max-w-105 px-6 pt-6 lg:max-w-135 lg:pt-12">
          {children}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
