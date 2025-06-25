'use server';

import { z } from 'zod';
import { generateAbstractArt } from '@/ai/flows/generate-abstract-art';
import { styleArt } from '@/ai/flows/style-art';
import { analyzeArt } from '@/ai/flows/analyze-art';

const artGenerationSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty.'),
  styleReference: z.string().optional(),
  artisticMovement: z.string().optional(),
  colorMood: z.string().optional(),
  styleStrength: z.coerce.number().optional(),
});

export async function generateArtAction(prevState: any, formData: FormData) {
  const validatedFields = artGenerationSchema.safeParse({
    prompt: formData.get('prompt'),
    styleReference: formData.get('styleReference'),
    artisticMovement: formData.get('artisticMovement'),
    colorMood: formData.get('colorMood'),
    styleStrength: formData.get('styleStrength'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const { prompt, styleReference, artisticMovement, colorMood, styleStrength } = validatedFields.data;

    let artResult;
    if (styleReference) {
      artResult = await styleArt({
        prompt,
        styleReference,
        artisticMovement,
        colorMood,
        styleStrength,
      });
    } else {
      artResult = await generateAbstractArt({
        prompt,
        artisticMovement,
        colorMood,
      });
    }

    const analysisResult = await analyzeArt({
      prompt,
      styleReferenceUsed: !!styleReference,
      artisticMovement,
      colorMood,
      styleStrength,
    });
    
    return { 
      success: true, 
      artDataUri: artResult.artDataUri,
      analysis: analysisResult,
      styleStrength: styleStrength || 0
    };

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: { _server: [errorMessage] } };
  }
}
