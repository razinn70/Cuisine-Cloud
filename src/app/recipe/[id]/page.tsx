"use client";

import type { Recipe } from "@/types";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import {
  Clock,
  Users,
  Star,
  Heart,
  Share2,
  Bookmark,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import SmartRecipeTool from "@/components/ai/SmartRecipeTool";
import { useEffect, useState } from "react";
import { getRecipe } from "@/services/recipe";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/auth/AuthProvider";
import { logEvent } from "@/services/analytics";

export default function RecipePage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const fetchRecipe = async () => {
      try {
        const fetchedRecipe = await getRecipe(id);
        if (fetchedRecipe) {
          setRecipe(fetchedRecipe);
          await logEvent('recipe_viewed', { recipeId: id, userId: user?.uid, recipeTitle: fetchedRecipe.title });
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
  }, [id, user?.uid]);

  if (loading) {
    return (
       <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="relative aspect-video w-full rounded-lg" />
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-10 w-1/4" />
            </div>
            <Separator />
             <div className="grid md:grid-cols-5 gap-8">
                <div className="md:col-span-2 space-y-4">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-24 w-full" />
                </div>
                <div className="md:col-span-3 space-y-4">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-32 w-full" />
                </div>
             </div>
          </div>
          <aside className="lg:col-span-1 space-y-8">
            <Skeleton className="w-full h-48 rounded-lg" />
            <Skeleton className="w-full h-64 rounded-lg" />
          </aside>
        </div>
      </div>
    )
  }

  if (!recipe) {
    return notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-x-12">
        <div className="lg:col-span-2">
          {/* Header */}
          <header className="mb-6">
            <Badge variant="secondary" className="mb-2">
              {recipe.author}
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-headline font-bold text-accent-foreground mb-4 tracking-tight">
              {recipe.title}
            </h1>
            <p className="text-lg text-muted-foreground">{recipe.description}</p>
          </header>

          {/* Image and Meta */}
          <div className="relative aspect-video w-full rounded-lg overflow-hidden mb-6 shadow-lg">
            <Image
              src={recipe.imageUrl}
              alt={recipe.title}
              fill
              className="object-cover"
              data-ai-hint="recipe food"
            />
          </div>
          <div className="flex items-center justify-between mb-6 p-4 bg-secondary rounded-lg border">
            <div className="flex items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{recipe.cookTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>{recipe.servings} Servings</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span>{recipe.rating}/5.0</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Heart className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="w-5 h-5" />
              </Button>
              <Button>
                <Bookmark className="w-5 h-5 mr-2" />
                Save Recipe
              </Button>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Main Content */}
          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-headline mb-4">Ingredients</h2>
              <ul className="space-y-3">
                {recipe.ingredients.map((ing, index) => (
                  <li key={index} className="flex items-start bg-secondary/50 p-3 rounded-md border">
                    <span className="text-primary mr-3 mt-1">&#10003;</span>
                    <div>
                      <span className="font-semibold text-accent-foreground">{ing.name}</span>
                       {ing.quantity && <span className="text-muted-foreground text-sm"> - {ing.quantity}</span>}
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

        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-8 sticky top-24 h-fit">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline text-xl">
                Nutritional Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex justify-between items-baseline">
                  <span>Calories:</span>{" "}
                  <span className="font-semibold text-foreground text-lg">
                    {recipe.nutrition.calories}
                  </span>
                </li>
                <li className="flex justify-between items-baseline">
                  <span>Protein:</span>{" "}
                  <span className="font-semibold text-foreground text-lg">
                    {recipe.nutrition.protein}
                  </span>
                </li>
                <li className="flex justify-between items-baseline">
                  <span>Carbs:</span>{" "}
                  <span className="font-semibold text-foreground text-lg">
                    {recipe.nutrition.carbs}
                  </span>
                </li>
                <li className="flex justify-between items-baseline">
                  <span>Fat:</span>{" "}
                  <span className="font-semibold text-foreground text-lg">
                    {recipe.nutrition.fat}
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <SmartRecipeTool recipe={recipe} />
        </aside>
      </div>
    </div>
  );
}
