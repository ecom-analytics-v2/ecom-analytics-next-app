import { getUser } from "@/actions/user";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { redirect } from "next/navigation";

export default async function Dashboard({ children }: { children: React.ReactNode }) {
  const user = await getUser();

  if (!user?.activeTeamId) {
    redirect("/stores");
  }
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 overflow-y-auto bg-background">
        <SidebarInset>
          <div className="flex m-8">{children}</div>
        </SidebarInset>
      </main>
    </SidebarProvider>
  );
}
