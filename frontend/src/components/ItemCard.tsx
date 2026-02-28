"use client";

import { useState } from "react";
import { WishlistItem, contributionApi } from "@/lib/api";
import { formatPrice, getStatusBadge } from "@/lib/utils";
import ProgressBar from "./ProgressBar";
import Toast from "./Toast";

interface ItemCardProps {
  item: WishlistItem;
  currency: string;
  token: string | null;
  isOwner: boolean;
  onUpdate?: () => void;
}

export default function ItemCard({ item, currency, token, isOwner, onUpdate }: ItemCardProps) {
  const [showContribute, setShowContribute] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const badge = getStatusBadge(item.status, item.total_funded, item.price);
  const remaining = item.price - item.total_funded;
  const isFullyFunded = item.status === "FULLY_FUNDED";

  const handleReserve = async () => {
    if (!token) return;
    setLoading(true);
    try {
      await contributionApi.reserve(item.id, token);
      setToast({ message: "Item reserved!", type: "success" });
      onUpdate?.();
    } catch (e: unknown) {
      setToast({ message: e instanceof Error ? e.message : "Failed to reserve", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleContribute = async () => {
    if (!token) return;
    const cents = Math.round(parseFloat(amount) * 100);
    if (isNaN(cents) || cents < 1) {
      setToast({ message: "Enter a valid amount", type: "error" });
      return;
    }
    setLoading(true);
    try {
      await contributionApi.create(item.id, cents, token);
      setToast({ message: "Contribution recorded!", type: "success" });
      setShowContribute(false);
      setAmount("");
      onUpdate?.();
    } catch (e: unknown) {
      setToast({ message: e instanceof Error ? e.message : "Failed to contribute", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {item.image_url ? (
        <img src={item.image_url} alt={item.name} className="w-full h-48 object-cover" />
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
          <svg className="w-16 h-16 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 flex-1">{item.name}</h3>
          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${badge.color}`}>
            {badge.label}
          </span>
        </div>

        <p className="text-xl font-bold text-indigo-600 mb-2">{formatPrice(item.price, currency)}</p>

        <ProgressBar funded={item.total_funded} total={item.price} />

        <div className="flex justify-between text-sm text-gray-500 mt-1 mb-3">
          <span>{formatPrice(item.total_funded, currency)} funded</span>
          <span>{item.contributor_count} contributor{item.contributor_count !== 1 ? "s" : ""}</span>
        </div>

        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-500 hover:text-indigo-700 underline block mb-3"
          >
            View product link
          </a>
        )}

        {!isOwner && !isFullyFunded && token && (
          <div className="flex gap-2">
            {item.total_funded === 0 && (
              <button
                onClick={handleReserve}
                disabled={loading}
                className="flex-1 py-2.5 px-4 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
              >
                Reserve
              </button>
            )}
            <button
              onClick={() => setShowContribute(!showContribute)}
              className="flex-1 py-2.5 px-4 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors"
            >
              Contribute
            </button>
          </div>
        )}

        {!isOwner && !isFullyFunded && !token && (
          <p className="text-sm text-gray-400 text-center py-2">Log in to contribute</p>
        )}

        {showContribute && (
          <div className="mt-3 flex gap-2">
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={(remaining / 100).toFixed(2)}
              placeholder={`Max ${formatPrice(remaining, currency)}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              onClick={handleContribute}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
