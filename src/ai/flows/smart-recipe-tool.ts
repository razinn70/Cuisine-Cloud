'use server';

/**
 * @fileOverview Provides AI-powered recipe modification and substitution suggestions based on dietary restrictions.
 *
 * - smartRecipeTool - A function that takes a recipe and dietary restrictions and suggests modifications.
 * - SmartRecipeToolInput - The input type for the smartRecipeTool function.
 * - SmartRecipeToolOutput - The return type for the smartRecipeTool function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartRecipeToolInputSchema = z.object({
  recipe: z.string().describe('The recipe to be modified.'),
  dietaryRestrictions: z.string().describe('The dietary restrictions to consider when modifying the recipe.'),
});
export type SmartRecipeToolInput = z.infer<typeof SmartRecipeToolInputSchema>;

const SmartRecipeToolOutputSchema = z.object({
  modifiedRecipe: z.string().describe('The modified recipe with suggestions for substitutions or modifications.'),
});
export type SmartRecipeToolOutput = z.infer<typeof SmartRecipeToolOutputSchema>;

export async function smartRecipeTool(input: SmartRecipeToolInput): Promise<SmartRecipeToolOutput> {
  return smartRecipeToolFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartRecipeToolPrompt',
  input: {schema: SmartRecipeToolInputSchema},
  output: {schema: SmartRecipeToolOutputSchema},
  prompt: `You are a recipe modification expert. Given the following recipe and dietary restrictions, provide a modified recipe with suggestions for substitutions or modifications.

Recipe:
{{recipe}}

Dietary Restrictions:
{{dietaryRestrictions}}

Modified Recipe:`, 
});

const smartRecipeToolFlow = ai.defineFlow(
  {
    name: 'smartRecipeToolFlow',
    inputSchema: SmartRecipeToolInputSchema,
    outputSchema: SmartRecipeToolOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
