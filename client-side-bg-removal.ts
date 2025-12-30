/**
 * Client-Side Background Removal Utility
 * 
 * This utility removes white/light backgrounds from images using the Canvas API.
 * Works entirely in the browser with no external dependencies or API calls.
 * 
 * Usage:
 * ```typescript
 * import { removeWhiteBackground } from './client-side-bg-removal';
 * 
 * const imageUrl = 'https://example.com/image-with-white-bg.png';
 * const transparentBlob = await removeWhiteBackground(imageUrl);
 * const transparentUrl = URL.createObjectURL(transparentBlob);
 * ```
 */

export interface BackgroundRemovalOptions {
  /**
   * Threshold for determining what counts as "white" (0-255)
   * Higher values = more aggressive removal
   * Default: 240 (removes very light colors)
   */
  threshold?: number;

  /**
   * Smoothing factor for edge detection (0-10)
   * Higher values = smoother edges but less precision
   * Default: 1
   */
  smoothing?: number;

  /**
   * Whether to apply feathering to edges
   * Creates a softer transition at edges
   * Default: true
   */
  feathering?: boolean;

  /**
   * Output format
   * Default: 'image/png'
   */
  outputFormat?: 'image/png' | 'image/webp';

  /**
   * Quality for lossy formats (0-1)
   * Only applies to webp
   * Default: 0.95
   */
  quality?: number;
}

/**
 * Remove white/light background from an image
 * Returns a Blob containing the transparent PNG
 */
export async function removeWhiteBackground(
  imageUrl: string,
  options: BackgroundRemovalOptions = {}
): Promise<Blob> {
  const {
    threshold = 240,
    smoothing = 1,
    feathering = true,
    outputFormat = 'image/png',
    quality = 0.95,
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image
        ctx.drawImage(img, 0, 0);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // First pass: Remove white/light pixels
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Calculate brightness
          const brightness = (r + g + b) / 3;

          // If pixel is close to white, make it transparent
          if (brightness > threshold) {
            data[i + 3] = 0; // Set alpha to 0 (transparent)
          }
        }

        // Second pass: Apply smoothing if requested
        if (smoothing > 0) {
          applyEdgeSmoothing(data, canvas.width, canvas.height, smoothing);
        }

        // Third pass: Apply feathering if requested
        if (feathering) {
          applyFeathering(data, canvas.width, canvas.height);
        }

        // Put modified data back
        ctx.putImageData(imageData, 0, 0);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          outputFormat,
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.src = imageUrl;
  });
}

/**
 * Apply edge smoothing to reduce jagged edges
 */
function applyEdgeSmoothing(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  smoothing: number
): void {
  const tempData = new Uint8ClampedArray(data);

  for (let y = smoothing; y < height - smoothing; y++) {
    for (let x = smoothing; x < width - smoothing; x++) {
      const i = (y * width + x) * 4;

      // Only smooth edges (where alpha is between 0 and 255)
      const alpha = tempData[i + 3];
      if (alpha > 0 && alpha < 255) {
        let sumR = 0, sumG = 0, sumB = 0, sumA = 0, count = 0;

        // Average surrounding pixels
        for (let dy = -smoothing; dy <= smoothing; dy++) {
          for (let dx = -smoothing; dx <= smoothing; dx++) {
            const ni = ((y + dy) * width + (x + dx)) * 4;
            sumR += tempData[ni];
            sumG += tempData[ni + 1];
            sumB += tempData[ni + 2];
            sumA += tempData[ni + 3];
            count++;
          }
        }

        data[i] = sumR / count;
        data[i + 1] = sumG / count;
        data[i + 2] = sumB / count;
        data[i + 3] = sumA / count;
      }
    }
  }
}

/**
 * Apply feathering to create softer edges
 */
function applyFeathering(
  data: Uint8ClampedArray,
  width: number,
  height: number
): void {
  const tempData = new Uint8ClampedArray(data);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;
      const alpha = tempData[i + 3];

      // Only feather edges
      if (alpha > 0 && alpha < 255) {
        // Check surrounding pixels
        const top = tempData[((y - 1) * width + x) * 4 + 3];
        const bottom = tempData[((y + 1) * width + x) * 4 + 3];
        const left = tempData[(y * width + (x - 1)) * 4 + 3];
        const right = tempData[(y * width + (x + 1)) * 4 + 3];

        // If next to transparent pixel, reduce alpha slightly
        if (top === 0 || bottom === 0 || left === 0 || right === 0) {
          data[i + 3] = Math.floor(alpha * 0.8);
        }
      }
    }
  }
}

/**
 * Convert a Blob to a data URL
 */
export async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * React hook for background removal
 * 
 * Usage:
 * ```tsx
 * const { removeBackground, isProcessing, error } = useBackgroundRemoval();
 * 
 * const handleClick = async () => {
 *   const blob = await removeBackground(imageUrl);
 *   setTransparentImage(URL.createObjectURL(blob));
 * };
 * ```
 */
export function useBackgroundRemoval() {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const removeBackground = async (
    imageUrl: string,
    options?: BackgroundRemovalOptions
  ): Promise<Blob> => {
    setIsProcessing(true);
    setError(null);

    try {
      const blob = await removeWhiteBackground(imageUrl, options);
      return blob;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  return { removeBackground, isProcessing, error };
}

// For non-React usage
export default removeWhiteBackground;
