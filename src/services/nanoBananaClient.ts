import axios, { AxiosInstance } from 'axios';

export interface GenerateImageRequest {
  prompt: string;
  width?: number;
  height?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  seed?: number;
}

export interface GenerateImageResponse {
  image_url: string;
  seed: number;
  prompt: string;
}

export class ImageGenerationClient {
  private client: AxiosInstance;
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 120000,
    });
  }

  async generateImage(request: GenerateImageRequest): Promise<GenerateImageResponse> {
    try {
      // Use Manus Forge API for image generation
      const response = await this.client.post('/v1/images/generate', {
        prompt: request.prompt,
        width: request.width || 1024,
        height: request.height || 1024,
        num_inference_steps: request.num_inference_steps || 30,
        guidance_scale: request.guidance_scale || 7.5,
        seed: request.seed,
      });

      // Handle Manus Forge API response format
      const imageUrl = response.data.data?.[0]?.url || response.data.url;
      const seed = response.data.data?.[0]?.seed || response.data.seed || Math.random();

      if (!imageUrl) {
        throw new Error('No image URL in response');
      }

      return {
        image_url: imageUrl,
        seed,
        prompt: request.prompt,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Image generation error: ${error.response?.status} - ${error.response?.data?.message || error.message}`
        );
      }
      throw error;
    }
  }

  async generateImages(
    prompts: string[],
    options: Partial<GenerateImageRequest> = {}
  ): Promise<GenerateImageResponse[]> {
    const requests = prompts.map(prompt =>
      this.generateImage({
        prompt,
        ...options,
      })
    );

    return Promise.all(requests);
  }

  async generateTransparentImage(
    prompt: string,
    options: Partial<GenerateImageRequest> = {}
  ): Promise<GenerateImageResponse> {
    const enhancedPrompt = `${prompt}, transparent background, PNG, no background, isolated design`;
    
    return this.generateImage({
      prompt: enhancedPrompt,
      ...options,
    });
  }
}

export default ImageGenerationClient;
