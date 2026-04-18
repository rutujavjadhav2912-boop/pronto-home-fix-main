import { Navbar } from "@/components/Navbar";
import { ServiceGrid } from "@/components/ServiceGrid";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Shield,
  Clock,
  Star
} from "lucide-react";
import heroImage from "@/assets/hero-service.jpg";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Verified Professionals",
      description: "All workers are background-checked and verified"
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Emergency services available round the clock"
    },
    {
      icon: Star,
      title: "Rated Services",
      description: "Choose from highly-rated service providers"
    }
  ];

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {import.meta.env.DEV && (
        <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-200 text-center py-2">
          Development mode — running locally
        </div>
      )}
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="container mx-auto px-4 relative z-10 text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Expert Home Services
            <br />
            <span className="text-primary">At Your Doorstep</span>
          </h1>
          <p className="text-xl text-gray-200 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Book verified professionals for all your home service needs. Fast, reliable, and trusted.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" onClick={() => navigate("/auth")}>
              Book a Service
            </Button>
            <Button size="lg" variant="secondary" onClick={() => navigate("/auth")}>
              Become a Professional
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-16 bg-secondary/30 dark:bg-secondary/10">
        <div className="container mx-auto px-4">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeIn} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 text-primary mb-4">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose from our most popular professional home services
            </p>
          </motion.div>
          <ServiceGrid 
            onServiceSelect={(serviceId, category) => {
              console.log(`Selected: ${serviceId} from ${category}`);
              navigate("/auth");
            }}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="container mx-auto px-4 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of satisfied customers who trust us for their home service needs
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate("/auth")}>
            Create Your Account
          </Button>
        </motion.div>
      </section>
    </div>
  );
};

export default Index;