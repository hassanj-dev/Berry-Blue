import type { ReactNode } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-x-clip pb-[calc(3.75rem+env(safe-area-inset-bottom))] lg:pb-0">
        <Header />
        <div className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
        <div className="lg:hidden">
          <Footer />
        </div>
        <BottomNav />
      </div>
    </div>
  );
}
