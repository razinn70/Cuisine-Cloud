'use server';
/**
 * @fileOverview Generates a categorized shopping list from a given meal plan and recipe list.
 */
import { ai } from '@/ai/genkit';
import { Recipe } from '@/types';
import { z } from 'zod';
import { MealPlan } from './meal-planner-flow';


export const ShoppingListCategorySchema = z.object({
    category: z.string().describe("The category of the shopping list items (e.g., Produce, Dairy, Meat, Pantry)."),
    items: z.array(z.string()).describe("A list of food items in this category."),
});
export type ShoppingListCategory = z.infer<typeof ShoppingListCategorySchema>;

const ShoppingListSchema = z.object({
  shoppingList: z.array(ShoppingListCategorySchema),
});
export type ShoppingList = z.infer<typeof ShoppingListSchema>;


const GenerateShoppingListInputSchema = z.object({
  mealPlan: MealPlan,
  recipes: z.array(z.custom<Recipe>()),
});
export type GenerateShoppingListInput = z.infer<typeof GenerateShoppingListInputSchema>;


export async function generateShoppingList(input: GenerateShoppingListInput): Promise<ShoppingList> {
    
    const recipeTitlesInPlan = new Set<string>();
    Object.values(input.mealPlan.plan).forEach(day => {
        if(day.Breakfast) recipeTitlesInPlan.add(day.Breakfast);
        if(day.Lunch) recipeTitlesInPlan.add(day.Lunch);
        if(day.Dinner) recipeTitlesInPlan.add(day.Dinner);
    });

    const relevantRecipes = input.recipes.filter(recipe => recipeTitlesInPlan.has(recipe.title));
    const ingredients = relevantRecipes.flatMap(recipe => recipe.ingredients.map(i => `${i.quantity} ${i.name}`));

    return generateShoppingListFlow({ ingredients });
}

const generateShoppingListFlow = ai.defineFlow(
    {
        name: 'generateShoppingListFlow',
        inputSchema: z.object({ ingredients: z.array(z.string()) }),
        outputSchema: ShoppingListSchema,
    },
    async (input) => {
        const prompt = ai.definePrompt({
            name: "shoppingListPrompt",
            input: { schema: z.object({ ingredients: z.array(z.string()) }) },
            output: { schema: ShoppingListSchema },
            prompt: `You are a helpful assistant that creates a categorized shopping list from a list of ingredients.
    
Based on the following ingredients, create a shopping list. Group similar items together under relevant categories like "Produce", "Protein", "Dairy", "Pantry", "Spices", etc.
Do not include quantities, just the item name. Consolidate duplicate items.

Ingredients:
---
{{#each ingredients}}
- {{this}}
---
{{/each}}
`,
        });

        const { output } = await prompt(input);
        if (!output) {
            throw new Error("The AI failed to generate a shopping list.");
        }
        return output;
    }
);
