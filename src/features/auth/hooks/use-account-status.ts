import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";

export function useAccountStatus() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && session?.user) {
      const userStatus = (session.user as any)?.status;
      if (userStatus === "active" || !userStatus) {
        router.push("/dashboard");
      } else {
        setStatus(userStatus);
      }
    } else if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  const isBanned = status === "banned";

  return {
    status,
    isPending,
    isBanned,
    handleLogout,
  };
}
