"use client";

import { useState, useRef } from "react";
import { uploadImage } from "@/actions/uploadImage";
import { toast } from "sonner";
import Image from "next/image";
import { useTranslation } from "@/app/context/TranslationContext";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUploader({ images, onChange, maxImages }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newImages = [...images];

    try {
      for (let i = 0; i < files.length; i++) {
        if (maxImages && newImages.length >= maxImages) {
           toast.error(t("ui:imageUploader.toast.maxImagesError", { max: maxImages }));
           break;
        }

        const file = files[i];
        
        // Basic validation
        if (!file.type.startsWith("image/")) {
          toast.error(t("ui:imageUploader.toast.invalidFileError", { name: file.name }));
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);

        const result = await uploadImage(formData);

        if (result.success && result.url) {
          newImages.push(result.url);
        } else {
          toast.error(result.error || t("ui:imageUploader.toast.uploadFailedError", { name: file.name }));
        }
      }

      onChange(newImages);
      toast.success(t("ui:imageUploader.toast.success"));
    } catch (error) {
      toast.error(t("ui:imageUploader.toast.uploadError"));
      console.error(error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset input
      }
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeImage = (indexToRemove: number) => {
    onChange(images.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full p-8 border border-dashed rounded-none flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 ${
          isDragging 
            ? "border-[#0A0A0A] bg-[#F4F4F5]" 
            : "border-[#D4D4D8] bg-[#FAFAFA] hover:border-[#A1A1AA] hover:bg-[#F4F4F5]"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFileSelect(e.target.files)}
          multiple
          accept="image/*"
          className="hidden"
        />
        <div className="text-center">
          {isUploading ? (
            <span className="text-[#0A0A0A] text-[14px] font-medium">{t("ui:imageUploader.uploading")}</span>
          ) : (
            <>
              <span className="block text-[#0A0A0A] text-[14px] font-medium">
                {t("ui:imageUploader.prompt")}
              </span>
              <span className="block text-[#71717A] text-[12px] mt-1">
                {t("ui:imageUploader.formats")}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div key={`${url}-${index}`} className="relative group aspect-square border border-[#E5E5E5] bg-[#FAFAFA]">
              <Image
                src={url}
                alt={t("ui:imageUploader.imageAlt", { number: index + 1 })}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                className="absolute top-2 right-2 bg-[#0A0A0A] text-white w-6 h-6 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 text-xs"
                title={t("ui:imageUploader.removeImageTitle")}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
