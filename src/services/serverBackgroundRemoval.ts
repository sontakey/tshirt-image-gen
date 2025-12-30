import sharp from 'sharp';
import axios from 'axios';

export interface BackgroundRemovalOptions {
  /**
   * Threshold for determining what counts as "white" (0-255)
   * Higher values = more aggressive removal
   * Default: 240
   */
  threshold?: number;

  /**
   * Whether to apply edge smoothing
   * Default: true
   */
  smoothEdges?: boolean;
}

export class ServerBackgroundRemoval {
  /**
   * Remove white/light background from an image URL
   * Returns a Buffer containing the transparent PNG
   */
  async removeWhiteBackground(
    imageUrl: string,
    options: BackgroundRemovalOptions = {}
  ): Promise<Buffer> {
    const { threshold = 240, smoothEdges = true } = options;

    try {
      // Download the image
      console.log(`Downloading image from: ${imageUrl}`);
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
      });
      const imageBuffer = Buffer.from(response.data);

      // Get image metadata
      const metadata = await sharp(imageBuffer).metadata();
      const { width, height } = metadata;

      if (!width || !height) {
        throw new Error('Could not determine image dimensions');
      }

      console.log(`Processing ${width}x${height} image with threshold ${threshold}`);

      // Extract raw pixel data
      const { data, info } = await sharp(imageBuffer)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      // Process pixels to remove white background
      const pixelArray = new Uint8ClampedArray(data);
      
      for (let i = 0; i < pixelArray.length; i += 4) {
        const r = pixelArray[i];
        const g = pixelArray[i + 1];
        const b = pixelArray[i + 2];

        // Calculate brightness
        const brightness = (r + g + b) / 3;

        // If pixel is close to white, make it transparent
        if (brightness > threshold) {
          pixelArray[i + 3] = 0; // Set alpha to 0 (transparent)
        } else {
          // Keep original alpha for non-white pixels
          pixelArray[i + 3] = 255;
        }
      }

      // Apply edge smoothing if requested
      let processedBuffer: Buffer = Buffer.from(pixelArray);
      
      if (smoothEdges) {
        const smoothed = await this.smoothEdges(
          processedBuffer,
          info.width,
          info.height,
          info.channels
        );
        processedBuffer = smoothed as Buffer;
      }

      // Convert back to PNG
      const transparentImage = await sharp(processedBuffer, {
        raw: {
          width: info.width,
          height: info.height,
          channels: info.channels,
        },
      })
        .png()
        .toBuffer();

      console.log(`Background removal complete. Output size: ${transparentImage.length} bytes`);

      return transparentImage;
    } catch (error) {
      console.error('Background removal error:', error);
      throw new Error(`Failed to remove background: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Apply edge smoothing to reduce jagged edges
   */
  private async smoothEdges(
    buffer: Buffer,
    width: number,
    height: number,
    channels: number
  ): Promise<Buffer> {
    const data = new Uint8ClampedArray(buffer);
    const tempData = new Uint8ClampedArray(data);

    // Simple edge smoothing: average with neighbors for semi-transparent pixels
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = (y * width + x) * channels;
        const alpha = tempData[i + 3];

        // Only smooth edges (where alpha is between 0 and 255)
        if (alpha > 0 && alpha < 255) {
          // Get surrounding pixels
          const top = tempData[((y - 1) * width + x) * channels + 3];
          const bottom = tempData[((y + 1) * width + x) * channels + 3];
          const left = tempData[(y * width + (x - 1)) * channels + 3];
          const right = tempData[(y * width + (x + 1)) * channels + 3];

          // Average alpha with neighbors
          const avgAlpha = (alpha + top + bottom + left + right) / 5;
          data[i + 3] = Math.floor(avgAlpha);
        }
      }
    }

    return Buffer.from(data);
  }

  /**
   * Remove background and upload to storage (for use with Supabase Storage)
   * Returns the public URL of the transparent image
   */
  async removeBackgroundAndUpload(
    imageUrl: string,
    uploadFn: (buffer: Buffer, filename: string) => Promise<string>,
    filename: string,
    options?: BackgroundRemovalOptions
  ): Promise<string> {
    const transparentBuffer = await this.removeWhiteBackground(imageUrl, options);
    const transparentUrl = await uploadFn(transparentBuffer, filename);
    return transparentUrl;
  }

  /**
   * Check if an image has a mostly white background
   * Returns true if >80% of pixels are white
   */
  async hasWhiteBackground(imageUrl: string, threshold: number = 240): Promise<boolean> {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
      });
      const imageBuffer = Buffer.from(response.data);

      const { data } = await sharp(imageBuffer)
        .raw()
        .toBuffer({ resolveWithObject: true });

      const pixelArray = new Uint8ClampedArray(data);
      let whitePixels = 0;
      let totalPixels = 0;

      for (let i = 0; i < pixelArray.length; i += 3) {
        const r = pixelArray[i];
        const g = pixelArray[i + 1];
        const b = pixelArray[i + 2];
        const brightness = (r + g + b) / 3;

        if (brightness > threshold) {
          whitePixels++;
        }
        totalPixels++;
      }

      const whitePercentage = whitePixels / totalPixels;
      return whitePercentage > 0.8;
    } catch (error) {
      console.error('Error checking background:', error);
      return false;
    }
  }
}

export default ServerBackgroundRemoval;
