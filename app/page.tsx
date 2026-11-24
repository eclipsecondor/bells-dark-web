"use client";

import { useCallback, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import {
  Radio,
  RefreshCw,
  Clock,
  CalendarDays,
  Image as ImageIcon,
  AlertTriangle,
} from "lucide-react";

type Post = {
  id: string;
  media_path: string;
  media_type: "image" | "video";
  caption: string | null;
  created_at: string;
};

type SortOption = "newest" | "oldest";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [sort, setSort] = useState<SortOption>("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("posts")
        .select("id, media_path, media_type, caption, created_at")
        .order("created_at", {
          ascending: sort === "oldest",
        });

      if (fetchError) throw fetchError;

      setPosts(data || []);
      setLastUpdated(new Date());
      setError("");
    } catch (err) {
      console.error("Feed error:", err);
      setError("Unable to connect to the transmission network.");
    } finally {
      setLoading(false);
    }
  }, [sort]);

  // Fetch immediately and refresh every 5 seconds.
  useEffect(() => {
    fetchPosts();

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchPosts();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchPosts]);

  function formatDate(date: string) {
    return new Date(date).toLocaleString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <main className="min-h-screen bg-[#070707]">
      <Navbar />

      {/* HERO SECTION */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:py-28">

          <div className="mb-6 flex items-center gap-3">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />

            <span className="text-xs tracking-[0.3em] text-red-500">
              ANONYMOUS NETWORK // ONLINE
            </span>
          </div>

          <h1 className="text-6xl font-black tracking-tighter sm:text-8xl">
            ENTER THE
            <br />
            <span className="text-red-600">DARK.</span>
          </h1>

          <p className="mt-7 max-w-xl text-sm leading-7 text-gray-500 sm:text-base">
            An anonymous media network. Upload images and videos.
            No public profiles. No usernames. Just media.
          </p>

          <div className="mt-10 flex items-center gap-3 text-xs text-gray-600">
            <Radio size={16} className="text-red-500" />
            <span>PUBLIC TRANSMISSION NETWORK</span>
          </div>

        </div>
      </section>

      {/* FEED SECTION */}
      <section className="mx-auto max-w-7xl px-5 py-16">

        {/* FEED HEADER */}
        <div className="mb-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">

          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />

              <span className="text-xs tracking-[0.25em] text-red-500">
                LIVE TRANSMISSIONS
              </span>
            </div>

            <h2 className="text-3xl font-black tracking-tight">
              THE FEED<span className="text-red-600">.</span>
            </h2>

            <p className="mt-2 text-xs text-gray-600">
              {posts.length} transmissions discovered
            </p>
          </div>

          {/* SORT CONTROLS */}
          <div className="flex flex-wrap items-center gap-3">

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <CalendarDays size={15} />
              SORT BY
            </div>

            <button
              onClick={() => setSort("newest")}
              className={`flex items-center gap-2 border px-4 py-3 text-xs transition ${
                sort === "newest"
                  ? "border-red-500 bg-red-500/10 text-red-500"
                  : "border-white/10 text-gray-500 hover:border-white/30"
              }`}
            >
              <Clock size={14} />
              NEWEST
            </button>

            <button
              onClick={() => setSort("oldest")}
              className={`flex items-center gap-2 border px-4 py-3 text-xs transition ${
                sort === "oldest"
                  ? "border-red-500 bg-red-500/10 text-red-500"
                  : "border-white/10 text-gray-500 hover:border-white/30"
              }`}
            >
              <CalendarDays size={14} />
              OLDEST
            </button>

            <button
              onClick={fetchPosts}
              className="flex items-center gap-2 border border-white/10 px-4 py-3 text-xs text-gray-500 transition hover:border-white/30 hover:text-white"
            >
              <RefreshCw size={14} />
              REFRESH
            </button>

          </div>
        </div>

        {/* UPDATE STATUS */}
        <div className="mb-8 flex items-center justify-between border-y border-white/10 py-3">

          <span className="text-[10px] tracking-widest text-gray-600">
            AUTO-REFRESH: EVERY 5 SECONDS
          </span>

          <span className="text-[10px] text-gray-600">
            {lastUpdated
              ? `LAST UPDATED: ${lastUpdated.toLocaleTimeString()}`
              : "CONNECTING..."}
          </span>

        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-8 flex items-center gap-3 border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-400">
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="py-24 text-center">
            <RefreshCw
              size={30}
              className="mx-auto animate-spin text-red-500"
            />

            <p className="mt-5 text-xs tracking-widest text-gray-500">
              SEARCHING THE NETWORK...
            </p>
          </div>
        )}

        {/* EMPTY FEED */}
        {!loading && posts.length === 0 && !error && (
          <div className="border border-white/10 bg-[#0c0c0c] px-5 py-24 text-center">

            <ImageIcon
              size={35}
              className="mx-auto text-gray-700"
            />

            <h3 className="mt-6 text-sm font-bold tracking-widest">
              NO TRANSMISSIONS FOUND
            </h3>

            <p className="mt-3 text-xs text-gray-600">
              Be the first to enter the dark.
            </p>

          </div>
        )}

        {/* MEDIA GRID */}
        {!loading && posts.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {posts.map((post) => {
              const mediaUrl = supabase.storage
                .from("media")
                .getPublicUrl(post.media_path).data.publicUrl;

              return (
                <article
                  key={post.id}
                  className="group overflow-hidden border border-white/10 bg-[#0c0c0c] transition hover:border-red-500/40"
                >

                  {/* MEDIA */}
                  <div className="relative bg-black">

                    {post.media_type === "image" ? (
                      <img
                        src={mediaUrl}
                        alt="Anonymous upload"
                        loading="lazy"
                        className="max-h-[500px] w-full object-contain"
                      />
                    ) : (
                      <video
                        src={mediaUrl}
                        controls
                        playsInline
                        preload="metadata"
                        className="max-h-[500px] w-full"
                      />
                    )}

                    <div className="absolute left-3 top-3 bg-black/80 px-3 py-2 text-[9px] tracking-widest text-red-500">
                      {post.media_type.toUpperCase()}
                    </div>

                  </div>

                  {/* POST DETAILS */}
                  <div className="p-5">

                    {post.caption && (
                      <p className="break-words text-sm leading-6 text-gray-300">
                        {post.caption}
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">

                      <span className="text-[9px] tracking-widest text-gray-600">
                        ANONYMOUS TRANSMISSION
                      </span>

                      <span className="text-[10px] text-gray-600">
                        {formatDate(post.created_at)}
                      </span>

                    </div>

                  </div>

                </article>
              );
            })}

          </div>
        )}

      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-5 py-10 text-center">

        <p className="text-xs font-black tracking-[0.2em]">
          BELLS <span className="text-red-600">DARK WEB</span>
        </p>

        <p className="mt-3 text-[10px] tracking-widest text-gray-700">
          NO NAMES. NO IDENTITIES. JUST MEDIA.
        </p>

        <p className="mt-5 text-[10px] text-gray-800">
          © 2026 BELLS DARK WEB
        </p>

      </footer>
    </main>
  );
}