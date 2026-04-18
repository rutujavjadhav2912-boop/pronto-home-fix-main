import { Link } from "react-router-dom";
import { Facebook, Instagram, MessageCircle, HelpCircle, Mail, Info } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 mt-16 dark:border-card dark:bg-card/95 relative z-10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-foreground">ServiceHub</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your trusted partner for home maintenance, repair, and professional services. Quality service, delivered promptly.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-md font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/services" className="hover:text-primary transition-colors">Our Services</Link></li>
              <li><Link to="/auth" className="hover:text-primary transition-colors">Become a Professional</Link></li>
              <li><Link to="/auth" className="hover:text-primary transition-colors">Sign In</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-md font-semibold">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                <Link to="#" className="hover:text-primary transition-colors">Help Center</Link>
              </li>
              <li className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                <Link to="#" className="hover:text-primary transition-colors">FAQ</Link>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <Link to="#" className="hover:text-primary transition-colors">Contact Us</Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-md font-semibold">Connect with us</h4>
            <div className="flex space-x-4">
              <a href="#" className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors duration-300">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors duration-300">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors duration-300">
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ServiceHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
