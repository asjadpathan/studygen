import { MainHeader } from "@/components/main-header";
import { PageTransitionWrapper } from "@/components/page-transition-wrapper";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <MainHeader />
      <main className="flex flex-1 flex-col gap-6 p-6 md:gap-8 md:p-8">
        <PageTransitionWrapper>
          {children}
        </PageTransitionWrapper>
      </main>
    </div>
  );
}
