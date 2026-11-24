"use client";

import { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import {
  UploadCloud,
  ImagePlus,
  Video,
  X,
  ShieldAlert,
  ArrowLeft,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    if (
      !selectedFile.type.startsWith("image/") &&
      !selectedFile.type.startsWith("video/")
    ) {
      setError("Only images and videos are allowed.");
      return;
    }

    if (selectedFile.size > 100 * 1024 * 1024) {
      setError("Maximum file size is 100MB.");
      return;
    }

    if (preview) URL.revokeObjectURL(preview);

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setError("");
    setSuccess(false);
  }

  function removeFile() {
    if (preview) URL.revokeObjectURL(preview);

    setFile(null);
    setPreview("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function handleUpload() {
    if (!file || uploading) return;

    setUploading(true);
    setError("");
    setSuccess(false);

    try {
      const extension =
        file.name.split(".").pop()?.toLowerCase() || "bin";

      const filePath = `${crypto.randomUUID()}.${extension}`;

      const mediaType = file.type.startsWith("image/")
        ? "image"
        : "video";

      const { error: storageError } = await supabase.storage
        .from("media")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (storageError) throw storageError;

      const { error: databaseError } = await supabase
        .from("posts")
        .insert({
          media_path: filePath,
          media_type: mediaType,
          caption: caption.trim() || null,
        });

      if (databaseError) {
        await supabase.storage.from("media").remove([filePath]);
        throw databaseError;
      }

      setSuccess(true);
      setFile(null);
      setCaption("");
      setPreview("");

      if (inputRef.current) {
        inputRef.current.value = "";
      }

    } catch (err) {
      console.error("Upload error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Transmission failed. Please try again."
      );

    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#070707]">
      <Navbar />

      <section className="mx-auto max-w-3xl px-5 py-16">

        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 text-xs text-gray-500 hover:text-white"
        >
          <ArrowLeft size={15} />
          BACK TO FEED
        </Link>

        <div className="mb-10">

          <div className="mb-5 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />

            <span className="text-xs tracking-[0.25em] text-red-500">
              SECURE TRANSMISSION
            </span>
          </div>

          <h1 className="text-5xl font-black tracking-tighter sm:text-6xl">
            SEND INTO
            <br />
            <span className="text-red-600">THE DARK.</span>
          </h1>

          <p className="mt-5 text-sm leading-7 text-gray-500">
            Upload a photo or video. Add a caption if you wish.
            Your identity stays hidden.
          </p>

        </div>

        {/* UPLOAD AREA */}

        <div className="border border-dashed border-white/15 bg-[#0c0c0c] p-6 sm:p-10">

          {!file ? (

            <button
              onClick={() => inputRef.current?.click()}
              className="flex min-h-[230px] w-full flex-col items-center justify-center text-center transition hover:bg-white/[0.02]"
            >

              <div className="mb-6 flex h-16 w-16 items-center justify-center border border-red-500/30 bg-red-500/10">
                <UploadCloud size={30} className="text-red-500" />
              </div>

              <h3 className="text-sm font-bold tracking-widest">
                DROP YOUR MEDIA HERE
              </h3>

              <p className="mt-3 text-xs text-gray-600">
                Select a photo or video from your device.
              </p>

              <div className="mt-6 flex gap-3">

                <span className="flex items-center gap-2 border border-white/10 px-4 py-2 text-xs text-gray-400">
                  <ImagePlus size={14} />
                  PHOTO
                </span>

                <span className="flex items-center gap-2 border border-white/10 px-4 py-2 text-xs text-gray-400">
                  <Video size={14} />
                  VIDEO
                </span>

              </div>

            </button>

          ) : (

            <div>

              <div className="mb-5 flex items-center justify-between">

                <span className="text-xs font-bold tracking-widest text-green-500">
                  MEDIA SELECTED
                </span>

                <button
                  onClick={removeFile}
                  disabled={uploading}
                  className="flex items-center gap-2 text-xs text-red-500"
                >
                  <X size={15} />
                  REMOVE
                </button>

              </div>

              {file.type.startsWith("image/") ? (

                <img
                  src={preview}
                  alt="Selected media"
                  className="max-h-[450px] w-full object-contain"
                />

              ) : (

                <video
                  src={preview}
                  controls
                  className="max-h-[450px] w-full"
                />

              )}

              <p className="mt-4 break-all text-xs text-gray-500">
                {file.name}
              </p>

            </div>

          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
          />

        </div>

        {/* CAPTION */}

        <div className="mt-8">

          <div className="mb-3 flex items-center justify-between">

            <label className="text-xs font-bold tracking-widest">
              CAPTION
            </label>

            <span className="text-xs text-gray-600">
              OPTIONAL
            </span>

          </div>

          <textarea
            value={caption}
            disabled={uploading}
            onChange={(e) => setCaption(e.target.value.slice(0, 300))}
            placeholder="Say something... or remain silent."
            rows={4}
            className="w-full resize-none border border-white/10 bg-[#0c0c0c] p-5 text-sm text-white outline-none transition placeholder:text-gray-700 focus:border-red-500/50"
          />

          <p className="mt-2 text-right text-xs text-gray-700">
            {caption.length}/300
          </p>

        </div>

        {/* ERROR MESSAGE */}

        {error && (
          <div className="mt-6 border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* SUCCESS MESSAGE */}

        {success && (
          <div className="mt-6 flex items-center gap-3 border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-400">
            <CheckCircle2 size={20} />
            TRANSMISSION RECEIVED. Your media is now in the dark.
          </div>
        )}

        {/* TRANSMISSION BUTTON */}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="mt-6 flex w-full items-center justify-center gap-3 bg-red-600 py-5 text-xs font-black tracking-[0.2em] text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-30"
        >

          {uploading ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              TRANSMITTING...
            </>
          ) : (
            <>
              <ShieldAlert size={17} />
              TRANSMIT ANONYMOUSLY
            </>
          )}

        </button>

        <p className="mt-5 text-center text-[10px] tracking-widest text-gray-700">
          NO NAMES. NO IDENTITIES. JUST MEDIA.
        </p>

      </section>
    </main>
  );
}