"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RecipeCard from "@/components/recipes/RecipeCard";
import { User, Settings, Mail, LogIn, ChefHat } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";
import { Recipe } from "@/types";
import { getUserRecipes } from "@/services/recipe";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const { user } = useAuth();
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [userCreations, setUserCreations] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchUserCreations = async () => {
        try {
          const creations = await getUserRecipes(user.uid);
          setUserCreations(creations);
        } catch (error) {
          console.error("Failed to fetch user creations", error);
        } finally {
          setLoading(false);
        }
      };
      fetchUserCreations();
    } else {
      setLoading(false);
    }
  }, [user]);
  
  if (!user && !loading) {
    return (
       <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-headline mb-4">Please Log In</h1>
        <p className="text-muted-foreground mb-6">You need to be logged in to view your profile.</p>
        <Button asChild>
          <Link href="/login"><LogIn className="mr-2 h-4 w-4" />Log In</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
       {user && (
         <Card className="mb-8">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} data-ai-hint="person cooking" />
              <AvatarFallback>{user.displayName?.charAt(0) ?? user.email?.charAt(0) ?? 'U'}</AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-headline text-accent">{user.displayName || "Cuisine Cloud User"}</h1>
              <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2 mt-1">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
              <p className="mt-2 max-w-xl">Passionate home cook exploring flavors from around the world. My kitchen is my happy place!</p>
            </div>
            <div className="sm:ml-auto">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" /> Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-headline mb-4">My Creations</h2>
           {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                 <div key={i} className="flex flex-col space-y-3">
                  <Skeleton className="h-[200px] w-full rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
           ) : userCreations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {userCreations.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <ChefHat className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">You haven't created any recipes yet.</p>
                <Button className="mt-4" asChild>
                  <Link href="/create-recipe">Create Your First Recipe</Link>
                </Button>
            </div>
           )}
        </div>
      </div>
    </div>
  );
}
