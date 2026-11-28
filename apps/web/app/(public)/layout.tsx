import { Suspense, type ReactNode } from "react";
import { AdsHost } from "@/components/ads/AdsHost";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-x-clip pb-[env(safe-area-inset-bottom)] lg:pb-0">
        <Header />
        <div className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
        <Footer />
      </div>
      <Suspense fallback={null}>
        <AdsHost />
      </Suspense>
    </div>
  );
}
