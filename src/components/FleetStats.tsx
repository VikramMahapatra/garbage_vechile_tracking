import { Truck, TrendingUp, AlertTriangle, CheckCircle2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const stats = [
  {
    label: "Active Trucks",
    value: "24",
    total: "32",
    icon: Truck,
    color: "text-success",
    bgColor: "bg-success/10",
    borderColor: "border-l-success",
    trend: "+2",
    trendUp: true,
    trendLabel: "from yesterday",
    route: "/active-trucks",
  },
  {
    label: "Trips Completed",
    value: "156",
    target: "180",
    icon: CheckCircle2,
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
    borderColor: "border-l-chart-2",
    trend: "87%",
    trendUp: true,
    trendLabel: "of daily target",
    route: "/trips-completed",
  },
  {
    label: "Active Alerts",
    value: "8",
    icon: AlertTriangle,
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-l-warning",
    trend: "-3",
    trendUp: false,
    trendLabel: "from 1hr ago",
    route: "/active-alerts",
  },
  {
    label: "Collection Rate",
    value: "87%",
    icon: TrendingUp,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-l-primary",
    trend: "+5%",
    trendUp: true,
    trendLabel: "vs last week",
    route: "/collection-rate",
  },
];

const FleetStats = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className={`p-5 hover:shadow-lg transition-all duration-300 border-l-4 ${stat.borderColor} bg-card/80 backdrop-blur-sm cursor-pointer hover:scale-[1.02]`}
            onClick={() => navigate(stat.route)}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  {stat.label}
                </p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-foreground">
                    {stat.value}
                  </h3>
                  {(stat.total || stat.target) && (
                    <span className="text-sm text-muted-foreground font-medium">
                      / {stat.total || stat.target}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {stat.trendUp ? (
                    <ArrowUpRight className="h-3.5 w-3.5 text-success" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />
                  )}
                  <span className={`text-xs font-semibold ${stat.trendUp ? 'text-success' : 'text-destructive'}`}>
                    {stat.trend}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {stat.trendLabel}
                  </span>
                </div>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-xl shadow-sm`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default FleetStats;
