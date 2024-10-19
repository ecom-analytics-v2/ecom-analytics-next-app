"use client";

import Link from "next/link"
import {
  Bell,
  Home,
  LineChart,
  Menu,
  Package,
  Package2,
  Search,
  ShoppingCart,
  Users,
  LogOut,
  LucideProps,
  TrendingUpDown,
  Factory,
  Banknote,
  Wallet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { signOut } from '@/app/(login)/actions';
import { useUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import {  ForwardRefExoticComponent, RefAttributes, useState } from "react"
import { usePathname } from "next/navigation";

// Define the navbar items
const navItems = [
  { name: "Overview", href: "/dashboard", icon: Home },
  { name: "Forecasting", href: "/dashboard/forecasting", icon: TrendingUpDown },
  { name: "Revenue", href: "/dashboard/revenue", icon: Banknote },
  { name: "Expenses", href: "/dashboard/expenses", icon: Wallet },
];

export default function Dashboard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, setUser } = useUser();
  const router = useRouter();

  async function handleSignOut() {
    setUser(null);
    await signOut();
    router.push('/');
  }

  const renderNavItem = (item: { name: string; href: string; icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>; active?: boolean; }, isMobile = false) => {
    const className = `flex items-center gap-3 rounded-lg px-3 py-2 my-0.5 font-semibold ${
      item.href === pathname
        ? "bg-card"
        : "text-muted-foreground hover:text-primary hover:bg-card/50"
    } transition-all`;

    return (
      <Link 
        key={item.name} 
        href={item.href} 
        className={isMobile ? `mx-[-0.65rem] ${className}` : className}
      >
        <item.icon className={isMobile ? "h-5 w-5" : "h-4 w-4"} />
        {item.name}
      </Link>
    );
  };

  return (
    <div className="grid h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted md:block h-screen overflow-y-auto">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6" />
              <span className="">ScaleSage</span>
            </Link>
            <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map(item => renderNavItem(item))}
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Card>
              <CardHeader className="p-2 pt-0 md:p-4">
                <CardTitle>Upgrade to Pro</CardTitle>
                <CardDescription>
                  Unlock all features and get unlimited access to our support team.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                <Button size="sm" className="w-full">
                  Upgrade
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="flex flex-col h-screen overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b bg-muted px-4 lg:h-[60px] lg:px-6 shrink-0">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="#"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <Package2 className="h-6 w-6" />
                  <span className="sr-only">Acme Inc</span>
                </Link>
                {navItems.map(item => renderNavItem(item, true))}
              </nav>
              <div className="mt-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Upgrade to Pro</CardTitle>
                    <CardDescription>
                      Unlock all features and get unlimited access to our support team.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button size="sm" className="w-full">
                      Upgrade
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                />
              </div>
            </form>
          </div>
          {user ? (
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer size-9">
                  <AvatarImage alt={user.name || ''} />
                  <AvatarFallback>
                    {user.email
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="flex flex-col gap-1">
                <DropdownMenuItem className="cursor-pointer">
                  <Link href="/dashboard" className="flex w-full items-center">
                    <Home className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <form action={handleSignOut} className="w-full">
                  <button type="submit" className="flex w-full">
                    <DropdownMenuItem className="w-full flex-1 cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </button>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              asChild
              className="bg-black hover:bg-gray-800 text-white text-sm px-4 py-2 rounded-full"
            >
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          )}
        </header>
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}