'use server';
/**
 * @fileOverview Generates a new recipe from a list of ingredients and user preferences.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { Recipe, Ingredient, NutritionInfo } from '@/types';

// Define a schema for the generated recipe, which will be our output format.
const GeneratedRecipeSchema = z.object({
    title: z.string().describe("A creative and appealing title for the recipe."),
    description: z.string().describe("A short, enticing description of the dish."),
    cookTime: z.string().describe("Estimated total cooking time (e.g., '45 minutes')."),
    servings: z.string().describe("The number of servings the recipe makes (e.g., '4 servings')."),
    ingredients: z.array(z.object({
        name: z.string().describe("The name of the ingredient."),
        quantity: z.string().describe("The quantity of the ingredient (e.g., '1 cup', '2 tbsp')."),
    })).describe("A list of ingredients required for the recipe."),
    instructions: z.array(z.string()).describe("Step-by-step instructions for preparing the dish."),
    nutrition: z.object({
        calories: z.string().describe("Estimated calories per serving."),
        protein: z.string().describe("Estimated protein in grams per serving."),
        carbs: z.string().describe("Estimated carbohydrates in grams per serving."),
        fat: z.string().describe("Estimated fat in grams per serving."),
    }).describe("Estimated nutritional information per serving."),
});

export const GenerateRecipeInputSchema = z.object({
  ingredients: z.string().describe("A comma-separated list of ingredients the user has."),
  preferences: z.string().describe("User preferences for the recipe (e.g., 'quick and easy', 'healthy', 'vegetarian')."),
});
export type GenerateRecipeInput = z.infer<typeof GenerateRecipeInputSchema>;
export type GeneratedRecipe = z.infer<typeof GeneratedRecipeSchema>;


export async function generateRecipe(input: GenerateRecipeInput): Promise<GeneratedRecipe> {
    return generateRecipeFlow(input);
}


const prompt = ai.definePrompt({
    name: 'generateRecipePrompt',
    input: { schema: GenerateRecipeInputSchema },
    output: { schema: GeneratedRecipeSchema },
    prompt: `You are an expert chef who can create amazing recipes from a limited set of ingredients.
A user has the following ingredients available:
---
{{ingredients}}
---

And has the following preferences for the meal:
---
{{preferences}}
---

Your task is to generate a complete, delicious, and easy-to-follow recipe based on this information. You can assume common pantry staples like salt, pepper, and oil are available if needed.

Generate the recipe in the specified JSON format. Ensure all fields are filled out with realistic and helpful information.
`,
});


const generateRecipeFlow = ai.defineFlow(
  {
    name: 'generateRecipeFlow',
    inputSchema: GenerateRecipeInputSchema,
    outputSchema: GeneratedRecipeSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error("The AI failed to generate a recipe. Please try again with different ingredients.");
    }
    return output;
  }
);
