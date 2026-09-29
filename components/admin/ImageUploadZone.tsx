"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Check, Loader2, Sparkles } from "lucide-react";

import { uploadImageAction } from "@/lib/actions/upload";

interface ImageUploadZoneProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  aspectRatio?: "square" | "video" | "banner" | "portrait" | "auto";
  placeholderText?: string;
}

export default function ImageUploadZone({
  value = "",
  onChange,
  label = "Upload Image",
  helperText = "Supports high-resolution JPG, PNG, WEBP files up to 10MB (Max 10MB)",
  aspectRatio = "auto",
  placeholderText = "Click or drag & drop to upload high-res photo",
}: ImageUploadZoneProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG, PNG, WEBP).");
      return;
    }

    // 10MB check
    if (file.size > 10 * 1024 * 1024) {
      setError("File exceeds 10MB limit. Image should not be more than 10MB.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadImageAction(formData);

      if (!res.ok || !res.url) {
        throw new Error(res.error || "Failed to upload image");
      }

      onChange(res.url);
      setUrlInput(res.url);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleUrlApply = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setError("");
    }
  };

  const handleClear = () => {
    onChange("");
    setUrlInput("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const aspectClass =
    aspectRatio === "square"
      ? "aspect-square"
      : aspectRatio === "video"
      ? "aspect-video"
      : aspectRatio === "banner"
      ? "aspect-[21/9]"
      : aspectRatio === "portrait"
      ? "aspect-[3/4]"
      : "min-h-[140px]";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-ink flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-[#D91B60]" />
          <span>{label}</span>
        </label>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
              mode === "upload"
                ? "bg-purple-100 text-[#250842]"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            File Upload
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
              mode === "url"
                ? "bg-purple-100 text-[#250842]"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            Paste URL
          </button>
        </div>
      </div>

      {error && (
        <p className="text-[11px] font-medium text-red-600 bg-red-50 p-2 rounded-lg">
          {error}
        </p>
      )}

      {mode === "upload" ? (
        <div>
          {value ? (
            /* Image Preview Card with placeholder frame */
            <div className="relative rounded-2xl overflow-hidden border border-purple-100 bg-gray-50 group shadow-xs">
              <div className={`w-full ${aspectClass} overflow-hidden flex items-center justify-center bg-gray-900/5`}>
                <img
                  src={value}
                  alt="Uploaded Preview"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                />
              </div>

              {/* Overlay actions on hover */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl bg-white text-xs font-bold text-[#250842] hover:bg-gray-100 transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Change</span>
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 text-xs font-bold text-white hover:bg-red-700 transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>

              <div className="p-2.5 bg-white border-t border-purple-50 flex items-center justify-between text-[11px] text-ink/60">
                <span className="truncate max-w-[200px] font-mono">{value}</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1 flex-shrink-0">
                  <Check className="w-3 h-3" /> Ready
                </span>
              </div>
            </div>
          ) : (
            /* Upload Dropzone Placeholder */
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed border-purple-200 hover:border-[#D91B60] rounded-2xl p-6 text-center cursor-pointer transition-all bg-purple-50/20 hover:bg-pink-50/30 flex flex-col items-center justify-center gap-2 ${aspectClass}`}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2 py-4">
                  <Loader2 className="w-8 h-8 text-[#D91B60] animate-spin" />
                  <p className="text-xs font-bold text-[#250842]">Uploading high-res image...</p>
                  <p className="text-[10px] text-ink/50">Processing file (up to 10MB)</p>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-purple-100 flex items-center justify-center text-[#D91B60]">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-ink">{placeholderText}</p>
                    <p className="text-[11px] text-ink/50 mt-0.5">{helperText}</p>
                  </div>
                  <span className="mt-1 px-3 py-1 rounded-full bg-white border border-purple-100 text-[10px] font-bold text-[#250842] shadow-2xs">
                    Choose from Computer / Phone
                  </span>
                </>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />
        </div>
      ) : (
        /* URL Input Fallback Mode */
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://images.unsplash.com/... or image link"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-ink focus:border-[#D91B60] focus:ring-1 focus:ring-[#D91B60] outline-none"
            />
            <button
              type="button"
              onClick={handleUrlApply}
              className="px-4 py-2.5 rounded-xl bg-[#250842] text-white text-xs font-bold hover:bg-[#350B5C] transition-colors flex-shrink-0 cursor-pointer"
            >
              Apply
            </button>
          </div>

          {value && (
            <div className="relative rounded-xl overflow-hidden border border-gray-200 h-28 bg-gray-50 flex items-center justify-center">
              <img src={value} alt="Preview" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-2 right-2 p-1 rounded-full bg-red-600 text-white hover:bg-red-700 cursor-pointer shadow-sm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
