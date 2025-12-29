import sharp from 'sharp';
import axios from 'axios';

export interface CompositionOptions {
  designUrl: string;
  tshirtColor?: string;
  width?: number;
  height?: number;
  positionTop?: number;
  positionLeft?: number;
  designWidth?: number;
  designHeight?: number;
}

export class ImageComposer {
  private async downloadImage(url: string): Promise<Buffer> {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000,
      });
      return Buffer.from(response.data);
    } catch (error) {
      throw new Error(`Failed to download image from ${url}: ${error}`);
    }
  }

  private async createSimpleMockup(
    designBuffer: Buffer,
    tshirtColor: string = 'black',
    options: CompositionOptions
  ): Promise<Buffer> {
    const width = options.width || 1200;
    const height = options.height || 1600;
    const designWidth = options.designWidth || 800;
    const designHeight = options.designHeight || 800;
    const positionTop = options.positionTop || 300;
    const positionLeft = options.positionLeft || (width - designWidth) / 2;

    const colorMap: Record<string, string> = {
      black: '#1a1a1a',
      white: '#ffffff',
      navy: '#001f3f',
      gray: '#808080',
      red: '#ff0000',
      blue: '#0000ff',
    };

    const bgColor = colorMap[tshirtColor.toLowerCase()] || colorMap.black;

    const resizedDesign = await sharp(designBuffer)
      .resize(designWidth, designHeight, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

    const mockup = await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: bgColor,
      },
    })
      .composite([
        {
          input: resizedDesign,
          top: positionTop,
          left: positionLeft,
        },
      ])
      .png()
      .toBuffer();

    return mockup;
  }

  async composeTshirtMockup(options: CompositionOptions): Promise<Buffer> {
    try {
      const designBuffer = await this.downloadImage(options.designUrl);
      return this.createSimpleMockup(
        designBuffer,
        options.tshirtColor || 'black',
        options
      );
    } catch (error) {
      throw new Error(`Failed to compose t-shirt mockup: ${error}`);
    }
  }

  async createTransparentDesign(imageUrl: string): Promise<Buffer> {
    try {
      const imageBuffer = await this.downloadImage(imageUrl);
      const transparent = await sharp(imageBuffer)
        .ensureAlpha()
        .png()
        .toBuffer();
      return transparent;
    } catch (error) {
      throw new Error(`Failed to create transparent design: ${error}`);
    }
  }

  async resizeImage(
    imageUrl: string,
    width: number,
    height: number
  ): Promise<Buffer> {
    try {
      const imageBuffer = await this.downloadImage(imageUrl);
      const resized = await sharp(imageBuffer)
        .resize(width, height, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toBuffer();
      return resized;
    } catch (error) {
      throw new Error(`Failed to resize image: ${error}`);
    }
  }
}

export default ImageComposer;
