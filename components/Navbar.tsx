import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="border-b border-white/10 bg-black">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">

        <Link href="/" className="flex items-center gap-2">
          <ShieldAlert size={20} className="text-red-500" />

          <span className="text-sm font-black tracking-[0.2em]">
            BELLS <span className="text-red-500">DARK WEB</span>
          </span>
        </Link>

        <Link
          href="/upload"
          className="bg-red-600 px-4 py-2 text-xs font-bold tracking-wider text-white transition hover:bg-red-700"
        >
          + UPLOAD
        </Link>

      </div>
    </nav>
  );
}