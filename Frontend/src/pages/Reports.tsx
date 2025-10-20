import { Download, TrendingUp, Users, BookOpen, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { PopularCoursesChart } from "@/components/dashboard/PopularCoursesChart";

const completionData = [
  { name: "Complété", value: 45, color: "hsl(142 76% 36%)" },
  { name: "En cours", value: 35, color: "hsl(217 91% 60%)" },
  { name: "Non commencé", value: 20, color: "hsl(215 16% 47%)" },
];

const Reports = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Rapports & Statistiques</h1>
          <p className="text-muted-foreground">
            Analysez les performances de votre plateforme
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exporter le rapport
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 border-0 bg-gradient-card animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Croissance</p>
              <p className="text-2xl font-bold">+23%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-0 bg-gradient-card animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent/10">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nouveaux</p>
              <p className="text-2xl font-bold">+342</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-0 bg-gradient-card animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-warning/10">
              <BookOpen className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cours actifs</p>
              <p className="text-2xl font-bold">24</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-0 bg-gradient-card animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">CA moyen</p>
              <p className="text-2xl font-bold">6,470€</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart />
        <PopularCoursesChart />
      </div>

      {/* Completion Rate */}
      <Card className="p-6 border-0 bg-gradient-card animate-fade-in">
        <h3 className="text-lg font-semibold mb-4">Taux de complétion des cours</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={completionData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {completionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default Reports;
