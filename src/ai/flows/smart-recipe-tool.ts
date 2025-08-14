
'use server';

/**
 * @fileOverview Provides AI-powered recipe modification and substitution suggestions based on dietary restrictions.
 *
 * - smartRecipeTool - A function that takes a recipe and dietary restrictions and suggests modifications.
 */

import {ai} from '@/ai/genkit';
import { SmartRecipeToolInput, SmartRecipeToolInputSchema, SmartRecipeToolOutput, SmartRecipeToolOutputSchema } from '@/types';


export async function smartRecipeTool(input: SmartRecipeToolInput): Promise<SmartRecipeToolOutput> {
  return smartRecipeToolFlow(input);
}


const smartRecipeToolFlow = ai.defineFlow(
  {
    name: 'smartRecipeToolFlow',
    inputSchema: SmartRecipeToolInputSchema,
    outputSchema: SmartRecipeToolOutputSchema,
  },
  async input => {
    const prompt = ai.definePrompt({
      name: 'smartRecipeToolPrompt',
      input: {schema: SmartRecipeToolInputSchema},
      output: {schema: SmartRecipeToolOutputSchema},
      prompt: `You are a recipe modification expert. You are adept at parsing recipes from various formats, including text, images, and documents.

Your task is to provide modification suggestions for the given recipe based on the user's dietary restrictions.

Follow these steps:
1.  Analyze the provided inputs. The recipe may be in the 'recipe' text field, the 'fileDataUri' field, or both.
2.  If a file is provided in 'fileDataUri', perform OCR to extract the recipe text from it. This file could be a PNG, JPG, SVG, or PDF. Be as accurate as possible.
3.  If text is provided in the 'recipe' field, use it as the primary source or as context to supplement the extracted text from the file.
4.  Once you have the full recipe text, analyze the user's dietary restrictions.
5.  Provide a modified version of the recipe, including specific ingredient substitutions and any necessary changes to the instructions.

Recipe Text (if provided):
{{recipe}}

Recipe File (if provided):
{{#if fileDataUri}}
{{media url=fileDataUri}}
{{/if}}

Dietary Restrictions:
{{dietaryRestrictions}}

Modified Recipe:`, 
    });

    if (!input.recipe && !input.fileDataUri) {
        throw new Error('You must provide either recipe text or a recipe file.');
    }
    const {output} = await prompt(input);
    return output!;
  }
);
