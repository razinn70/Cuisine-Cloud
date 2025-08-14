"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Download,
  PlusCircle,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { getRecipes } from "@/services/recipe";
import { Recipe } from "@/types";
import { generateMealPlan, MealPlan } from "@/ai/flows/meal-planner-flow";
import {
  generateShoppingList,
  ShoppingListCategory,
} from "@/ai/flows/shopping-list-flow";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  prompt: z
    .string()
    .min(10, "Please describe your meal plan needs in a bit more detail.")
    .max(200, "Please keep your request under 200 characters."),
});

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const mealTypes = ["Breakfast", "Lunch", "Dinner"];

export default function MealPlannerPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [shoppingList, setShoppingList] = useState<ShoppingListCategory[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const fetchedRecipes = await getRecipes();
        setRecipes(fetchedRecipes);
      } catch (error) {
        console.error("Failed to fetch recipes", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch recipes for meal planning.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, [toast]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "Generate a 3-day healthy meal plan for one person.",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setGenerating(true);
    setMealPlan(null);
    setShoppingList([]);

    try {
      // Step 1: Generate the meal plan and get the aggregated ingredients list
      const generatedPlan = await generateMealPlan({
        prompt: values.prompt,
        recipes,
      });
      setMealPlan(generatedPlan);

      // Step 2: Use the ingredients list to generate the shopping list
      if (generatedPlan.ingredients && generatedPlan.ingredients.length > 0) {
        const generatedShoppingList = await generateShoppingList({
          ingredients: generatedPlan.ingredients,
        });
        setShoppingList(generatedShoppingList.shoppingList);
      } else {
         toast({
          variant: "default",
          title: "Shopping List",
          description: "No ingredients found for the generated plan.",
        });
      }
      
    } catch (error) {
      console.error("Failed to generate meal plan:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description:
          "There was an error generating your meal plan. Please try again.",
      });
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-headline text-accent mb-2 flex items-center gap-3">
          <Calendar className="w-8 h-8" />
          AI-Powered Meal Planner
        </h1>
        <p className="text-lg text-muted-foreground">
          Describe your ideal week of meals, and let our AI handle the rest.
        </p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" /> Tell us what you
                need
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="prompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meal Plan Request</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., A 5-day vegetarian plan with quick breakfast options."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={loading || generating || recipes.length === 0}
                    className="w-full"
                  >
                    {generating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Generate Plan
                  </Button>
                   {recipes.length === 0 && !loading && (
                      <p className="text-sm text-center text-muted-foreground">You need to create at least one recipe before using the meal planner.</p>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
           {generating && !mealPlan && (
             <Card>
                <CardContent className="p-6">
                   <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p className="font-medium">Generating your meal plan...</p>
                    <p className="text-sm text-center">This can take up to 30 seconds. Please wait.</p>
                   </div>
                </CardContent>
             </Card>
           )}

          {mealPlan && (
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-4">
                  <div className="hidden sm:block"></div>
                  {mealTypes.map((meal) => (
                    <div
                      key={meal}
                      className="text-center font-bold font-headline p-2 text-muted-foreground"
                    >
                      {meal}
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="grid grid-cols-1">
                  {Object.entries(mealPlan.plan).map(([day, meals]) => (
                    <div
                      key={day}
                      className="grid grid-cols-1 sm:grid-cols-4 border-b last:border-b-0"
                    >
                      <div className="font-bold p-3 bg-secondary sm:bg-transparent rounded-t-lg sm:rounded-none">
                        {day}
                      </div>
                      {mealTypes.map((meal) => {
                        const plannedMeal = (meals as any)?.[meal];
                        return (
                          <div
                            key={`${day}-${meal}`}
                            className="p-3 border-l min-h-[100px] flex flex-col justify-center hover:bg-secondary/50 transition-colors"
                          >
                            {plannedMeal ? (
                              <div className="text-sm bg-primary/20 text-primary-foreground p-2 rounded-md">
                                {plannedMeal}
                              </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                -
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        <aside>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-headline text-2xl">
                Shopping List
              </CardTitle>
              <Button variant="outline" size="icon" disabled={shoppingList.length === 0}>
                <Download className="w-4 h-4" />
                <span className="sr-only">Download List</span>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {generating && (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground"/>
                  </div>
                )}
                {shoppingList.length > 0 ? (
                  shoppingList.map((category) => (
                    <div key={category.category}>
                      <h3 className="font-semibold text-accent mb-2">
                        {category.category}
                      </h3>
                      <ul className="space-y-2">
                        {category.items.map((item) => (
                          <li key={item} className="flex items-center">
                            <Checkbox id={item} className="mr-2" />
                            <label
                              htmlFor={item}
                              className="text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {item}
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : !generating && (
                   <div className="text-center text-sm text-muted-foreground py-8">
                    Your shopping list will appear here once you generate a meal plan.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
