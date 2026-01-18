"use client";

import * as React from "react";
import {
  CreditCard,
  LayoutDashboard,
  Settings,
  User,
  Calculator,
  Calendar,
  BarChart,
  Search,
  Plus,
  ArrowRight,
  Ticket,
  Users,
  Megaphone,
  Shield,
  LogOut,
  Sun,
  Moon,
  Laptop,
  Eye,
  EyeOff
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { signOut } from "@/lib/auth-client";
import { usePrivacyStore } from "@/store/use-privacy-store";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

export function SearchCommand() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();
  const { isPrivacyMode, togglePrivacyMode } = usePrivacyStore();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2 text-muted-foreground bg-muted/50 hover:bg-muted/80 border-muted-foreground/20"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Quick Actions">
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard/expenses?action=new"))}
            >
              <Plus className="mr-2 h-4 w-4" />
              <span>Add Expense</span>
              <CommandShortcut>⌘E</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard/tickets?action=new"))}
            >
              <Ticket className="mr-2 h-4 w-4" />
              <span>Create Ticket</span>
              <CommandShortcut>⌘T</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard/budgets?action=new"))}
            >
              <Calculator className="mr-2 h-4 w-4" />
              <span>New Budget</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Navigation">
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard"))}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard/expenses"))}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Expenses</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard/budgets"))}
            >
              <Calculator className="mr-2 h-4 w-4" />
              <span>Budgets</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard/subscriptions"))}
            >
              <Calendar className="mr-2 h-4 w-4" />
              <span>Subscriptions</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard/support"))}
            >
              <Ticket className="mr-2 h-4 w-4" />
              <span>Tickets</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard/settings"))}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Admin">
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard/admin/users"))}
            >
              <Users className="mr-2 h-4 w-4" />
              <span>Manage Users</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard/admin/announcements"))}
            >
              <Megaphone className="mr-2 h-4 w-4" />
              <span>Announcements</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard/admin/logs"))}
            >
              <Shield className="mr-2 h-4 w-4" />
              <span>Audit Logs</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="System">
            <CommandItem onSelect={() => runCommand(togglePrivacyMode)}>
              {isPrivacyMode ? <Eye className="mr-2 h-4 w-4" /> : <EyeOff className="mr-2 h-4 w-4" />}
              <span>{isPrivacyMode ? "Disable Privacy Mode" : "Enable Privacy Mode"}</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
              <Sun className="mr-2 h-4 w-4" />
              <span>Light Mode</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark Mode</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
              <Laptop className="mr-2 h-4 w-4" />
              <span>System Theme</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => signOut({
                fetchOptions: {
                  onSuccess: () => {
                    router.push("/login");
                  },
                },
              }))}
              className="text-red-600 aria-selected:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log Out</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
