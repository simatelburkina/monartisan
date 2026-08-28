import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { getNotifications } from "@/lib/data/notifications";
import { NotificationBell } from "@/components/shared/notification-bell";
import type { Notification } from "@/lib/types/database";

export async function DashboardHeader({ userId }: { userId: string }) {
  const notifications = await getNotifications(userId);
  return (
    <>
      <Link
        href="/messages"
        className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Messages"
      >
        <MessageCircle size={19} strokeWidth={1.75} />
      </Link>
      <NotificationBell userId={userId} initial={notifications as Notification[]} />
    </>
  );
}
