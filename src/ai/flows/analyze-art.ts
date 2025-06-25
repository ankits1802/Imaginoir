'use server';
/**
 * @fileOverview Analyzes a generated piece of art based on its creation parameters.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeArtInputSchema = z.object({
  prompt: z.string(),
  styleReferenceUsed: z.boolean(),
  artisticMovement: z.string().optional(),
  colorMood: z.string().optional(),
  styleStrength: z.number().optional(),
});
export type AnalyzeArtInput = z.infer<typeof AnalyzeArtInputSchema>;

const AnalyzeArtOutputSchema = z.object({
  textualAnalysis: z.string().describe("A brief, insightful analysis of the artwork (2-3 sentences)."),
});
export type AnalyzeArtOutput = z.infer<typeof AnalyzeArtOutputSchema>;


export async function analyzeArt(input: AnalyzeArtInput): Promise<AnalyzeArtOutput> {
  return analyzeArtFlow(input);
}

const analysisPrompt = ai.definePrompt({
    name: 'artAnalysisPrompt',
    input: { schema: AnalyzeArtInputSchema },
    output: { schema: AnalyzeArtOutputSchema },
    prompt: `You are an insightful and concise art critic. You are analyzing a piece of AI-generated abstract art.
    Your analysis should explain how the final piece reflects the inputs that were used to create it.

    Creation Inputs:
    - Main Concept/Prompt: "{{prompt}}"
    - Style Reference Image Used: {{#if styleReferenceUsed}}Yes (with a strength of {{styleStrength}}%){{else}}No{{/if}}
    - Specified Artistic Movement: {{#if artisticMovement}}{{artisticMovement}}{{else}}Not specified{{/if}}
    - Specified Color Mood: {{#if colorMood}}{{colorMood}}{{else}}Not specified{{/if}}

    Based on these inputs, provide a brief, 2-3 sentence analysis of the resulting artwork. Be creative and insightful.
    `,
});

const analyzeArtFlow = ai.defineFlow(
  {
    name: 'analyzeArtFlow',
    inputSchema: AnalyzeArtInputSchema,
    outputSchema: AnalyzeArtOutputSchema,
  },
  async (input) => {
    const { output } = await analysisPrompt(input);
    return output!;
  }
);
