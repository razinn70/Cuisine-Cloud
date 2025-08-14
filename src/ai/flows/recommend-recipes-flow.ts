'use server';

/**
 * @fileOverview Generates personalized recipe recommendations for a user.
 * This flow simulates the inference step of a recommendation model that has been trained
 * on user-recipe interaction data (e.g., ratings). The concept of "backward propagation"
 * and "training" happens offline, and this flow represents the model making predictions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { Recipe, RecommendRecipesInput, RecommendedRecipes, RecommendRecipesInputSchema, RecommendedRecipesSchema } from '@/types';
import { getRecipes } from '@/services/recipe';
import { sampleRatings } from '@/data/ratings';

export async function recommendRecipes(input: RecommendRecipesInput): Promise<RecommendedRecipes> {
  return recommendRecipesFlow(input);
}


// This prompt simulates a trained recommendation model.
// In a real system, the "training" (learning from user ratings via backpropagation) would
// happen in a separate pipeline. This prompt uses the results of that implied training
// (the user's past ratings) to make new predictions.
const recommendationPrompt = ai.definePrompt({
    name: "recommendationPrompt",
    input: { schema: z.object({
        recipes: z.array(z.custom<Pick<Recipe, 'id' | 'title' | 'description' | 'author'>>()),
        userRatings: z.any(),
        count: z.number(),
    }) },
    output: { schema: RecommendedRecipesSchema },
    prompt: `You are a sophisticated AI recommendation engine for a recipe platform. Your goal is to provide personalized recipe suggestions.

You have access to a catalog of all available recipes and the specific user's past ratings.

Analyze the user's ratings to understand their preferences. Note which recipes they liked (high ratings) and which they disliked (low ratings).

Based on this analysis, recommend {{count}} recipes from the catalog that the user has NOT rated yet.

For each recommendation, provide a compelling, short reason explaining WHY they might like it, referencing their past ratings. For example, "Because you loved the 'Spicy Chicken Tacos', you might enjoy this flavorful 'Chili Lime Shrimp'."

Available Recipes Catalog:
---
{{{json recipes}}}
---

User's Past Ratings (recipeId: rating):
---
{{{json userRatings}}}
---

Generate exactly {{count}} recommendations.
`,
});


const recommendRecipesFlow = ai.defineFlow(
  {
    name: 'recommendRecipesFlow',
    inputSchema: RecommendRecipesInputSchema,
    outputSchema: RecommendedRecipesSchema,
  },
  async (input) => {
    // 1. Fetch all recipes to consider for recommendation.
    const allRecipes = await getRecipes();

    // 2. Get the specific user's ratings from our dataset.
    // This simulates reading from a database of user-item interactions.
    const userRatings = sampleRatings[input.userId] || {};
    const ratedRecipeIds = Object.keys(userRatings);

    // 3. Filter out recipes the user has already rated.
    const candidateRecipes = allRecipes
      .filter(recipe => !ratedRecipeIds.includes(recipe.id))
      .map(({ id, title, description, author }) => ({ id, title, description, author }));

    if (candidateRecipes.length === 0) {
      return { recommendations: [] };
    }
    
    // 4. Call the AI model to get recommendations.
    // This is the "inference" step where the model makes predictions.
    const { output } = await recommendationPrompt({
      recipes: candidateRecipes,
      userRatings: userRatings,
      count: input.count,
    });
    
    if (!output) {
      throw new Error("The AI failed to generate recommendations.");
    }

    return output;
  }
);
