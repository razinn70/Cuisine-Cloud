"use client";

import { Input } from "@/components/ui/input";
import RecipeCard from "@/components/recipes/RecipeCard";
import { Search, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getRecipes } from "@/services/recipe";
import { Recipe } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const fetchedRecipes = await getRecipes();
        setRecipes(fetchedRecipes);
      } catch (error) {
        console.error("Failed to fetch recipes", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-headline text-accent mb-4">
          Welcome to Cuisine Cloud
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore thousands of recipes, plan your meals, and get smart cooking
          suggestions tailored just for you.
        </p>
      </header>

      <section className="mb-12">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for recipes, ingredients, or chefs..."
              className="pl-10 w-full"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-headline mb-8">Featured Recipes</h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
               <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[200px] w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
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
