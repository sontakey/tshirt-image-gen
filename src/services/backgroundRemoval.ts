import axios from 'axios';
import sharp from 'sharp';

export interface BackgroundRemovalOptions {
  apiProvider?: 'remove.bg' | 'clipdrop' | 'photoroom' | 'local';
  apiKey?: string;
}

export class BackgroundRemovalService {
  private apiKey?: string;
  private provider: string;

  constructor(options: BackgroundRemovalOptions = {}) {
    this.provider = options.apiProvider || 'remove.bg';
    this.apiKey = options.apiKey || process.env.REMOVE_BG_API_KEY;
  }

  /**
   * Remove background from an image URL and return transparent PNG buffer
   */
  async removeBackground(imageUrl: string): Promise<Buffer> {
    try {
      // Download the original image
      const imageResponse = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
      });
      const imageBuffer = Buffer.from(imageResponse.data);

      // Remove background based on provider
      switch (this.provider) {
        case 'remove.bg':
          return await this.removeBackgroundWithRemoveBg(imageBuffer);
        case 'clipdrop':
          return await this.removeBackgroundWithClipdrop(imageBuffer);
        case 'photoroom':
          return await this.removeBackgroundWithPhotoroom(imageBuffer);
        case 'local':
          return await this.removeBackgroundLocally(imageBuffer);
        default:
          throw new Error(`Unsupported provider: ${this.provider}`);
      }
    } catch (error) {
      throw new Error(`Failed to remove background: ${error}`);
    }
  }

  /**
   * Remove background using Remove.bg API
   * API Key required: https://www.remove.bg/api
   */
  private async removeBackgroundWithRemoveBg(imageBuffer: Buffer): Promise<Buffer> {
    if (!this.apiKey) {
      throw new Error('Remove.bg API key is required. Set REMOVE_BG_API_KEY environment variable.');
    }

    const formData = new FormData();
    const blob = new Blob([imageBuffer]);
    formData.append('image_file', blob);
    formData.append('size', 'auto');

    const response = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
      headers: {
        'X-Api-Key': this.apiKey,
      },
      responseType: 'arraybuffer',
    });

    return Buffer.from(response.data);
  }

  /**
   * Remove background using Clipdrop API
   * API Key required: https://clipdrop.co/apis/docs/remove-background
   */
  private async removeBackgroundWithClipdrop(imageBuffer: Buffer): Promise<Buffer> {
    if (!this.apiKey) {
      throw new Error('Clipdrop API key is required. Set CLIPDROP_API_KEY environment variable.');
    }

    const formData = new FormData();
    const blob = new Blob([imageBuffer]);
    formData.append('image_file', blob);

    const response = await axios.post(
      'https://clipdrop-api.co/remove-background/v1',
      formData,
      {
        headers: {
          'x-api-key': this.apiKey,
        },
        responseType: 'arraybuffer',
      }
    );

    return Buffer.from(response.data);
  }

  /**
   * Remove background using Photoroom API
   * API Key required: https://www.photoroom.com/api
   */
  private async removeBackgroundWithPhotoroom(imageBuffer: Buffer): Promise<Buffer> {
    if (!this.apiKey) {
      throw new Error('Photoroom API key is required. Set PHOTOROOM_API_KEY environment variable.');
    }

    const formData = new FormData();
    const blob = new Blob([imageBuffer]);
    formData.append('image_file', blob);

    const response = await axios.post(
      'https://sdk.photoroom.com/v1/segment',
      formData,
      {
        headers: {
          'x-api-key': this.apiKey,
        },
        responseType: 'arraybuffer',
      }
    );

    return Buffer.from(response.data);
  }

  /**
   * Local background removal using simple edge detection
   * This is a fallback method with limited accuracy
   * For production, use a proper API service
   */
  private async removeBackgroundLocally(imageBuffer: Buffer): Promise<Buffer> {
    // This is a simplified approach - just ensures alpha channel
    // For real background removal, you'd need ML models like rembg
    console.warn('Local background removal is limited. Consider using a proper API service.');
    
    const processed = await sharp(imageBuffer)
      .ensureAlpha()
      .png()
      .toBuffer();

    return processed;
  }

  /**
   * Check if background removal is properly configured
   */
  isConfigured(): boolean {
    if (this.provider === 'local') {
      return true; // Local doesn't need API key
    }
    return !!this.apiKey;
  }

  /**
   * Get the current provider name
   */
  getProvider(): string {
    return this.provider;
  }
}

export default BackgroundRemovalService;
