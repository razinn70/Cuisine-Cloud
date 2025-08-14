import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import RecipeCard from "@/components/recipes/RecipeCard";
import { recipes } from "@/lib/placeholder-data";
import { Search } from "lucide-react";

export default function Home() {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </section>
    </div>
  );
}
