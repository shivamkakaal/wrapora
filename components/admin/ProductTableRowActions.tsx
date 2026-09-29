"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit, ExternalLink, Trash2, Loader2 } from "lucide-react";
import { deleteProduct } from "@/lib/actions/admin";

interface ProductTableRowActionsProps {
  productId: string;
  productSlug: string;
  productName: string;
}

export default function ProductTableRowActions({
  productId,
  productSlug,
  productName,
}: ProductTableRowActionsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      return;
    }

    setDeleting(true);
    const res = await deleteProduct(productId);
    if (res.ok) {
      router.refresh();
    } else {
      alert("Failed to delete product");
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/gifts/${productSlug}`}
        target="_blank"
        className="p-1.5 text-ink/40 hover:text-ink transition-colors"
        title="View on site"
      >
        <ExternalLink className="w-4 h-4" />
      </Link>
      <Link
        href={`/admin/products/${productId}`}
        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 hover:bg-royal-50 hover:text-royal transition-colors text-ink/70"
      >
        <Edit className="w-3.5 h-3.5" /> Edit
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer"
        title="Delete product"
      >
        {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
