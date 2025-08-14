'use server';
/**
 * @fileOverview Generates a new recipe from a list of ingredients and user preferences.
 */
import { ai } from '@/ai/genkit';
import { GenerateRecipeInput, GeneratedRecipe, GenerateRecipeInputSchema, GeneratedRecipeSchema } from '@/types';


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
