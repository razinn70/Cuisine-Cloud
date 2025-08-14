'use server';
/**
 * @fileOverview Generates a categorized shopping list from a flat list of ingredients.
 */
import { ai } from '@/ai/genkit';
import { GenerateShoppingListInput, ShoppingList, ShoppingListSchema, GenerateShoppingListInputSchema } from '@/types';


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
