import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import ImageGenerationClient from './services/nanoBananaClient.js';
import ImageComposer from './services/imageComposer.js';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

// Use Manus Forge API for image generation
const forgeApiKey = process.env.BUILT_IN_FORGE_API_KEY;
const forgeApiUrl = process.env.BUILT_IN_FORGE_API_URL;

if (!forgeApiKey) {
  console.error('BUILT_IN_FORGE_API_KEY environment variable is not set');
  process.exit(1);
}

if (!forgeApiUrl) {
  console.error('BUILT_IN_FORGE_API_URL environment variable is not set');
  process.exit(1);
}

const imageGen = new ImageGenerationClient(forgeApiKey, forgeApiUrl);
const imageComposer = new ImageComposer();

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`Error: ${err.message}`);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.post('/api/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, width = 1024, height = 1024, seed } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: 'Missing required field: prompt',
      });
    }

    console.log(`Generating image for prompt: "${prompt}"`);

    const result = await imageGen.generateImage({
      prompt,
      width,
      height,
      seed,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({
      error: 'Failed to generate image',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.post('/api/generate-transparent', async (req: Request, res: Response) => {
  try {
    const { prompt, width = 1024, height = 1024, seed } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: 'Missing required field: prompt',
      });
    }

    console.log(`Generating transparent image for prompt: "${prompt}"`);

    const result = await imageGen.generateTransparentImage(prompt, {
      width,
      height,
      seed,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Transparent image generation error:', error);
    res.status(500).json({
      error: 'Failed to generate transparent image',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.post('/api/generate-mockup', async (req: Request, res: Response) => {
  try {
    const {
      designUrl,
      tshirtColor = 'black',
      positionTop = 300,
      positionLeft,
      designWidth = 800,
      designHeight = 800,
    } = req.body;

    if (!designUrl) {
      return res.status(400).json({
        error: 'Missing required field: designUrl',
      });
    }

    console.log(`Generating t-shirt mockup for design: ${designUrl}`);

    const mockupBuffer = await imageComposer.composeTshirtMockup({
      designUrl,
      tshirtColor,
      positionTop,
      positionLeft,
      designWidth,
      designHeight,
    });

    res.setHeader('Content-Type', 'image/png');
    res.send(mockupBuffer);
  } catch (error) {
    console.error('Mockup generation error:', error);
    res.status(500).json({
      error: 'Failed to generate mockup',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.post('/api/generate-complete', async (req: Request, res: Response) => {
  try {
    const { prompt, tshirtColor = 'black', width = 1024, height = 1024 } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: 'Missing required field: prompt',
      });
    }

    console.log(`Generating complete design for prompt: "${prompt}"`);

    const logoResult = await imageGen.generateTransparentImage(prompt, {
      width,
      height,
    });

    const mockupBuffer = await imageComposer.composeTshirtMockup({
      designUrl: logoResult.image_url,
      tshirtColor,
      positionTop: 300,
      designWidth: 800,
      designHeight: 800,
    });

    const mockupBase64 = mockupBuffer.toString('base64');

    res.json({
      success: true,
      data: {
        logoUrl: logoResult.image_url,
        imageUrl: `data:image/png;base64,${mockupBase64}`,
        prompt: prompt,
        seed: logoResult.seed,
      },
    });
  } catch (error) {
    console.error('Complete design generation error:', error);
    res.status(500).json({
      error: 'Failed to generate complete design',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.post('/api/generate-batch', async (req: Request, res: Response) => {
  try {
    const { prompts, width = 1024, height = 1024 } = req.body;

    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      return res.status(400).json({
        error: 'Missing required field: prompts (array)',
      });
    }

    console.log(`Generating ${prompts.length} images in batch`);

    const results = await imageGen.generateImages(prompts, { width, height });

    res.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    console.error('Batch generation error:', error);
    res.status(500).json({
      error: 'Failed to generate images',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'tshirt-image-gen',
    version: '1.0.0',
    description: 'AI image generation server for t-shirt designs (powered by Manus Forge API)',
    endpoints: {
      health: 'GET /health',
      generate: 'POST /api/generate',
      generateTransparent: 'POST /api/generate-transparent',
      generateMockup: 'POST /api/generate-mockup',
      generateComplete: 'POST /api/generate-complete',
      generateBatch: 'POST /api/generate-batch',
    },
  });
});

app.listen(port, () => {
  console.log(`🚀 Image generation server running on http://localhost:${port}`);
  console.log(`📝 API documentation available at http://localhost:${port}`);
});

export default app;
