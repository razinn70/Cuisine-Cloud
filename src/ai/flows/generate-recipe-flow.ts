
'use server';
/**
 * @fileOverview Generates a new recipe from a list of ingredients and user preferences.
 */
import { ai } from '@/ai/genkit';
import { GenerateRecipeInput, GeneratedRecipe, GenerateRecipeInputSchema, GeneratedRecipeSchema } from '@/types';
import { analyzeRecipe } from './analyze-recipe-flow';


export async function generateRecipe(input: GenerateRecipeInput): Promise<GeneratedRecipe> {
    return generateRecipeFlow(input);
}

// This prompt is now defined within the flow to avoid exporting it.
const generateRecipeFlow = ai.defineFlow(
  {
    name: 'generateRecipeFlow',
    inputSchema: GenerateRecipeInputSchema,
    outputSchema: GeneratedRecipeSchema,
  },
  async (input) => {

    const creativePrompt = ai.definePrompt({
        name: 'generateCreativeRecipePrompt',
        input: { schema: GenerateRecipeInputSchema },
        // The output is now just the core recipe, without nutrition.
        output: { schema: GeneratedRecipeSchema.omit({ nutrition: true }) },
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

Generate the recipe in the specified JSON format. Do NOT include the 'nutrition' field.
`,
    });

    // Step 1: Generate the creative recipe content (ingredients, instructions, etc.)
    const { output: creativeOutput } = await creativePrompt(input);
    if (!creativeOutput) {
        throw new Error("The AI failed to generate recipe content. Please try again.");
    }

    // Step 2: Use the specialized nutrition flow to analyze the generated recipe.
    // This is more reliable than asking one model to do everything.
    const nutrition = await analyzeRecipe({
        title: creativeOutput.title,
        ingredients: creativeOutput.ingredients.map(i => `${i.quantity} ${i.name}`),
        instructions: creativeOutput.instructions,
    });

    // Step 3: Combine the creative output with the nutritional analysis.
    const fullRecipe: GeneratedRecipe = {
        ...creativeOutput,
        nutrition: nutrition,
    };
    
    return fullRecipe;
  }
);
