'use server';
/**
 * @fileOverview Generates a categorized shopping list from a flat list of ingredients.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const ShoppingListCategorySchema = z.object({
    category: z.string().describe("The category of the shopping list items (e.g., Produce, Dairy, Meat, Pantry)."),
    items: z.array(z.string()).describe("A list of food items in this category, without quantities."),
});
export type ShoppingListCategory = z.infer<typeof ShoppingListCategorySchema>;

const ShoppingListSchema = z.object({
  shoppingList: z.array(ShoppingListCategorySchema),
});
export type ShoppingList = z.infer<typeof ShoppingListSchema>;


const GenerateShoppingListInputSchema = z.object({
  ingredients: z.array(z.string()).describe("A flat list of ingredients, including quantities. e.g., ['1 cup Flour', '2 eggs']"),
});
export type GenerateShoppingListInput = z.infer<typeof GenerateShoppingListInputSchema>;


export async function generateShoppingList(input: GenerateShoppingListInput): Promise<ShoppingList> {
    return generateShoppingListFlow(input);
}

const shoppingListPrompt = ai.definePrompt({
    name: "shoppingListPrompt",
    input: { schema: GenerateShoppingListInputSchema },
    output: { schema: ShoppingListSchema },
    prompt: `You are a helpful assistant that creates a categorized shopping list from a list of ingredients.

Based on the following ingredients, create a shopping list.
- Group similar items together under relevant categories like "Produce", "Protein", "Dairy", "Pantry", "Spices", etc.
- Do not include quantities, just the item name.
- Consolidate duplicate items (e.g., if "1 cup milk" and "2 cups milk" are present, the list should just contain "milk" once).

Ingredients:
---
{{#each ingredients}}
- {{this}}
---
{{/each}}
`,
});


const generateShoppingListFlow = ai.defineFlow(
    {
        name: 'generateShoppingListFlow',
        inputSchema: GenerateShoppingListInputSchema,
        outputSchema: ShoppingListSchema,
    },
    async (input) => {
        const { output } = await shoppingListPrompt(input);
        if (!output) {
            throw new Error("The AI failed to generate a shopping list.");
        }
        return output;
    }
);
