import { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Camera, X, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onImageSelected: (imageFile: File, croppedImageUrl: string) => void;
  currentImage?: string;
}

export default function ImageUpload({ onImageSelected, currentImage }: ImageUploadProps) {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>(currentImage || '');
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 80,
    height: 80,
    x: 10,
    y: 10,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [showCrop, setShowCrop] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image must be less than 10MB',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewImage(result);
      setOriginalFile(file);
      setShowCrop(true);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const getCroppedImage = async (): Promise<string> => {
    if (!completedCrop || !imgRef.current) {
      return previewImage;
    }

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return previewImage;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const handleConfirmCrop = async () => {
    if (!originalFile) return;

    const croppedImageUrl = await getCroppedImage();
    setShowCrop(false);
    setPreviewImage(croppedImageUrl);
    onImageSelected(originalFile, croppedImageUrl);
    
    toast({
      title: 'Image uploaded!',
      description: 'Your photo is ready for transformation',
    });
  };

  const handleRemove = () => {
    setPreviewImage('');
    setOriginalFile(null);
    setShowCrop(false);
    setCompletedCrop(null);
  };

  return (
    <Card className="glass-card p-6">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Upload Your Photo</h3>
      <p className="text-sm text-gray-600 mb-4">
        Upload a selfie or photo to transform into an AI avatar that looks like you
      </p>

      {!previewImage ? (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            isDragging
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-300 hover:border-purple-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          data-testid="dropzone-image-upload"
        >
          <div className="flex flex-col items-center gap-4">
            <Upload className="w-12 h-12 text-gray-400" />
            <div>
              <p className="text-gray-700 font-medium mb-2">
                Drag and drop your photo here
              </p>
              <p className="text-sm text-gray-500 mb-4">or</p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="gap-2"
                  data-testid="button-upload-file"
                >
                  <Upload className="w-4 h-4" />
                  Choose File
                </Button>
                <Button
                  onClick={() => cameraInputRef.current?.click()}
                  variant="outline"
                  className="gap-2"
                  data-testid="button-open-camera"
                >
                  <Camera className="w-4 h-4" />
                  Take Photo
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Supports JPG, PNG (max 10MB)
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
            data-testid="input-file-upload"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
            data-testid="input-camera-capture"
          />
        </div>
      ) : showCrop ? (
        <div className="space-y-4">
          <div className="relative bg-black rounded-xl overflow-hidden">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
            >
              <img
                ref={imgRef}
                src={previewImage}
                alt="Preview"
                className="max-h-96 mx-auto"
                data-testid="img-crop-preview"
              />
            </ReactCrop>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleConfirmCrop}
              className="flex-1 bg-gradient-to-r from-purple-600 to-sky-600 hover:from-purple-700 hover:to-sky-700"
              data-testid="button-confirm-crop"
            >
              <Check className="w-4 h-4 mr-2" />
              Confirm
            </Button>
            <Button
              onClick={handleRemove}
              variant="outline"
              data-testid="button-cancel-crop"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
          <p className="text-xs text-gray-500 text-center">
            Drag the corners to adjust your crop area
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative bg-gray-100 rounded-xl overflow-hidden">
            <img
              src={previewImage}
              alt="Uploaded"
              className="w-full h-auto"
              data-testid="img-uploaded-preview"
            />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowCrop(true)}
              variant="outline"
              className="flex-1"
              data-testid="button-recrop"
            >
              Adjust Crop
            </Button>
            <Button
              onClick={handleRemove}
              variant="outline"
              data-testid="button-remove-image"
            >
              <X className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
