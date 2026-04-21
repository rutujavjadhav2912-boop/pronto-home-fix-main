import { Navbar } from "@/components/Navbar";
import { ServiceGrid } from "@/components/ServiceGrid";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Clock, Star, ArrowRight } from "lucide-react";
import { Hero3D } from "@/components/Hero3D";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Verified Professionals",
      description: "All workers are background-checked, highly skilled, and verified to ensure top-notch service quality."
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Emergency services available round the clock. We are here when you need us the most."
    },
    {
      icon: Star,
      title: "Rated Services",
      description: "Choose from highly-rated service providers based on real customer feedback and past performance."
    }
  ];

  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
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
    <div className="min-h-screen bg-background overflow-hidden selection:bg-primary/30">
      <Navbar />
      {import.meta.env.DEV && (
        <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-200 text-center py-2 text-sm font-medium">
          Development mode — running locally
        </div>
      )}
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-16 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
        
        {/* 3D Canvas */}
        <Hero3D />

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="container mx-auto px-4 relative z-10 text-center"
        >
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-sm">
            🚀 The #1 Rated Home Service Platform
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-foreground mb-6 drop-shadow-sm">
            Expert Home Services
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent inline-block mt-2">
              At Your Doorstep
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto font-light">
            Book verified professionals for all your home service needs. Fast, reliable, and trusted by thousands.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-primary/25 transition-all duration-300" onClick={() => navigate("/auth")}>
              Book a Service <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-2 hover:bg-secondary/50 backdrop-blur-sm transition-all duration-300" onClick={() => navigate("/auth")}>
              Become a Professional
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 relative z-10">
        <div className="absolute inset-0 bg-secondary/5 dark:bg-secondary/10 backdrop-blur-3xl -z-10" />
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose Us?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We prioritize quality, safety, and speed to give you the best experience possible.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                variants={fadeIn} 
                className="group relative p-8 rounded-3xl bg-card border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-500 group-hover:bg-primary/20" />
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-2xl mb-3 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Our Popular Services</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose from our most requested professional home services, ready to help you instantly.
            </p>
          </motion.div>
          
          <div className="relative">
            {/* Subtle background glow for services */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/5 blur-[100px] rounded-full -z-10" />
            <ServiceGrid 
              onServiceSelect={(serviceId, category) => {
                console.log(`Selected: ${serviceId} from ${category}`);
                navigate("/auth");
              }}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary z-0" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay z-0" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/10 blur-[100px] transform skew-x-12 z-0" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="container mx-auto px-4 text-center relative z-10"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white drop-shadow-md">
            Ready to Get Started?
          </h2>
          <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto text-primary-foreground/90 font-light">
            Join thousands of satisfied customers who trust us for their home service needs. Experience the difference today.
          </p>
          <Button size="lg" variant="secondary" className="h-14 px-10 text-lg rounded-full font-semibold shadow-2xl hover:scale-105 transition-transform duration-300" onClick={() => navigate("/auth")}>
            Create Your Account Now
          </Button>
        </motion.div>
      </section>
    </div>
  );
};

export default Index;