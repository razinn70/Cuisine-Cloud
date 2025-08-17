import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Star, Users, Heart, Zap } from "lucide-react";
import type { Recipe } from "@/types";
import { Button } from "../ui/button";

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link href={`/recipe/${recipe.id}`} className="group block">
      <Card className="flex flex-col h-full overflow-hidden rounded-xl shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1 group-hover:scale-[1.02] border">
        {/* Top section with Hero Image */}
        <div className="relative aspect-video">
          <Image
            src={recipe.imageUrl || 'https://placehold.co/400x300.png'}
            alt={recipe.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="recipe food"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
          
          {/* Interactive and Info Elements Overlaid on Image */}
          <div className="absolute top-3 left-3">
             <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm">
                <Heart className="w-4 h-4" />
             </Button>
          </div>
           
          {recipe.tags && recipe.tags[0] && (
            <Badge className="absolute top-3 right-3 bg-primary/80 backdrop-blur-sm border-primary/50 text-primary-foreground">{recipe.tags[0]}</Badge>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-headline text-lg font-bold text-white leading-tight drop-shadow-md">
                {recipe.title}
            </h3>
          </div>
        </div>

        {/* Bottom section with Quick Stats */}
        <CardContent className="p-4 flex-wrap justify-between text-sm text-muted-foreground bg-card grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="flex items-center gap-2" title="Cook time">
            <Clock className="w-4 h-4 text-primary" />
            <span>{recipe.cookTimeMinutes} min</span>
          </div>
          <div className="flex items-center gap-2" title="Servings">
            <Users className="w-4 h-4 text-primary" />
            <span>{recipe.servings}</span>
          </div>
          <div className="flex items-center gap-2" title={`${recipe.rating} stars`}>
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="font-semibold">{recipe.rating?.toFixed(1) || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2" title="Difficulty">
            <Zap className="w-4 h-4 text-primary" />
            <span className="font-semibold">{recipe.difficulty || 'Medium'}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
