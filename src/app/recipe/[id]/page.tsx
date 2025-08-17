
"use client";

import type { Recipe } from "@/types";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import {
  Clock,
  Users,
  Star,
  Zap,
  Flame,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { getRecipe } from "@/services/recipe";
import { Skeleton } from "@/components/ui/skeleton";
import SmartRecipeTool from "@/components/ai/SmartRecipeTool";

// Helper function to fetch author display name
// In a real app, this might come from a user service
async function getAuthorName(authorId: string) {
    // This is a placeholder. In a real app you'd fetch this from a user service.
    // For now we can't display a name, so we'll just show the ID for debugging.
    return `User ${authorId.substring(0, 6)}...`;
}

export default function RecipePage() {
  const params = useParams();
  const id = params.id as string;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [authorName, setAuthorName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const fetchRecipe = async () => {
      setLoading(true);
      try {
        const fetchedRecipe = await getRecipe(id);
        if (fetchedRecipe) {
          setRecipe(fetchedRecipe);
          const name = await getAuthorName(fetchedRecipe.authorId);
          setAuthorName(name);
        } else {
          notFound();
        }
      } catch (error) {
        console.error("Failed to fetch recipe:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  if (loading) {
    return <RecipePageSkeleton />;
  }

  if (!recipe) {
    return notFound();
  }

  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-x-12">
        <div className="lg:col-span-2">
          <header className="mb-6">
            <h1 className="text-4xl lg:text-5xl font-headline font-bold text-accent-foreground mb-2">
              {recipe.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-muted-foreground">
                <span className="flex items-center gap-2"><User size={16} /> By {authorName}</span>
                <span className="flex items-center gap-2"><Zap size={16} /> {recipe.difficulty}</span>
                {recipe.cuisine && <span className="flex items-center gap-2"><Flame size={16}/> {recipe.cuisine}</span>}
            </div>
            <p className="text-lg text-muted-foreground">{recipe.description}</p>
          </header>

          <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-6 shadow-lg">
            <Image
              src={recipe.imageUrl || "https://placehold.co/600x400.png"}
              alt={recipe.title}
              fill
              className="object-cover"
              data-ai-hint="recipe food photo"
            />
          </div>

          <Card className="mb-6">
             <CardContent className="p-4 flex items-center justify-around flex-wrap">
                 <div className="text-center p-2">
                    <p className="font-bold text-lg">{recipe.prepTimeMinutes} min</p>
                    <p className="text-sm text-muted-foreground">Prep Time</p>
                 </div>
                 <div className="text-center p-2">
                    <p className="font-bold text-lg">{recipe.cookTimeMinutes} min</p>
                    <p className="text-sm text-muted-foreground">Cook Time</p>
                 </div>
                 <div className="text-center p-2">
                    <p className="font-bold text-lg">{totalTime} min</p>
                    <p className="text-sm text-muted-foreground">Total Time</p>
                 </div>
                 <div className="text-center p-2">
                    <p className="font-bold text-lg">{recipe.servings}</p>
                    <p className="text-sm text-muted-foreground">Servings</p>
                 </div>
                 <div className="text-center p-2">
                    <p className="font-bold text-lg flex items-center gap-1 justify-center">
                        <Star className="text-yellow-500 fill-yellow-500" size={20}/>
                        {recipe.rating.toFixed(1)}
                    </p>
                    <p className="text-sm text-muted-foreground">Rating</p>
                 </div>
             </CardContent>
          </Card>

          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-headline mb-4">Ingredients</h2>
              <ul className="space-y-3">
                {recipe.ingredients.map((ing, index) => (
                  <li key={index} className="flex items-start bg-secondary/50 p-3 rounded-lg border">
                    <div className="ml-3">
                      <span className="font-semibold text-accent-foreground">{ing.name}</span>
                      <div className="text-muted-foreground text-sm">{ing.quantity} {ing.unit}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-3">
              <h2 className="text-2xl font-headline mb-4">Instructions</h2>
              <ol className="space-y-4">
                {recipe.instructions.map((step, index) => (
                  <li key={index} className="flex">
                    <span className="bg-primary text-primary-foreground rounded-full h-8 w-8 text-lg flex items-center justify-center font-bold mr-4 flex-shrink-0 mt-1">
                      {index + 1}
                    </span>
                    <p className="flex-1 pt-1.5">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-8 sticky top-24 h-fit">
            <SmartRecipeTool recipe={recipe} />
          {recipe.nutrition && (
          <Card className="shadow-md">
            <CardHeader><CardTitle className="font-headline text-xl">Nutritional Information</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-2">Estimated values per serving.</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex justify-between items-baseline"><span>Calories:</span><span className="font-semibold text-foreground">{recipe.nutrition.calories}</span></li>
                <li className="flex justify-between items-baseline"><span>Protein:</span><span className="font-semibold text-foreground">{recipe.nutrition.protein}g</span></li>
                <li className="flex justify-between items-baseline"><span>Carbs:</span><span className="font-semibold text-foreground">{recipe.nutrition.carbs}g</span></li>
                <li className="flex justify-between items-baseline"><span>Fat:</span><span className="font-semibold text-foreground">{recipe.nutrition.fat}g</span></li>
              </ul>
            </CardContent>
          </Card>
          )}
          {recipe.tags && recipe.tags.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="font-headline text-xl">Tags</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {recipe.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}

function RecipePageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="relative aspect-video w-full rounded-lg" />
           <Skeleton className="h-24 w-full" />
          <div className="grid md:grid-cols-5 gap-8">
              <div className="md:col-span-2 space-y-4">
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-36 w-full" />
              </div>
              <div className="md:col-span-3 space-y-4">
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-48 w-full" />
              </div>
          </div>
        </div>
        <aside className="lg:col-span-1 space-y-8">
          <Skeleton className="w-full h-64 rounded-lg" />
          <Skeleton className="w-full h-32 rounded-lg" />
        </aside>
      </div>
    </div>
  );
}

    