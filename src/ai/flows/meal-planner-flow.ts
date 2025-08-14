'use server';

/**
 * @fileOverview Generates a meal plan based on user preferences and available recipes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define the structure for a single day's meal plan
const DayPlanSchema = z.object({
  Breakfast: z.string().optional().describe("The name of the recipe for breakfast."),
  Lunch: z.string().optional().describe("The name of the recipe for lunch."),
  Dinner: z.string().optional().describe("The name of the recipe for dinner."),
});

// Define the overall meal plan structure using a record for flexible day names
const MealPlanSchema = z.object({
  plan: z.record(z.string(), DayPlanSchema).describe("The generated meal plan, with days of the week as keys."),
});
export type MealPlan = z.infer<typeof MealPlanSchema>;


const GenerateMealPlanInputSchema = z.object({
  prompt: z.string().describe("The user's request for the meal plan (e.g., dietary needs, number of days)."),
  recipes: z.array(z.string()).describe("A list of available recipes to choose from, each as a string with title, description, and ingredients."),
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

Available Recipes:
---
{{#each recipes}}
- {{this}}
---
{{/each}}

Analyze the user's prompt to understand their requirements (e.g., number of days, dietary restrictions like 'vegetarian', 'healthy', 'quick').
Select the most appropriate recipes from the provided list to create a structured meal plan.
Ensure the output is a valid JSON object following the specified schema. Fill in as many days and meals as requested in the prompt. If the prompt does not specify a day, use standard days of the week like "Monday", "Tuesday", etc.
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
