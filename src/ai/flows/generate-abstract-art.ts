'use server';
/**
 * @fileOverview Generates abstract art from a text prompt.
 *
 * - generateAbstractArt - A function that generates abstract art from a text prompt.
 * - GenerateAbstractArtInput - The input type for the generateAbstractart function.
 * - GenerateAbstractArtOutput - The return type for the generateAbstractArt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAbstractArtInputSchema = z.object({
  prompt: z.string().describe('A text prompt describing the desired abstract art.'),
  artisticMovement: z.string().optional().describe('An artistic movement to influence the style (e.g., Cubism, Surrealism).'),
  colorMood: z.string().optional().describe('A color mood to influence the palette (e.g., Vibrant, Pastel).'),
});
export type GenerateAbstractArtInput = z.infer<typeof GenerateAbstractArtInputSchema>;

const GenerateAbstractArtOutputSchema = z.object({
  artDataUri: z.string().describe('The generated abstract art as a data URI.'),
});
export type GenerateAbstractArtOutput = z.infer<typeof GenerateAbstractArtOutputSchema>;

export async function generateAbstractArt(input: GenerateAbstractArtInput): Promise<GenerateAbstractArtOutput> {
  return generateAbstractArtFlow(input);
}

const generateAbstractArtFlow = ai.defineFlow(
  {
    name: 'generateAbstractArtFlow',
    inputSchema: GenerateAbstractArtInputSchema,
    outputSchema: GenerateAbstractArtOutputSchema,
  },
  async input => {
    let textPrompt = `Generate a high-resolution, visually stunning piece of abstract art. The core concept is: "${input.prompt}". The artwork should be a complex and emotionally resonant masterpiece, suitable for a modern art gallery. Avoid literal interpretations; focus on abstract forms, textures, and the interplay of light and shadow.`;
    
    if (input.artisticMovement) {
      textPrompt += ` The piece should strongly embody the style of ${input.artisticMovement}.`;
    }
    if (input.colorMood) {
      textPrompt += ` The color palette must evoke a ${input.colorMood} mood, using a sophisticated and harmonious range of colors.`;
    }

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: textPrompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    if (!media?.url) {
      throw new Error('Image generation failed or returned no content.');
    }
    return {artDataUri: media.url};
  }
);
