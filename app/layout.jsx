"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  LayoutDashboard, 
  List, 
  PieChart, 
  Settings, 
  Menu, 
  X, 
  LogOut 
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { ThemeProvider } from "@/app/components/theme-provider";
import { ThemeToggle } from "@/app/components/theme-toggle";

export default function RootLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Transactions",
      href: "/transactions",
      icon: <List className="h-5 w-5" />,
    },
    {
      name: "Budgets",
      href: "/budgets",
      icon: <PieChart className="h-5 w-5" />,
    },
  ];

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="flex min-h-screen flex-col">
        {/* Mobile Navigation Bar */}
        <header className="sticky top-0 z-40 border-b bg-background md:hidden">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="h-6 w-6" />
              </Button>
              <span className="ml-2 text-lg font-semibold">Finance Visualizer</span>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
            <div className="fixed inset-y-0 left-0 z-50 h-full w-3/4 max-w-xs border-r bg-background shadow-lg animate-in slide-in-from-left">
              <div className="flex h-16 items-center justify-between px-4 border-b">
                <span className="text-lg font-semibold">Finance Visualizer</span>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="py-4">
                <nav className="grid gap-1 px-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
                        pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-1">
          {/* Desktop Sidebar */}
          <aside className="fixed hidden h-screen w-64 border-r bg-background md:block">
            <div className="flex h-16 items-center border-b px-6">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <PieChart className="h-6 w-6" />
                <span>Finance Visualizer</span>
              </Link>
            </div>
            <div className="flex flex-col justify-between h-[calc(100vh-64px)]">
              <nav className="grid gap-1 px-2 py-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
                      pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {item.icon} {item.name}
                  </Link>
                ))}
              </nav>
              <div className="p-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">Theme</span>
                  <ThemeToggle />
                </div>
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <LogOut className="h-4 w-4" /> Log Out
                </Button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 md:pl-64">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}