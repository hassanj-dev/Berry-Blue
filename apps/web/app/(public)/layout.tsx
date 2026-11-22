import type { ReactNode } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 md:px-8 md:py-8">{children}</div>
      <Footer />
      <BottomNav />
    </div>
  );
}
