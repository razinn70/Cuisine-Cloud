import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RecipeCard from "@/components/recipes/RecipeCard";
import { recipes } from "@/lib/placeholder-data";
import { User, Settings, Mail } from "lucide-react";

export default function ProfilePage() {
  const user = {
    name: "Alex Doe",
    email: "alex.doe@example.com",
    avatarUrl: "https://placehold.co/100x100.png",
    bio: "Passionate home cook exploring flavors from around the world. My kitchen is my happy place!",
  };

  const savedRecipes = recipes.slice(0, 2);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person cooking" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-headline text-accent">{user.name}</h1>
            <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2 mt-1">
              <Mail className="w-4 h-4" />
              {user.email}
            </p>
            <p className="mt-2 max-w-xl">{user.bio}</p>
          </div>
          <div className="sm:ml-auto">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" /> Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-headline mb-4">My Saved Recipes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {savedRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-headline mb-4">My Creations</h2>
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">You haven't created any recipes yet.</p>
              <Button className="mt-4">Create Your First Recipe</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
