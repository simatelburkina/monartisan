import Link from "next/link";
import { getNotifications } from "@/lib/data/notifications";
import { NotificationBell } from "@/components/shared/notification-bell";
import type { Notification } from "@/lib/types/database";

export async function DashboardHeader({ userId }: { userId: string }) {
  const notifications = await getNotifications(userId);
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur">
      <Link href="/" className="flex items-center gap-2 font-bold text-primary">
        <span className="text-xl">🛠️</span> MON ARTISAN
      </Link>
      <div className="flex items-center gap-3">
        <Link href="/messages" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted" aria-label="Messages">
          💬
        </Link>
        <NotificationBell userId={userId} initial={notifications as Notification[]} />
      </div>
    </header>
  );
}
