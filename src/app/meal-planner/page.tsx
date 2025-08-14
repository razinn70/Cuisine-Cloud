import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Calendar, Download, PlusCircle } from "lucide-react";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const mealTypes = ["Breakfast", "Lunch", "Dinner"];

const plannedMeals = {
  Monday: {
    Breakfast: "Oatmeal with Berries",
    Lunch: "Leftover Lentil Soup",
    Dinner: "Lemon Herb Baked Salmon",
  },
  Wednesday: {
    Dinner: "Spicy Thai Green Curry",
  },
  Friday: {
    Dinner: "Classic Tomato Bruschetta",
  },
};

const shoppingList = [
  { category: "Produce", items: ["Tomatoes", "Basil", "Garlic", "Lemon", "Onion"] },
  { category: "Dairy", items: ["Parmesan Cheese"] },
  { category: "Pantry", items: ["Baguette", "Olive Oil", "Lentils", "Vegetable Broth"] },
  { category: "Protein", items: ["Salmon Fillets"] },
];

export default function MealPlannerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-headline text-accent mb-2 flex items-center gap-3">
          <Calendar className="w-8 h-8"/>
          Your Weekly Meal Plan
        </h1>
        <p className="text-lg text-muted-foreground">
          Organize your meals for the week and automatically generate a shopping list.
        </p>
      </header>
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card>
                <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-4">
                    <div className="hidden sm:block"></div>
                    {mealTypes.map(meal => (
                        <div key={meal} className="text-center font-bold font-headline p-2 text-muted-foreground">{meal}</div>
                    ))}
                </div>
                <Separator/>
                <div className="grid grid-cols-1">
                    {daysOfWeek.map(day => (
                    <div key={day} className="grid grid-cols-1 sm:grid-cols-4 border-b last:border-b-0">
                        <div className="font-bold p-3 bg-secondary sm:bg-transparent rounded-t-lg sm:rounded-none">{day}</div>
                        {mealTypes.map(meal => {
                            // @ts-ignore
                            const plannedMeal = plannedMeals[day]?.[meal];
                            return (
                                <div key={`${day}-${meal}`} className="p-3 border-l min-h-[100px] flex flex-col justify-between hover:bg-secondary/50 transition-colors">
                                {plannedMeal ? (
                                    <div className="text-sm bg-primary/20 text-primary-foreground p-2 rounded-md">
                                        {plannedMeal}
                                    </div>
                                ) : (
                                    <button className="w-full h-full flex items-center justify-center text-muted-foreground hover:text-primary">
                                        <PlusCircle className="w-5 h-5"/>
                                    </button>
                                )}
                                </div>
                            );
                        })}
                    </div>
                    ))}
                </div>
                </CardContent>
            </Card>
        </div>
        <aside>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-headline text-2xl">Shopping List</CardTitle>
              <Button variant="outline" size="icon">
                <Download className="w-4 h-4" />
                <span className="sr-only">Download List</span>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shoppingList.map(category => (
                  <div key={category.category}>
                    <h3 className="font-semibold text-accent mb-2">{category.category}</h3>
                    <ul className="space-y-2">
                      {category.items.map(item => (
                        <li key={item} className="flex items-center">
                          <Checkbox id={item} className="mr-2"/>
                          <label htmlFor={item} className="text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {item}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
