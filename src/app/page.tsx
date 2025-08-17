
import RecipeCard from "@/components/recipes/RecipeCard";
import { Utensils, Wand2 } from "lucide-react";
import { getRecipes } from "@/services/recipe";
import { Recipe, RecommendedRecipes } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { recommendRecipes } from "@/ai/flows/recommend-recipes-flow";
import { getAuthenticatedUser } from "@/lib/auth";
import { Suspense } from "react";
import { getRecipe } from "@/services/recipe";


async function Recommendations({ allRecipes }: { allRecipes: Recipe[] }) {
  const user = await getAuthenticatedUser();
  
  if (!user) {
    return null;
  }
  
  let recommendations: RecommendedRecipes['recommendations'] = [];
  try {
    const candidateRecipes = allRecipes.map(({ id, title, description }) => ({ id, title, description }));
    const result = await recommendRecipes({ userId: user.uid, count: 3, candidateRecipes });
    recommendations = result.recommendations;
  } catch (error) {
    console.error("Failed to fetch recommendations:", error);
    // Fail gracefully
    return null;
  }

  if (recommendations.length === 0) {
    return null;
  }
  
  const recommendedRecipeDetails = allRecipes.filter(recipe => 
    recommendations.some(rec => rec.recipeId === recipe.id)
  );


  if(recommendedRecipeDetails.length === 0) {
      return null;
  }
  
  return (
    <section className="mb-16 bg-secondary/50 rounded-xl p-6 md:p-8">
       <h2 className="text-3xl font-headline mb-8 flex items-center gap-3">
         <Wand2 className="w-7 h-7 text-primary" />
         Recommended for You
        </h2>
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
         {recommendedRecipeDetails.map((recipe) => {
            const rec = recommendations.find(r => r.recipeId === recipe.id);
            return (
              <div key={recipe.id}>
                  <RecipeCard recipe={recipe} />
                  {rec?.reason && (
                    <p className="text-sm text-muted-foreground mt-2 p-3 bg-background rounded-md border">
                        <strong className="text-accent-foreground">AI Suggestion:</strong> {rec.reason}
                    </p>
                  )}
              </div>
            )
         })}
       </div>
    </section>
  );
}


export default async function Home() {
  const recipes = await getRecipes();

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

      <Suspense fallback={
        <div className="mb-16">
            <Skeleton className="h-10 w-1/3 mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-[350px] w-full rounded-xl" />)}
            </div>
        </div>
      }>
        <Recommendations allRecipes={recipes} />
      </Suspense>
      
      <section>
        <h2 className="text-3xl font-headline mb-8 flex items-center gap-3">
          <Utensils className="w-7 h-7 text-primary" />
          Featured Recipes
        </h2>
        {recipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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

    