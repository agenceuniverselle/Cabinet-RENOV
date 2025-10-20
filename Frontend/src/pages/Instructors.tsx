import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const instructors = [
  {
    id: 1,
    name: "Sophie Martin",
    email: "sophie.martin@email.com",
    courses: 5,
    students: 342,
    revenue: 12450,
    speciality: "React & Frontend",
  },
  {
    id: 2,
    name: "Pierre Dubois",
    email: "pierre.dubois@email.com",
    courses: 3,
    students: 198,
    revenue: 8920,
    speciality: "Backend & APIs",
  },
  {
    id: 3,
    name: "Marie Laurent",
    email: "marie.laurent@email.com",
    courses: 4,
    students: 267,
    revenue: 10340,
    speciality: "Data Science",
  },
];

const Instructors = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestion des Formateurs</h1>
          <p className="text-muted-foreground">
            Gérez votre équipe d'instructeurs
          </p>
        </div>
        <Button className="gap-2 bg-gradient-primary hover:opacity-90">
          <Plus className="h-4 w-4" />
          Ajouter un formateur
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un formateur..."
            className="pl-10 bg-muted/50 border-0"
          />
        </div>
      </div>

      {/* Instructors Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {instructors.map((instructor) => (
          <Card
            key={instructor.id}
            className="p-6 hover:shadow-lg transition-all duration-200 animate-fade-in border-0 bg-gradient-card"
          >
            <div className="flex flex-col items-center text-center mb-4">
              <Avatar className="h-20 w-20 mb-3">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {instructor.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-lg mb-1">{instructor.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {instructor.email}
              </p>
              <Badge variant="secondary">{instructor.speciality}</Badge>
            </div>

            <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-border">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {instructor.courses}
                </div>
                <div className="text-xs text-muted-foreground">Cours</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {instructor.students}
                </div>
                <div className="text-xs text-muted-foreground">Étudiants</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {(instructor.revenue / 1000).toFixed(1)}k
                </div>
                <div className="text-xs text-muted-foreground">Revenus</div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1" size="sm">
                Profil
              </Button>
              <Button className="flex-1" size="sm">
                Contacter
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Instructors;
