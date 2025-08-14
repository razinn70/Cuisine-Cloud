'use server';

/**
 * @fileOverview Extracts and aggregates ingredients from a list of recipes.
 */

import { ai } from '@/ai/genkit';
import { GetIngredientsInput, GetIngredientsOutput, GetIngredientsInputSchema, GetIngredientsOutputSchema } from '@/types';
import { Recipe } from '@/types';


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
