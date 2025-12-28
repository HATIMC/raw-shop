import { useState, useEffect } from 'react';

interface ImageUploaderProps {
  currentUrl?: string;
  onUploadComplete: (url: string) => void;
  label?: string;
  onUploadingChange?: (isUploading: boolean) => void;
}

export default function ImageUploader({ currentUrl, onUploadComplete, label = 'Image', onUploadingChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentUrl || '');
  const [uploadNotice, setUploadNotice] = useState('');

  const getApiUrl = () => {
    const globalCfg = (window as any).__ADMIN_RUNTIME__ || {};
    const params = new URLSearchParams(window.location.search);
    const lsApi = localStorage.getItem('ADMIN_API_URL');
    return params.get('api_url') || lsApi || globalCfg.API_URL || (import.meta as any).env?.VITE_API_URL || 'http://localhost:5174';
  };

  // If currentUrl is a relative path (e.g. /images/...), resolve it to the API URL so the Admin
  // (running on a different origin) can preview images saved to the local API server.
  useEffect(() => {
    if (!currentUrl) {
      setPreviewUrl('');
      setUploadNotice('');
      return;
    }

    const adminOrigin = window.location.origin || '';
    const isAdminLocal = adminOrigin.includes('localhost') || adminOrigin.startsWith('file://');

    // Absolute URL case
    if (currentUrl.startsWith('http')) {
      try {
        const host = new URL(currentUrl).host;
        const isAbsoluteLocal = /^(localhost|127\.|10\.|192\.168\.|172\.)/i.test(host);
        if (isAbsoluteLocal && !isAdminLocal) {
          // Hosted admin cannot access localhost absolute URLs — show notice and keep current preview (often a data URL)
          setUploadNotice(`Image is stored at a local address and isn't reachable from this hosted Admin: ${currentUrl}`);
          return;
        }
      } catch (e) {
        // leave it if URL parsing fails
      }

      setPreviewUrl(currentUrl);
      setUploadNotice('');
      return;
    }

    // Relative path (e.g. /images/foo.png) — only resolve to the API if it's safe to fetch from this origin
    const API_URL = getApiUrl();
    const base = API_URL.replace(/\/$/, '');
    const resolved = currentUrl.startsWith('/') ? `${base}${currentUrl}` : `${base}/${currentUrl}`;

    try {
      const host = new URL(resolved).host;
      const isResolvedLocal = /^(localhost|127\.|10\.|192\.168\.|172\.)/i.test(host);
      if (isResolvedLocal && !isAdminLocal) {
        // Hosted admin can't fetch the resolved local URL — keep current preview (data URL) and show notice
        setUploadNotice(`Image saved as ${currentUrl}. It will be visible on the hosted Admin after you build & deploy.`);
        return;
      }
    } catch (e) {
      // If parsing fails, fall back to setting the preview
    }

    setPreviewUrl(resolved);
    setUploadNotice('');
  }, [currentUrl]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    let dataUrl: string | null = null;
    reader.onloadend = () => {
      dataUrl = reader.result as string;
      setPreviewUrl(dataUrl);
    };
    reader.readAsDataURL(file);

    // Upload to server (API URL configurable via runtime overrides)
    setUploading(true);
    if (onUploadingChange) onUploadingChange(true);
    setUploadNotice('');
    try {
      const API_URL = getApiUrl();
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_URL}/api/upload-image`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        const imageUrl = result.imageUrl || result.localUrl || '';
        const localUrl = result.localUrl || '';
        const adminOrigin = window.location.origin || '';
        const isAdminLocal = adminOrigin.includes('localhost') || adminOrigin.startsWith('file://');

        // Choose a safe preview strategy:
        // - If Admin runs locally, use the local absolute URL so preview works immediately.
        // - If Admin is remote (hosted), avoid setting the preview to a localhost URL; keep the data-URL preview
        //   and show an inline notice explaining that the image will be visible after deploy.
        const base = API_URL.replace(/\/$/, '');
        let previewToUse = '';
        if (isAdminLocal) {
          if (localUrl) previewToUse = localUrl;
          else if (imageUrl.startsWith('http')) previewToUse = imageUrl;
          else if (imageUrl) previewToUse = imageUrl.startsWith('/') ? `${base}${imageUrl}` : `${base}/${imageUrl}`;
        } else {
          // hosted Admin: avoid loading local addresses (which would be blocked)
          if (imageUrl && imageUrl.startsWith('http') && !/^(?:http:\/\/localhost|http:\/\/127\.|http:\/\/10\.|http:\/\/192\.168\.|http:\/\/172\.)/i.test(imageUrl)) {
            previewToUse = imageUrl; // public URL
          } else {
            // Keep the client-side data URL preview if available
            previewToUse = dataUrl || '';

            if (localUrl && (localUrl.startsWith('http://localhost') || localUrl.startsWith('http://127.0.0.1'))) {
              setUploadNotice(`Image uploaded to local API. It is accessible at: ${localUrl}. It will be visible on the hosted Admin after you build & deploy. Relative path: ${imageUrl}`);
            } else if (imageUrl && imageUrl.startsWith('/images')) {
              setUploadNotice(`Image saved as ${imageUrl}. It will be visible on the hosted Admin after you build & deploy.`);
            }
          }
        }

        if (previewToUse) setPreviewUrl(previewToUse);

        // Pass the relative imageUrl (e.g. /images/filename) so it will be valid after deploy
        onUploadComplete(imageUrl);
        setUploadNotice((prev) => prev || `✅ Image uploaded: ${result.fileName}`);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadNotice('⚠️ Failed to upload image. Make sure API server is running.');
      setPreviewUrl(currentUrl || '');
    } finally {
      setUploading(false);
      if (onUploadingChange) onUploadingChange(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      
      <div className="flex gap-3 items-start">
        {/* Preview */}
        {previewUrl && (
          <div className="w-24 h-24 border rounded overflow-hidden bg-gray-100 flex-shrink-0">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>
        )}

        {/* Upload button */}
        <div className="flex-1">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
          />
          <p className="text-xs text-gray-500 mt-1">
            {uploading ? '⏳ Uploading...' : 'Upload from your computer (max 5MB)'}
          </p>
          {uploadNotice && (
            <div className="text-xs text-gray-600 mt-1 break-words">{uploadNotice}</div>
          )}
        </div>
      </div>

      {/* Current URL input */}
      <input
        type="text"
        value={currentUrl || ''}
        onChange={(e) => { onUploadComplete(e.target.value); setPreviewUrl(e.target.value); }}
        placeholder="Or paste image URL..."
        className="input text-sm"
      />
    </div>
  );
}
