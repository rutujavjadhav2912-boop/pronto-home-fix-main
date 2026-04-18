import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface ServiceCategory {
  id: string;
  emoji: string;
  title: string;
  description: string;
  services: string[];
}

const serviceCategoriesData: ServiceCategory[] = [
  {
    id: "repair-maintenance",
    emoji: "🔧",
    title: "Repair & Maintenance Services",
    description: "Professional repair and maintenance solutions",
    services: [
      "Plumbing (leak repair, pipe installation, bathroom fittings)",
      "Drain cleaning",
      "Water tank cleaning",
      "Electrician (wiring, switches, fan/light fitting)",
      "Inverter & UPS repair",
      "Generator repair",
      "Carpenter services",
      "Furniture repair",
      "Door & window repair",
      "Glass repair & replacement",
      "Appliance repair (AC, Fridge, Washing Machine, Microwave)",
      "TV repair",
      "Geyser repair",
      "RO water purifier repair",
    ],
  },
  {
    id: "home-improvement",
    emoji: "🎨",
    title: "Home Improvement Services",
    description: "Transform your space with professional upgrades",
    services: [
      "Interior painting",
      "Exterior painting",
      "Wallpaper installation",
      "False ceiling installation",
      "Modular kitchen setup",
      "Wardrobe installation",
      "Tile installation",
      "Marble/Granite fitting",
      "Flooring (wood, vinyl, tiles)",
      "POP work",
      "Home renovation",
      "Bathroom remodeling",
    ],
  },
  {
    id: "cleaning-services",
    emoji: "🧹",
    title: "Cleaning Services",
    description: "Keep your home spotless and hygienic",
    services: [
      "Full home deep cleaning",
      "Bathroom cleaning",
      "Kitchen cleaning",
      "Sofa cleaning",
      "Carpet cleaning",
      "Curtain cleaning",
      "Mattress cleaning",
      "Water tank cleaning",
      "Pest control",
      "Termite treatment",
      "Disinfection services",
    ],
  },
  {
    id: "cooling-heating",
    emoji: "❄️",
    title: "Cooling & Heating Services",
    description: "Year-round comfort solutions",
    services: [
      "AC installation",
      "AC repair",
      "AC gas refill",
      "AC servicing",
      "Air cooler repair",
      "Chimney installation & cleaning",
      "Geyser installation",
      "Heater repair",
    ],
  },
  {
    id: "installation-services",
    emoji: "🛠️",
    title: "Installation Services",
    description: "Expert installation for modern living",
    services: [
      "CCTV installation",
      "Doorbell installation",
      "Water purifier installation",
      "TV wall mounting",
      "Curtain rod installation",
      "Fan & light installation",
      "Smart home device installation",
      "Solar panel installation",
      "Inverter installation",
    ],
  },
  {
    id: "furniture-services",
    emoji: "🪑",
    title: "Furniture Services",
    description: "Furniture repair and customization",
    services: [
      "Sofa repair",
      "Bed repair",
      "Cupboard repair",
      "Custom furniture making",
      "Furniture assembly (IKEA type)",
      "Polishing & varnishing",
    ],
  },
  {
    id: "outdoor-garden",
    emoji: "🌿",
    title: "Outdoor & Garden Services",
    description: "Beautiful outdoor spaces",
    services: [
      "Gardening",
      "Lawn mowing",
      "Plant maintenance",
      "Tree cutting",
      "Landscaping",
      "Borewell repair",
      "Water pump repair",
    ],
  },
  {
    id: "construction",
    emoji: "🏗️",
    title: "Construction & Structural Services",
    description: "Build and renovate with confidence",
    services: [
      "Mason work",
      "Brickwork",
      "Boundary wall construction",
      "Roof repair",
      "Waterproofing",
      "Building inspection",
      "Structural repair",
    ],
  },
  {
    id: "manpower-helpers",
    emoji: "👷",
    title: "Manpower & Helper Services",
    description: "Trusted household and professional help",
    services: [
      "House maid",
      "Cook",
      "Babysitter",
      "Elderly care",
      "Driver",
      "Security guard",
      "Packers & movers",
    ],
  },
  {
    id: "security-safety",
    emoji: "🚪",
    title: "Security & Safety Services",
    description: "Protect your home and loved ones",
    services: [
      "CCTV monitoring",
      "Fire safety system installation",
      "Smoke alarm installation",
      "Smart lock installation",
      "Intercom setup",
    ],
  },
  {
    id: "emergency-services",
    emoji: "🚨",
    title: "Emergency Services",
    description: "24/7 emergency support",
    services: [
      "Emergency plumbing",
      "Emergency electrician",
      "AC emergency repair",
      "Lock opening service",
      "Emergency water leakage repair",
    ],
  },
];

interface ServiceCategoriesListProps {
  onServiceSelect?: (service: string, category: string) => void;
}

export const ServiceCategoriesList = ({ onServiceSelect }: ServiceCategoriesListProps) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const handleCategoryToggle = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

const handleServiceClick = (service: string, categoryId: string) => {
      if (onServiceSelect) {
        onServiceSelect(service, categoryId);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Our Services
        </h2>
        <p className="text-lg text-muted-foreground">
          Select a category to view available services
        </p>
      </div>

      <Accordion
        type="multiple"
        value={expandedCategories}
        onValueChange={setExpandedCategories}
        className="w-full space-y-3"
      >
        {serviceCategoriesData.map((category) => (
          <AccordionItem
            key={category.id}
            value={category.id}
            className="border-2 border-border dark:border-card rounded-lg overflow-hidden hover:border-primary dark:hover:border-primary transition-colors"
          >
            <AccordionTrigger className="px-6 py-4 hover:bg-secondary dark:hover:bg-secondary/30 transition-colors">
              <div className="flex items-center gap-3 flex-1 text-left">
                <span className="text-2xl">{category.emoji}</span>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {category.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="px-6 py-4 bg-secondary/30 dark:bg-secondary/10 border-t border-border dark:border-card">
              <div className="space-y-3">
                {category.services.map((service, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-background dark:bg-card rounded-md border border-border dark:border-card hover:border-primary dark:hover:border-primary hover:shadow-md dark:hover:shadow-primary/20 cursor-pointer transition-all"
                    onClick={() => handleServiceClick(service, category.id)}
                  >
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-foreground flex-1">{service}</span>
                    <Badge variant="outline" className="flex-shrink-0">
                      Select
                    </Badge>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
