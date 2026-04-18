import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
}

export const ServiceCard = ({ icon: Icon, title, description, onClick }: ServiceCardProps) => {
  return (
    <Card 
      className="group hover:shadow-lg dark:hover:shadow-lg dark:hover:shadow-primary/20 transition-all duration-300 cursor-pointer hover:scale-105 dark:hover:border-primary dark:border-card dark:bg-card/50"
      onClick={onClick}
    >
      <CardContent className="p-6 text-center">
        <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary dark:bg-secondary/30 group-hover:bg-primary group-hover:text-primary-foreground dark:group-hover:bg-primary dark:group-hover:text-primary-foreground transition-colors">
          <Icon className="h-8 w-8" />
        </div>
        <h3 className="font-semibold text-lg mb-2 text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};
