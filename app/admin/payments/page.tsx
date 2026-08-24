import { getAllPayments } from "@/lib/data/admin";
import { formatDate, formatFCFA } from "@/lib/utils/format";

export const metadata = { title: "Paiements" };

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  held: "bg-blue-100 text-blue-800",
  released: "bg-emerald-100 text-emerald-800",
  refunded: "bg-stone-200 text-stone-700",
  failed: "bg-red-100 text-red-800",
};

export default async function AdminPaymentsPage() {
  const payments = await getAllPayments();
  return (
    <div>
      <h1 className="text-2xl font-bold">Paiements</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Le paiement en ligne intégré est prévu pour la phase 2. Cette page recense les transactions
        enregistrées manuellement.
      </p>
      {payments.length === 0 ? (
        <p className="mt-10 text-center text-muted-foreground">Aucun paiement enregistré.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Montant</th>
                <th className="px-4 py-3">Méthode</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{formatFCFA(p.amount)}</td>
                  <td className="px-4 py-3">{p.method}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(p.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[p.status]}`}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
