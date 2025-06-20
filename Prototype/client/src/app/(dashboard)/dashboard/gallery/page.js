"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, UploadCloud, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

const getLocalStorageImages = () => {
  if (typeof window !== "undefined") {
    const storedImages = localStorage.getItem("uploadedImages");
    return storedImages ? JSON.parse(storedImages) : [];
  }
  return [];
};

export default function Page() {
  const [images, setImages] = useState(getLocalStorageImages());
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    localStorage.setItem("uploadedImages", JSON.stringify(images));
  }, [images]);

  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid File Type", {
        description: "Please upload an image file.",
      });
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newImage = {
          id: crypto.randomUUID(),
          url: event.target?.result,
          name: file.name,
          uploadedAt: new Date().toISOString(),
        };

        setImages((prev) => [...prev, newImage]);
        setIsUploading(false);
        toast.success("Upload Successful");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading image:", error);
      setIsUploading(false);
      toast.error("Upload Failed");
    }
  }, []);

  const handleDeleteImage = useCallback((id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    toast.success("Image Deleted");
  }, []);

  return (
    <div className="container p-6">
      <div className="flex mb-8 justify-between flex-wrap">
        <div>
          <h1 className="text-3xl font-bold mb-4">Image Gallery</h1>
          <p className="text-muted-foreground mb-6">
            Upload and manage your images.
          </p>
        </div>

        <div className="relative">
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
            disabled={isUploading}
          />
          <label
            htmlFor="image-upload"
            className={`inline-flex items-center justify-center px-6 py-3 rounded-md border-gray-300 dark:border-gray-700 cursor-pointer transition-colors ${
              isUploading
                ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
            }`}
          >
            <div className="flex flex-col items-center">
              <UploadCloud
                className={`w-6 h-6 mb-2 ${isUploading ? "animate-pulse" : ""}`}
              />
              <span className="font-medium">
                {isUploading ? "Uploading..." : "Upload Image"}
              </span>
              <span className="text-sm text-muted-foreground">
                PNG, JPG, GIF up to 5MB
              </span>
            </div>
          </label>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg w-full">
          <ImageIcon className="w-12 h-12 mb-4" />
          <h3 className="text-lg font-medium">No images uploaded yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Upload your first image to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <Card
              key={image.id}
              className="overflow-hidden group bg-transparent border-0 rounded-xl"
            >
              <CardContent className="p-0 relative">
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-48 object-cover rounded-xl"
                />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <div className="flex justify-between items-center">
                    <p className="text-white text-sm truncate">{image.name}</p>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteImage(image.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-3 rounded-full"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
