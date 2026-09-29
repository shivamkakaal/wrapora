"use client";

import { useState, useRef } from "react";
import {
  Upload,
  X,
  Image as ImageIcon,
  Check,
  Loader2,
  Star,
  Plus,
  ArrowLeftRight,
} from "lucide-react";

import { uploadImageAction } from "@/lib/actions/upload";

interface MultiImageUploadZoneProps {
  images: string[];
  onChange: (images: string[]) => void;
  label?: string;
  helperText?: string;
}

export default function MultiImageUploadZone({
  images,
  onChange,
  label = "Product Images",
  helperText = "First image is the primary cover photo. Supports JPG, PNG, WEBP files up to 10MB (Max 10MB).",
}: MultiImageUploadZoneProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [showUrlBox, setShowUrlBox] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    setError("");
    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          throw new Error(`"${file.name}" is not an image file.`);
        }
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`"${file.name}" exceeds 10MB limit. Image should not be more than 10MB.`);
        }

        const formData = new FormData();
        formData.append("file", file);

        const res = await uploadImageAction(formData);

        if (!res.ok || !res.url) {
          throw new Error(res.error || "Failed to upload image");
        }

        uploadedUrls.push(res.url);
      }

      onChange([...images, ...uploadedUrls]);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const rest = images.filter((_, i) => i !== index);
    onChange([target, ...rest]);
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    onChange([...images, trimmed]);
    setUrlInput("");
    setShowUrlBox(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold text-ink flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-[#D91B60]" />
            <span>{label}</span>
            <span className="text-[11px] font-normal text-ink/50">({images.length} added)</span>
          </label>
          <p className="text-[11px] text-ink/50 mt-0.5">{helperText}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowUrlBox(!showUrlBox)}
            className="text-xs text-royal font-semibold hover:underline"
          >
            {showUrlBox ? "Cancel URL" : "+ Add by URL"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
          {error}
        </div>
      )}

      {showUrlBox && (
        <div className="flex items-center gap-2 p-3 bg-purple-50/50 rounded-xl border border-purple-100">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://images.unsplash.com/... or image link"
            className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-royal"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="brand-gradient text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90"
          >
            Add Image
          </button>
        </div>
      )}

      {/* Grid of Images + Upload Placeholder */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((url, idx) => (
          <div
            key={idx}
            className={`group relative rounded-xl overflow-hidden border-2 bg-gray-50 aspect-square shadow-xs ${
              idx === 0 ? "border-[#D91B60] ring-2 ring-pink-100" : "border-gray-200"
            }`}
          >
            <img
              src={url}
              alt={`Product preview ${idx + 1}`}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            />

            {/* Cover Badge */}
            {idx === 0 && (
              <span className="absolute top-1.5 left-1.5 bg-[#D91B60] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                <Star className="w-2.5 h-2.5 fill-white" /> Cover Photo
              </span>
            )}

            {/* Hover Actions */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2 backdrop-blur-2xs">
              {idx !== 0 && (
                <button
                  type="button"
                  onClick={() => handleSetCover(idx)}
                  className="px-2.5 py-1 rounded-lg bg-white text-[11px] font-bold text-[#250842] hover:bg-gray-100 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeftRight className="w-3 h-3" /> Make Cover
                </button>
              )}
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="px-2.5 py-1 rounded-lg bg-red-600 text-[11px] font-bold text-white hover:bg-red-700 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3 h-3" /> Remove
              </button>
            </div>
          </div>
        ))}

        {/* Upload Placeholder Tile */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-purple-200 hover:border-[#D91B60] rounded-xl aspect-square flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all bg-purple-50/20 hover:bg-pink-50/30 group"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-1.5">
              <Loader2 className="w-6 h-6 text-[#D91B60] animate-spin" />
              <p className="text-[11px] font-bold text-ink">Uploading...</p>
              <p className="text-[9px] text-ink/40">Up to 10MB</p>
            </div>
          ) : (
            <>
              <div className="w-9 h-9 rounded-xl bg-white border border-purple-100 text-[#D91B60] flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
                <Upload className="w-4 h-4" />
              </div>
              <p className="text-[11px] font-bold text-ink mt-2">Upload Photo</p>
              <p className="text-[9px] text-ink/40 mt-0.5">Drag & drop or click</p>
              <span className="text-[9px] font-semibold text-[#D91B60] mt-1 bg-pink-50 px-2 py-0.5 rounded-full">
                Max 10MB
              </span>
            </>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
        }}
      />
    </div>
  );
}
