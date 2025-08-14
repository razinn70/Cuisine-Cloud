"use client";

import RecipeCard from "@/components/recipes/RecipeCard";
import { Loader2, Utensils } from "lucide-react";
import { useEffect, useState } from "react";
import { getRecipes } from "@/services/recipe";
import { Recipe, RecommendedRecipes } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/auth/AuthProvider";
import { recommendRecipes } from "@/ai/flows/recommend-recipes-flow";
import Link from "next/link";
import { Wand2 } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendedRecipes['recommendations']>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(true);

  useEffect(() => {
    const fetchAllRecipes = async () => {
      try {
        const fetchedRecipes = await getRecipes();
        setRecipes(fetchedRecipes);
      } catch (error) {
        console.error("Failed to fetch recipes", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllRecipes();
  }, []);

  useEffect(() => {
    if (user) {
      const fetchRecommendations = async () => {
        setLoadingRecs(true);
        try {
          const result = await recommendRecipes({ userId: user.uid, count: 4 });
          setRecommendations(result.recommendations);
        } catch (error) {
          console.error("Failed to fetch recommendations:", error);
        } finally {
          setLoadingRecs(false);
        }
      };
      fetchRecommendations();
    } else {
      setLoadingRecs(false);
    }
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-headline font-bold text-accent-foreground mb-4 tracking-tighter">
          Welcome to Cuisine Cloud
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Explore thousands of recipes, plan your meals, and get smart cooking
          suggestions tailored just for you.
        </p>
      </header>

      {user && (
        <section className="mb-16 bg-secondary/50 rounded-lg p-6 md:p-8">
           <h2 className="text-3xl font-headline mb-8 flex items-center gap-3">
             <Wand2 className="w-7 h-7 text-primary" />
             Recommended for You
            </h2>
           {loadingRecs ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col space-y-3">
                    <Skeleton className="h-[220px] w-full rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                  </div>
                ))}
              </div>
           ) : recommendations.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {recommendations.map((rec) => {
                  const recipe = recipes.find(r => r.id === rec.recipeId);
                  return recipe ? (
                    <div key={rec.recipeId}>
                        <RecipeCard recipe={recipe} />
                        <p className="text-sm text-muted-foreground mt-2 p-3 bg-background rounded-md border">
                          <strong className="text-accent-foreground">AI Suggestion:</strong> {rec.reason}
                        </p>
                    </div>
                  ) : null;
               })}
             </div>
           ) : (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Could not generate recommendations.</p>
                <p className="text-sm text-muted-foreground">Rate some recipes to get started!</p>
            </div>
           )}
        </section>
      )}

      <section>
        <h2 className="text-3xl font-headline mb-8 flex items-center gap-3">
          <Utensils className="w-7 h-7 text-primary" />
          Featured Recipes
        </h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
               <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[220px] w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
           <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">No recipes have been created yet.</p>
              <p className="text-sm text-muted-foreground">Be the first one to create a recipe!</p>
          </div>
        )}
      </section>
    </div>
  );
}
