import { recipes } from "@/lib/placeholder-data";
import type { Recipe } from "@/types";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Clock,
  Users,
  Star,
  Heart,
  Share2,
  Bookmark,
  Sparkles,
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

export function generateStaticParams() {
  return recipes.map((recipe) => ({
    id: recipe.id,
  }));
}

export default function RecipePage({ params }: { params: { id: string } }) {
  const recipe = recipes.find((r) => r.id === params.id);

  if (!recipe) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          {/* Header */}
          <header className="mb-6">
            <Badge variant="secondary" className="mb-2">
              {recipe.author}
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-headline font-bold text-accent mb-4">
              {recipe.title}
            </h1>
            <p className="text-lg text-muted-foreground">{recipe.description}</p>
          </header>

          {/* Image and Meta */}
          <div className="relative aspect-video w-full rounded-lg overflow-hidden mb-6 shadow-md">
            <Image
              src={recipe.imageUrl}
              alt={recipe.title}
              fill
              className="object-cover"
              data-ai-hint="recipe food"
            />
          </div>
          <div className="flex items-center justify-between mb-6">
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
                <Star className="w-5 h-5 text-primary" />
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
              <ul className="space-y-2">
                {recipe.ingredients.map((ing, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary mr-2 mt-1">&#10003;</span>
                    <div>
                      <span className="font-semibold">{ing.name}</span> -{" "}
                      {ing.quantity}
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
                    <span className="bg-primary text-primary-foreground rounded-full h-6 w-6 text-sm flex items-center justify-center font-bold mr-4 flex-shrink-0 mt-1">
                      {index + 1}
                    </span>
                    <p className="flex-1">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-xl">
                Nutritional Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex justify-between">
                  <span>Calories:</span>{" "}
                  <span className="font-semibold text-foreground">
                    {recipe.nutrition.calories}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Protein:</span>{" "}
                  <span className="font-semibold text-foreground">
                    {recipe.nutrition.protein}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Carbs:</span>{" "}
                  <span className="font-semibold text-foreground">
                    {recipe.nutrition.carbs}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Fat:</span>{" "}
                  <span className="font-semibold text-foreground">
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
