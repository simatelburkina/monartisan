import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/data/auth";
import { getConversationThread } from "@/lib/data/messages";
import { MessageThread } from "@/components/shared/message-thread";
import { initials } from "@/lib/utils/format";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await requireUser();
  const { conversation, messages } = await getConversationThread(id);
  if (!conversation) notFound();

  const conv = conversation as unknown as {
    client_id: string;
    artisan_id: string;
    client: { profile: { display_name: string | null } };
    artisan: { profile: { display_name: string | null; company_name: string | null } };
  };

  if (me.id !== conv.client_id && me.id !== conv.artisan_id && me.role !== "admin") notFound();

  const other = me.id === conv.client_id ? conv.artisan.profile : conv.client.profile;
  const otherName = (other as { company_name?: string }).company_name || other.display_name || "Utilisateur";

  return (
    <div>
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Link href="/messages" className="text-lg">
          ←
        </Link>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {initials(otherName)}
        </div>
        <p className="font-medium">{otherName}</p>
      </header>
      <MessageThread conversationId={id} initialMessages={messages} currentUserId={me.id} />
    </div>
  );
}
