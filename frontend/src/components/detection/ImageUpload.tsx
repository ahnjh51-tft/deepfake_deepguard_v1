import { useCallback, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onImageSelect: (file: File | null, previewUrl: string | null) => void;
}

const ImageUpload = ({ onImageSelect }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "エラー",
          description: "画像ファイルを選択してください",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 8 * 1024 * 1024) {
        toast({
          title: "エラー",
          description: "ファイルサイズは8MB以下にしてください",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        onImageSelect(file, result);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect, toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const clearImage = useCallback(() => {
    setPreview(null);
    onImageSelect(null, null);
  }, [onImageSelect]);

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={`relative border-2 border-dashed rounded-lg transition-all ${
          isDragging
            ? "border-intel-medium-blue bg-intel-pale-blue/20"
            : "border-intel-pale-blue/60 bg-white hover:border-intel-medium-blue/60 hover:bg-intel-pale-blue/10"
        }`}
      >
        {preview ? (
          <div className="relative group">
            <img src={preview} alt="Preview" className="w-full h-64 object-contain rounded-lg" />
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 p-2 bg-intel-dark-blue text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-64 cursor-pointer">
            <input type="file" accept="image/*" onChange={handleChange} className="hidden" />
            <div className="text-center space-y-3">
              <div className="mx-auto w-16 h-16 rounded-full bg-intel-pale-blue/30 flex items-center justify-center">
                {isDragging ? (
                  <ImageIcon className="w-8 h-8 text-intel-medium-blue animate-pulse" />
                ) : (
                  <Upload className="w-8 h-8 text-intel-medium-blue" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-intel-medium-blue">
                  {isDragging ? "ここにドロップ" : "クリックまたはドラッグ＆ドロップ"}
                </p>
                <p className="text-xs text-foreground/60">PNG, JPG, WEBP (最大8MB)</p>
              </div>
            </div>
          </label>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
