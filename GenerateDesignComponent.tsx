/**
 * React Component for Generating T-Shirt Designs
 * 
 * Usage:
 * import GenerateDesignForm from './GenerateDesignComponent';
 * 
 * <GenerateDesignForm 
 *   supabaseUrl="https://your-project.supabase.co"
 *   onDesignCreated={(design) => console.log(design)}
 * />
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface Design {
  id: number;
  prompt: string;
  imageUrl: string;
  logoUrl: string;
  slug: string;
  creatorId: number;
  creatorName: string;
}

interface GenerateDesignFormProps {
  supabaseUrl: string;
  onDesignCreated?: (design: Design) => void;
  onError?: (error: string) => void;
}

export function GenerateDesignForm({
  supabaseUrl,
  onDesignCreated,
  onError,
}: GenerateDesignFormProps) {
  const [prompt, setPrompt] = useState('');
  const [tshirtColor, setTshirtColor] = useState('black');
  const [loading, setLoading] = useState(false);
  const [design, setDesign] = useState<Design | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a design prompt');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/generate-design`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompt.trim(),
            tshirtColor,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate design');
      }

      const data = await response.json();

      if (data.success && data.design) {
        setDesign(data.design);
        onDesignCreated?.(data.design);
        setPrompt(''); // Clear input after success
      } else {
        throw new Error(data.error || 'Failed to generate design');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      onError?.(errorMessage);
      console.error('Error generating design:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleGenerate();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Generate T-Shirt Design</h2>

        <div className="space-y-4">
          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Design Prompt
            </label>
            <Input
              type="text"
              placeholder="Describe your t-shirt design (e.g., 'A cosmic astronaut floating through a nebula')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Be descriptive for better results. Include colors, style, and mood.
            </p>
          </div>

          {/* T-Shirt Color Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              T-Shirt Color
            </label>
            <div className="flex gap-2">
              {['black', 'white', 'navy'].map((color) => (
                <button
                  key={color}
                  onClick={() => setTshirtColor(color)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    tshirtColor === color
                      ? 'ring-2 ring-blue-500 bg-blue-50'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  disabled={loading}
                >
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Design...
              </>
            ) : (
              'Generate Design'
            )}
          </Button>
        </div>
      </Card>

      {/* Design Preview */}
      {design && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Generated Design</h3>

          <div className="space-y-4">
            {/* T-Shirt Mockup */}
            {design.imageUrl && (
              <div>
                <p className="text-sm font-medium mb-2">T-Shirt Mockup</p>
                <img
                  src={design.imageUrl}
                  alt="T-shirt mockup"
                  className="w-full max-w-sm mx-auto rounded-lg border border-gray-200"
                />
              </div>
            )}

            {/* Logo */}
            {design.logoUrl && (
              <div>
                <p className="text-sm font-medium mb-2">Design Logo</p>
                <img
                  src={design.logoUrl}
                  alt="Design logo"
                  className="w-full max-w-xs mx-auto rounded-lg border border-gray-200 bg-gray-50 p-4"
                />
              </div>
            )}

            {/* Design Details */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div>
                <p className="text-xs text-gray-600">Design ID</p>
                <p className="font-mono text-sm">{design.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Slug</p>
                <p className="font-mono text-sm">{design.slug}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Prompt</p>
                <p className="text-sm">{design.prompt}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Creator</p>
                <p className="text-sm">{design.creatorName}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  // Copy design URL to clipboard
                  const url = `${window.location.origin}/design/${design.slug}`;
                  navigator.clipboard.writeText(url);
                  alert('Design URL copied to clipboard!');
                }}
              >
                Copy Link
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  // Download mockup
                  const link = document.createElement('a');
                  link.href = design.imageUrl;
                  link.download = `design-${design.slug}.png`;
                  link.click();
                }}
              >
                Download Mockup
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">
            Generating your design... This may take 30-60 seconds.
          </p>
        </Card>
      )}

      {/* Example Prompts */}
      <Card className="p-6 bg-blue-50">
        <h3 className="font-semibold mb-3">Example Prompts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            'A cosmic astronaut floating through a nebula with vibrant purple and blue colors',
            'Phoenix rising from flames symbolizing rebirth',
            'Mountain peak with sunrise symbolizing achievement',
            'Vintage cassette tape with colorful music waves',
            '80s synthwave sunset with palm trees and grid',
            'Cat wearing sunglasses riding a unicorn',
          ].map((examplePrompt, index) => (
            <button
              key={index}
              onClick={() => {
                setPrompt(examplePrompt);
                setError(null);
              }}
              className="text-left p-2 rounded bg-white hover:bg-blue-100 transition-colors text-sm border border-blue-200"
            >
              {examplePrompt}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default GenerateDesignForm;
