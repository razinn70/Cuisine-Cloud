import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Star, Users } from "lucide-react";
import type { Recipe } from "@/types";

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link href={`/recipe/${recipe.id}`} className="group">
      <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1 border-2 border-transparent group-hover:border-primary/80">
        <CardHeader className="p-0">
          <div className="relative aspect-video">
            <Image
              src={recipe.imageUrl}
              alt={recipe.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="recipe food"
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0"></div>
             <Badge className="absolute top-2 right-2">{recipe.author}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="font-headline text-lg leading-tight mb-2 group-hover:text-primary transition-colors">
            {recipe.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {recipe.description}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between text-sm text-muted-foreground border-t mx-4">
          <div className="flex items-center gap-1 pt-4">
            <Clock className="w-4 h-4" />
            <span>{recipe.cookTime}</span>
          </div>
          <div className="flex items-center gap-1 pt-4">
            <Users className="w-4 h-4" />
            <span>{recipe.servings}</span>
          </div>
          <div className="flex items-center gap-1 pt-4">
            <Star className="w-4 h-4 text-primary" />
            <span className="font-semibold">{recipe.rating}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
