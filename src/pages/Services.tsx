import { Navbar } from "@/components/Navbar";
import { ServiceCategoriesList } from "@/components/ServiceCategoriesList";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { getToken } from "@/lib/api";
import { motion } from "framer-motion";

const Services = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-12 bg-primary/5 dark:bg-primary/10 border-b dark:border-card">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Browse All Services
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our comprehensive range of professional home services. Click any category to view available options.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ServiceCategoriesList
              onServiceSelect={(service, category) => {
                localStorage.setItem("selectedService", service);
                localStorage.setItem("selectedCategory", category);
                const token = getToken();
                if (token) {
                  navigate("/book");
                } else {
                  navigate("/auth");
                }
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-secondary/30 dark:bg-secondary/10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="container mx-auto px-4 text-center"
        >
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Can't Find What You Need?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Contact our support team for custom service requests
          </p>
          <Button size="lg" onClick={() => navigate("/")} variant="outline">
            Return to Home
          </Button>
        </motion.div>
      </section>
    </div>
  );
};

export default Services;
