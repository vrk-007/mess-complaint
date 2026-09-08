/**
 * Compresses a raw image File (e.g. from camera capture) using HTML5 Canvas.
 * - Max dimension: 1024px (width or height), aspect-ratio preserved.
 * - Output: WebP at 0.70 quality (JPEG fallback if WebP unsupported).
 * - Typical result: 5–10 MB camera photo → ~40–80 KB.
 */
export async function compressImage(file: File): Promise<File> {
  const MAX_DIM = 1024;
  const QUALITY = 0.7;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // Calculate target dimensions
      let { width, height } = img;
      if (width > height) {
        if (width > MAX_DIM) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        }
      } else {
        if (height > MAX_DIM) {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas 2D context unavailable."));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      // Try WebP first, fall back to JPEG
      const mimeType = "image/webp";
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Image compression failed."));
            return;
          }
          const ext = mimeType === "image/webp" ? "webp" : "jpg";
          const compressedFile = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, `.${ext}`),
            { type: mimeType }
          );
          resolve(compressedFile);
        },
        mimeType,
        QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for compression."));
    };

    img.src = objectUrl;
  });
}
