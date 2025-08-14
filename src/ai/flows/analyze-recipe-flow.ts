'use server';
/**
 * @fileOverview Analyzes a recipe to provide accurate nutritional information.
 * This flow acts as a specialized tool for nutritional calculation.
 */
import { ai } from '@/ai/genkit';
import { AnalyzeRecipeInput, AnalyzeRecipeInputSchema, NutritionInfo, NutritionInfoSchema } from '@/types';

export async function analyzeRecipe(input: AnalyzeRecipeInput): Promise<NutritionInfo> {
    return analyzeRecipeFlow(input);
}

const prompt = ai.definePrompt({
    name: 'analyzeRecipePrompt',
    input: { schema: AnalyzeRecipeInputSchema },
    output: { schema: NutritionInfoSchema },
    prompt: `You are an expert Registered Dietitian and Nutritionist. Your task is to perform an accurate nutritional analysis of the provided recipe.

You must calculate the estimated nutritional information PER SERVING.

Refer to standard food composition databases (like the USDA FoodData Central) in your knowledge to ensure the accuracy of your calculations for each ingredient.

Recipe Title: {{title}}

Ingredients:
---
{{#each ingredients}}
- {{this}}
{{/each}}
---

Instructions:
---
{{#each instructions}}
- {{this}}
{{/each}}
---

Based on the full recipe, calculate the total nutritional values and then divide by the number of servings implied by the recipe to provide the final per-serving estimates.

Output the result in the specified JSON format.
`,
});


const analyzeRecipeFlow = ai.defineFlow(
  {
    name: 'analyzeRecipeFlow',
    inputSchema: AnalyzeRecipeInputSchema,
    outputSchema: NutritionInfoSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error("The AI failed to analyze the recipe's nutrition. Please try again.");
    }
    return output;
  }
);
