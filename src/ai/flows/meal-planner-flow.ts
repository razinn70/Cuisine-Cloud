'use server';

/**
 * @fileOverview Generates a meal plan based on user preferences and available recipes,
 * and extracts the ingredients for the selected recipes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { Recipe } from '@/types';

// Define the structure for a single day's meal plan
const DayPlanSchema = z.object({
  Breakfast: z.string().optional().describe("The name of the recipe for breakfast."),
  Lunch: z.string().optional().describe("The name of the recipe for lunch."),
  Dinner: z.string().optional().describe("The name of the recipe for dinner."),
});

// Define the overall meal plan structure using a record for flexible day names
export const MealPlanSchema = z.object({
  plan: z.record(z.string(), DayPlanSchema).describe("The generated meal plan, with days of the week as keys."),
  ingredients: z.array(z.string()).describe("A flat list of all ingredients (including quantities) from the recipes used in the meal plan."),
});
export type MealPlan = z.infer<typeof MealPlanSchema>;


const GenerateMealPlanInputSchema = z.object({
  prompt: z.string().describe("The user's request for the meal plan (e.g., dietary needs, number of days)."),
  recipes: z.array(z.custom<Recipe>()).describe("A list of available recipes to choose from."),
});
export type GenerateMealPlanInput = z.infer<typeof GenerateMealPlanInputSchema>;


export async function generateMealPlan(input: GenerateMealPlanInput): Promise<MealPlan> {
  return generateMealPlanFlow(input);
}


const prompt = ai.definePrompt({
    name: "mealPlannerPrompt",
    input: { schema: GenerateMealPlanInputSchema },
    output: { schema: MealPlanSchema },
    prompt: `You are an expert meal planner. Your task is to generate a meal plan based on the user's prompt and the list of available recipes.

User Prompt:
"{{prompt}}"

Available Recipes (JSON format):
---
{{{json recipes}}}
---

Follow these steps:
1. Analyze the user's prompt to understand their requirements (e.g., number of days, dietary restrictions like 'vegetarian', 'healthy', 'quick').
2. Select the most appropriate recipes from the provided JSON list to create a structured meal plan. Fill in the 'plan' object.
3. For every recipe you included in the plan, find its corresponding ingredients in the provided recipe list.
4. Aggregate all ingredients from all selected recipes into a single flat array. Each string in the array should include the quantity and name (e.g., "1 cup Flour").
5. Populate the 'ingredients' field in the output with this aggregated list.
6. Ensure the final output is a valid JSON object following the specified schema.
`,
});

const generateMealPlanFlow = ai.defineFlow(
  {
    name: 'generateMealPlanFlow',
    inputSchema: GenerateMealPlanInputSchema,
    outputSchema: MealPlanSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("The AI failed to generate a meal plan.");
    }
    return output;
  }
);
