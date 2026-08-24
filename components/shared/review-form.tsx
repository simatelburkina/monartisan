"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReviewForm({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, rating, comment }),
    });
    setLoading(false);
    if (res.ok) router.refresh();
  }

  return (
    <div className="mt-4 rounded-2xl border border-border bg-card p-4">
      <p className="font-semibold">Noter cette prestation</p>
      <div className="mt-2 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)} className="text-2xl">
            {n <= rating ? "⭐" : "☆"}
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Votre avis (optionnel)"
        className="textarea mt-2"
      />
      <button onClick={submit} disabled={loading} className="btn-primary mt-2">
        {loading ? "Envoi..." : "Envoyer mon avis"}
      </button>
    </div>
  );
}
