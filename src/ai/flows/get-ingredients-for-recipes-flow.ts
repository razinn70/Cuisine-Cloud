'use server';

/**
 * @fileOverview Extracts and aggregates ingredients from a list of recipes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { Recipe } from '@/types';

export const GetIngredientsInputSchema = z.object({
  recipes: z.array(z.any()).describe("A list of recipe objects to extract ingredients from."),
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
    // This task is deterministic and doesn't require an AI call.
    // Using code is more efficient and reliable.
    const ingredients = (input.recipes as Recipe[]).flatMap(recipe => 
        recipe.ingredients.map(ing => `${ing.quantity} ${ing.name}`.trim())
    );
    
    return { ingredients };
  }
);
