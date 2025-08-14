
'use server';

/**
 * @fileOverview Generates personalized recipe recommendations for a user.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { Recipe, RecommendRecipesInput, RecommendedRecipes, RecommendRecipesInputSchema, RecommendedRecipesSchema } from '@/types';
import { sampleRatings } from '@/data/ratings';

export async function recommendRecipes(input: RecommendRecipesInput): Promise<RecommendedRecipes> {
  return recommendRecipesFlow(input);
}

const recommendRecipesFlow = ai.defineFlow(
  {
    name: 'recommendRecipesFlow',
    inputSchema: RecommendRecipesInputSchema,
    outputSchema: RecommendedRecipesSchema,
  },
  async (input) => {
    
    // This flow now receives candidate recipes, making it more efficient.
    const { userId, count, candidateRecipes } = input;

    // Get the specific user's ratings from our dataset.
    const userRatings = sampleRatings[userId] || {};

    if (candidateRecipes.length === 0) {
      return { recommendations: [] };
    }
    
    const recommendationPrompt = ai.definePrompt({
        name: "recommendationPrompt",
        input: { schema: RecommendRecipesInputSchema },
        output: { schema: RecommendedRecipesSchema },
        prompt: `You are a sophisticated AI recommendation engine for a recipe platform. Your goal is to provide personalized recipe suggestions.

You have access to a catalog of candidate recipes and the specific user's past ratings.

Analyze the user's ratings to understand their preferences. Note which recipes they liked (high ratings) and which they disliked (low ratings).

Based on this analysis, recommend {{count}} recipes from the provided catalog.

For each recommendation, provide a compelling, short reason explaining WHY they might like it, referencing their past ratings. For example, "Because you loved the 'Spicy Chicken Tacos', you might enjoy this flavorful 'Chili Lime Shrimp'."

Available Candidate Recipes Catalog:
---
{{{json candidateRecipes}}}
---

User's Past Ratings (recipeId: rating):
---
{{{json userRatings}}}
---

Generate exactly {{count}} recommendations.
`,
    });

    const { output } = await recommendationPrompt({
      userId,
      count,
      candidateRecipes,
      // We pass userRatings separately, as it's not part of the main input schema for the flow itself
      ...{ userRatings }, 
    });
    
    if (!output) {
      throw new Error("The AI failed to generate recommendations.");
    }

    return output;
  }
);
