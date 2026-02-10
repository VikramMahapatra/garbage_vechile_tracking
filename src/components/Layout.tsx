import { ReactNode, useRef } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import Header from '@/components/Header';
import { useScrollPreservation } from '@/hooks/useScrollPreservation';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const mainContentRef = useRef<HTMLElement>(null);
  useScrollPreservation(mainContentRef);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col w-full overflow-hidden">
          <div className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-4 gap-4">
              <SidebarTrigger />
              <Header />
            </div>
          </div>
          <main 
            ref={mainContentRef}
            className="flex-1 overflow-auto"
            style={{ overflowAnchor: 'none' }}
          >
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
