import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { NotificationType } from "@/lib/types/database";

export async function notify(params: {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
}) {
  const admin = createAdminClient();
  await admin.from("notifications").insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    body: params.body,
    link: params.link,
    channel: "app",
  });
}

export async function notifyMany(
  userIds: string[],
  params: { type: NotificationType; title: string; body?: string; link?: string }
) {
  if (userIds.length === 0) return;
  const admin = createAdminClient();
  await admin.from("notifications").insert(
    userIds.map((userId) => ({
      user_id: userId,
      type: params.type,
      title: params.title,
      body: params.body,
      link: params.link,
      channel: "app",
    }))
  );
}
