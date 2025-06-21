"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { UploadCloud, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AppCustomClassificationModel = () => {
  const modelInputRef = useRef(null);
  const [models, setModels] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const fetchModels = async () => {
    try {
      const res = await fetch("/api/models");
      if (!res.ok) throw new Error("Failed to fetch models");
      const data = await res.json();
      console.log(data);
      
      setModels(data);
    } catch (err) {
      toast.error("Error fetching models", { description: err.message });
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleModelUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validExtensions = [".pt", ".onnx", ".pkl", ".h5"];
    const isValid = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!isValid) {
      toast.error("Unsupported file type", {
        description: "Please upload a valid model file (.pt, .onnx, etc.)",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "description",
        `Model uploaded on ${new Date().toLocaleDateString()}`
      );

      const response = await fetch("/api/models", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload model");

      const newModel = await response.json();
      setModels((prev) => [...prev, newModel]);
      toast.success("Model uploaded and saved successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload model", { description: error.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = async (modelId) => {
    try {
      const response = await fetch(`/api/models?id=${modelId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete model");

      setModels((prev) => prev.filter((m) => m.id !== modelId));
      toast.success("Model deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete model", {
        description: error.message,
      });
    }
  };

  return (
    <div className="w-full p-4">
      <h3 className="text-3xl font-bold mb-4">Upload Your Own <span className="text-indigo-600">Custom Model</span></h3>
      <input
        type="file"
        accept=".pt,.onnx,.pkl,.h5"
        ref={modelInputRef}
        onChange={handleModelUpload}
        className="hidden"
        disabled={isUploading}
      />

      <Button
        variant="outline"
        onClick={() => modelInputRef.current?.click()}
        className="flex items-center gap-2 mb-4"
        disabled={isUploading}
      >
        <UploadCloud className="w-4 h-4" />
        {isUploading ? "Uploading..." : "Upload Model (pt, onnx, pkl, h5)"}
      </Button>

      <div className="mt-6">
        {models.length === 0 ? (
          <p className="text-muted-foreground">No models uploaded.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Uploaded At</TableHead>
                <TableHead>Size(K.B)</TableHead>
                <TableHead>File Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((model) => (
                <TableRow key={model.id}>
                  <TableCell>{model.name}</TableCell>
                  <TableCell>
                    {new Date(model.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>{model.fileSize}</TableCell>
                  <TableCell>{model.fileType}</TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleClear(model.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
                
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default AppCustomClassificationModel;
