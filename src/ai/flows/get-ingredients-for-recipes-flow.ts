'use server';

/**
 * @fileOverview Extracts and aggregates ingredients from a list of recipes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { Recipe } from '@/types';

export const GetIngredientsInputSchema = z.object({
  recipes: z.array(z.custom<Recipe>()).describe("A list of recipes to extract ingredients from."),
});
export type GetIngredientsInput = z.infer<typeof GetIngredientsInputSchema>;

export const GetIngredientsOutputSchema = z.object({
  ingredients: z.array(z.string()).describe("A flat list of all ingredients (including quantities) from the provided recipes."),
});
export type GetIngredientsOutput = z.infer<typeof GetIngredientsOutputSchema>;

export async function getIngredientsForRecipes(input: GetIngredientsInput): Promise<GetIngredientsOutput> {
  return getIngredientsForRecipesFlow(input);
}

const getIngredientsForRecipesFlow = ai.defineFlow(
  {
    name: 'getIngredientsForRecipesFlow',
    inputSchema: GetIngredientsInputSchema,
    outputSchema: GetIngredientsOutputSchema,
  },
  async (input) => {
    const ingredients = input.recipes.flatMap(recipe => 
        recipe.ingredients.map(ing => `${ing.quantity} ${ing.name}`.trim())
    );
    
    // In a more complex scenario, an AI prompt could be used here to consolidate
    // or format the ingredients, but for simple aggregation, code is more efficient.
    // For demonstration of a simple flow, we just return the aggregated data.
    return { ingredients };
  }
);
