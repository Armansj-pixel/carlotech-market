"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OrderStatus } from "@/lib/supabase/types";

export default function OrderActions({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(newStatus: OrderStatus) {
    setLoading(true);
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex gap-2">
      {status === "pending_payment" && (
        <button
          disabled={loading}
          onClick={() => updateStatus("paid")}
          className="rounded-lg border border-signal-green/50 bg-signal-green/10 px-3 py-1.5 font-mono text-xs text-signal-green transition-colors hover:bg-signal-green/20 disabled:opacity-50"
        >
          Tandai lunas
        </button>
      )}
      {status === "paid" && (
        <button
          disabled={loading}
          onClick={() => updateStatus("delivered")}
          className="rounded-lg border border-signal-cyan/50 bg-signal-cyan/10 px-3 py-1.5 font-mono text-xs text-signal-cyan transition-colors hover:bg-signal-cyan/20 disabled:opacity-50"
        >
          Tandai terkirim
        </button>
      )}
      {(status === "pending_payment" || status === "paid") && (
        <button
          disabled={loading}
          onClick={() => updateStatus("cancelled")}
          className="rounded-lg border border-signal-red/50 bg-signal-red/10 px-3 py-1.5 font-mono text-xs text-signal-red transition-colors hover:bg-signal-red/20 disabled:opacity-50"
        >
          Batalkan
        </button>
      )}
    </div>
  );
}
