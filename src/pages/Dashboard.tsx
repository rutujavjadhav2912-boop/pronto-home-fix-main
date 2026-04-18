import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import UserDashboard from "@/components/dashboards/UserDashboard";
import WorkerDashboard from "@/components/dashboards/WorkerDashboard";
import AdminDashboard from "@/components/dashboards/AdminDashboard";

interface User {
  id: number;
  full_name: string;
  email: string;
  role: "admin" | "worker" | "user";
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem("user");
      
      if (!storedUser) {
        navigate("/auth");
        return;
      }

      const userData: User = JSON.parse(storedUser);
      setUser(userData);
      setUserRole(userData.role);
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-primary/5 to-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading your dashboard…</p>
      </div>
    );
  }

  if (!user) return null;

  // Render appropriate dashboard based on role
  if (userRole === "admin") {
    return <AdminDashboard />;
  } else if (userRole === "worker") {
    return <WorkerDashboard />;
  } else {
    return <UserDashboard />;
  }
};

export default Dashboard;
