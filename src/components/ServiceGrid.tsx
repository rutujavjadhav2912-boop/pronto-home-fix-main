import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Zap, Wrench, Palette, Sparkles, Hammer, Shield } from "lucide-react";

interface Service {
  id: string;
  title: string;
  description: string;
  image?: string;
  icon: React.ReactNode;
  category: string;
}

interface ServiceGridProps {
  services?: Service[];
  onServiceSelect?: (serviceId: string, category: string) => void;
}

const DEFAULT_SERVICES: Service[] = [
  {
    id: "electrician",
    title: "Electrician",
    description: "Professional electrical services and repairs",
    category: "electrician",
    icon: <Zap className="w-12 h-12" />,
  },
  {
    id: "plumber",
    title: "Plumber",
    description: "Expert plumbing and water solutions",
    category: "plumber",
    icon: <Wrench className="w-12 h-12" />,
  },
  {
    id: "designer",
    title: "Designer",
    description: "Interior and furniture design services",
    category: "designer",
    icon: <Palette className="w-12 h-12" />,
  },
  {
    id: "cleaning",
    title: "Cleaning",
    description: "Professional home cleaning services",
    category: "cleaning",
    icon: <Sparkles className="w-12 h-12" />,
  },
  {
    id: "construction",
    title: "Construction",
    description: "Building and renovation services",
    category: "construction",
    icon: <Hammer className="w-12 h-12" />,
  },
  {
    id: "security",
    title: "Security",
    description: "Home security and safety solutions",
    category: "security",
    icon: <Shield className="w-12 h-12" />,
  },
];

export const ServiceGrid = ({ services = DEFAULT_SERVICES, onServiceSelect }: ServiceGridProps) => {
  const navigate = useNavigate();

  const handleServiceClick = (service: Service) => {
    if (onServiceSelect) {
      onServiceSelect(service.id, service.category);
    } else {
      localStorage.setItem("selectedService", service.id);
      localStorage.setItem("selectedCategory", service.category);
      navigate("/services");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
        <Card
          key={service.id}
          className="group hover:shadow-lg dark:hover:shadow-primary/20 transition-all duration-300 cursor-pointer hover:scale-105 dark:hover:border-primary dark:border-card dark:bg-card/50 overflow-hidden"
          onClick={() => handleServiceClick(service)}
        >
          <CardContent className="p-0">
            {/* Image Section */}
            <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/20 dark:from-primary/20 dark:to-primary/30 flex items-center justify-center overflow-hidden group-hover:from-primary/20 group-hover:to-primary/30 transition-colors duration-300">
              {service.image ? (
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full group-hover:text-primary transition-colors duration-300">
                  {service.icon}
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="p-6">
              <h3 className="font-semibold text-lg mb-2 text-foreground group-hover:text-primary transition-colors">
                {service.title}
              </h3>
              <p className="text-sm text-muted-foreground">{service.description}</p>
              <div className="mt-4 pt-4 border-t dark:border-card">
                <button className="text-primary text-sm font-medium hover:underline">
                  Learn More →
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
