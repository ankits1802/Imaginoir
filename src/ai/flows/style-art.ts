'use server';

/**
 * @fileOverview Implements style transfer for AI-generated art.
 *
 * - styleArt - A function that generates abstract art influenced by a reference image or style keywords.
 * - StyleArtInput - The input type for the styleArt function.
 * - StyleArtOutput - The return type for the styleArt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StyleArtInputSchema = z.object({
  prompt: z.string().describe('Text prompt describing the desired art style.'),
  styleReference: z
    .string()
    .describe(
      "A reference image to guide the art style, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    )
    .optional(),
  artisticMovement: z.string().optional().describe('An artistic movement to influence the style (e.g., Cubism, Surrealism).'),
  colorMood: z.string().optional().describe('A color mood to influence the palette (e.g., Vibrant, Pastel).'),
  styleStrength: z.number().optional().describe('How strongly to apply the style of the reference image (0-100).'),
});
export type StyleArtInput = z.infer<typeof StyleArtInputSchema>;

const StyleArtOutputSchema = z.object({
  artDataUri: z
    .string()
    .describe(
      'The generated abstract art as a data URI (Base64 encoded image).'
    ),
});
export type StyleArtOutput = z.infer<typeof StyleArtOutputSchema>;

export async function styleArt(input: StyleArtInput): Promise<StyleArtOutput> {
  return styleArtFlow(input);
}

const styleArtFlow = ai.defineFlow(
  {
    name: 'styleArtFlow',
    inputSchema: StyleArtInputSchema,
    outputSchema: StyleArtOutputSchema,
  },
  async input => {
    let textPrompt = `As a master AI artist, create a new abstract artwork based on the core concept: "${input.prompt}".\n`;

    if (input.artisticMovement) {
        textPrompt += `Incorporate stylistic elements from the ${input.artisticMovement} movement.\n`;
    }
    if (input.colorMood) {
        textPrompt += `The overall color palette should evoke a ${input.colorMood} mood.\n`;
    }

    if (input.styleReference) {
        const strengthDescription = input.styleStrength ? `with an influence level of ${input.styleStrength}/100` : 'with a subtle influence';
        textPrompt += `Deeply analyze the provided reference image and emulate its visual style, color palette, and textures. The fusion should be seamless, with the style applied ${strengthDescription} to the core concept.`;
    } else {
        textPrompt += `Render this concept in a striking, unique abstract style. Focus on creating a composition with dynamic energy, rich textures, and a compelling visual narrative.`;
    }
    
    const promptPayload: any[] = [];
    if (input.styleReference) {
        promptPayload.push({ media: { url: input.styleReference } });
    }
    promptPayload.push({ text: textPrompt });
    
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: promptPayload,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_ONLY_HIGH',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_LOW_AND_ABOVE',
          },
        ],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed or returned no content.');
    }

    return {artDataUri: media.url};
  }
);
