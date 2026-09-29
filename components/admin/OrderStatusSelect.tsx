"use client";

import { useState } from "react";
import { updateOrderStatus } from "@/lib/actions/admin";
import type { OrderStatus } from "@/lib/supabase/types";

const statusOptions: OrderStatus[] = ["pending", "confirmed", "dispatched", "completed", "cancelled"];
const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  dispatched: "bg-purple-50 text-purple-700 border-purple-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function OrderStatusSelect({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleChange = async (newStatus: string) => {
    setLoading(true);
    setStatus(newStatus);
    await updateOrderStatus(orderId, newStatus as OrderStatus);
    setLoading(false);
  };

  return (
    <select
      value={status}
      onChange={(e) => handleChange(e.target.value)}
      disabled={loading}
      className={`px-2 py-1 rounded-lg text-xs font-medium border outline-none cursor-pointer disabled:opacity-50 ${statusColors[status] || "bg-gray-50 text-gray-700 border-gray-200"}`}
    >
      {statusOptions.map((s) => (
        <option key={s} value={s}>
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </option>
      ))}
    </select>
  );
}
