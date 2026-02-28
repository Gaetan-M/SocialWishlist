"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { wishlistApi, Wishlist } from "@/lib/api";

export default function DashboardPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [occasion, setOccasion] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (token) {
      wishlistApi
        .list(token)
        .then(setWishlists)
        .finally(() => setLoading(false));
    }
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setCreating(true);
    try {
      const wl = await wishlistApi.create(
        {
          title,
          occasion: occasion || undefined,
          event_date: eventDate || undefined,
        },
        token
      );
      setWishlists((prev) => [wl, ...prev]);
      setShowCreate(false);
      setTitle("");
      setOccasion("");
      setEventDate("");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm("Delete this wishlist? All items and contributions will be removed.")) return;
    await wishlistApi.delete(id, token);
    setWishlists((prev) => prev.filter((w) => w.id !== id));
  };

  if (authLoading || loading) {
    return <div className="flex justify-center py-20 text-gray-400">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Wishlists</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          + New Wishlist
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g. My Birthday Wishlist"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Occasion</label>
              <input
                type="text"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Birthday, Wedding..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {creating ? "Creating..." : "Create"}
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {wishlists.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-400 text-lg">Your wishlist is empty. Add your first item</p>
        </div>
      ) : (
        <div className="space-y-3">
          {wishlists.map((wl) => (
            <div
              key={wl.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <Link href={`/dashboard/wishlists/${wl.id}`} className="flex-1">
                <h3 className="font-semibold text-gray-900">{wl.title}</h3>
                <p className="text-sm text-gray-400">
                  {wl.occasion && `${wl.occasion} · `}
                  {wl.event_date || "No date set"}
                </p>
              </Link>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/list/${wl.slug}`;
                    navigator.clipboard.writeText(url);
                    alert("Link copied!");
                  }}
                  className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Share
                </button>
                <button
                  onClick={() => handleDelete(wl.id)}
                  className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
