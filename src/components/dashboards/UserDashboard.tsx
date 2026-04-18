import { Navbar } from "@/components/Navbar";
import { ServiceGrid } from "@/components/ServiceGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, MapPin, User, Bell, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { getNotifications, getUserBookings, getToken, getProfile } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { ReviewDialog } from "@/components/ReviewDialog";

type UserRecord = Record<string, unknown>;

const UserDashboard = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<UserRecord[]>([]);
  const [profile, setProfile] = useState<UserRecord | null>(null);
  const [notifications, setNotifications] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [greetName, setGreetName] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) return (JSON.parse(raw) as { full_name?: string }).full_name || "";
    } catch {
      /* ignore */
    }
    return "";
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = getToken();
    if (!token) {
      navigate("/auth");
      return;
    }

    try {
      setLoading(true);
      const profileData = await getProfile(token);
      setProfile(profileData.data);
      if (profileData.data?.full_name) {
        setGreetName(String(profileData.data.full_name));
      }

      const bookingsData = await getUserBookings(token);
      setBookings(bookingsData.data || []);

      const notificationsData = await getNotifications(token);
      setNotifications(notificationsData.data || []);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-success";
      case "in_progress":
        return "text-primary";
      case "cancelled":
        return "text-destructive";
      default:
        return "text-warning";
    }
  };

  const displayName = (profile?.full_name as string) || greetName || "there";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 via-background to-muted/30 p-8 mb-10 shadow-sm">
          <div className="absolute right-6 top-6 opacity-[0.07] pointer-events-none">
            <Sparkles className="h-28 w-28 text-primary" />
          </div>
          <p className="text-sm font-medium uppercase tracking-wider text-primary/80 mb-1">Your home hub</p>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back, {displayName}!</h1>
          <p className="text-muted-foreground max-w-xl">
            Track bookings, browse services, and stay on top of home repairs in one place.
          </p>
        </div>

        {loading && (
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-28" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-9 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {notifications.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Bell className="h-4 w-4" /> Latest Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.slice(0, 3).map((notification) => (
                  <div key={notification.id} className="rounded-lg border border-border p-3">
                    <p className="text-sm font-medium">{notification.type.replace(/_/g, ' ')}</p>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && (
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{bookings.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Active Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {bookings.filter(b => b.status === "in_progress" || b.status === "accepted").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {bookings.filter(b => b.status === "completed").length}
              </div>
            </CardContent>
          </Card>
        </div>
        )}

        {/* Services Grid */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Available Services</h2>
            <Button onClick={() => navigate("/services")} variant="outline">Browse All Services</Button>
          </div>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-36 w-full rounded-xl" />
              ))}
            </div>
          ) : (
          <ServiceGrid 
            onServiceSelect={(serviceId, category) => {
              console.log(`Selected: ${serviceId} from ${category}`);
              navigate("/services");
            }}
          />
          )}
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Bookings</h2>
          <Button onClick={() => navigate("/services")}>Book New Service</Button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="py-12 space-y-4">
                <Skeleton className="h-6 w-1/3 mx-auto" />
                <Skeleton className="h-10 w-48 mx-auto" />
              </CardContent>
            </Card>
          ) : bookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">You haven't booked any services yet</p>
                <Button onClick={() => navigate("/services")}>Book Your First Service</Button>
              </CardContent>
            </Card>
          ) : (
            bookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg capitalize">
                        {booking.service_category.replace("_", " ")}
                      </h3>
                      <p className={`text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status.replace("_", " ").toUpperCase()}
                      </p>
                    </div>
                    {booking.is_emergency && (
                      <span className="px-3 py-1 bg-emergency/10 text-emergency rounded-full text-sm font-medium">
                        Emergency
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Worker: {booking.worker_name || "Not assigned"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(booking.scheduled_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{booking.scheduled_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{booking.address}</span>
                    </div>
                    {booking.total_amount != null && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Amount:</span>
                        <span>₹{Number(booking.total_amount).toFixed(2)}</span>
                      </div>
                    )}
                    {booking.payment_status && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Payment:</span>
                        <span className="capitalize">{booking.payment_status}</span>
                      </div>
                    )}
                  </div>

                  {booking.description && (
                    <p className="mt-4 text-sm">{booking.description}</p>
                  )}

                  {booking.status === "completed" && (
                    <div className="mt-4">
                      <ReviewDialog
                        bookingId={booking.id}
                        workerName={booking.worker_name || "Worker"}
                        onReviewSubmitted={fetchUserData}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
