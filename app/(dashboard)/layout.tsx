import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <section className="flex flex-col min-h-screen">{children}</section>;
}
