import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Calendar, CheckCircle, Clock, Loader2, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getWorkerProfile,
  getWorkerBookings,
  getWorkerReviews,
  updateWorkerAvailability,
  updateBookingStatus as patchBookingStatus,
  getWorkerSchedule,
  getToken
} from "@/lib/api";
import { connectSocket, disconnectSocket, onSocketEvent } from "@/lib/socket";

interface WorkerProfile {
  id: number;
  user_id: number;
  service_category: string;
  experience_years: number;
  hourly_rate: number;
  service_area: string;
  id_proof_url?: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  is_available: boolean;
  rating: number;
  total_jobs: number;
  bio?: string;
  languages?: string;
  certifications?: string;
  profile_image_url?: string;
  is_online?: boolean;
  last_seen?: string;
  response_time_minutes?: number;
}

interface Profile {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
}

interface Booking {
  id: number;
  user_id: number;
  worker_id: number;
  service_category: string;
  scheduled_date: string;
  scheduled_time: string;
  address: string;
  description?: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  is_emergency: boolean;
  total_amount: number;
  payment_method: string;
  payment_status: 'unpaid' | 'pending' | 'paid' | 'failed';
  notes?: string;
  /** From API join */
  user_name?: string;
  user_email?: string;
}

interface Review {
  id: number;
  booking_id: number;
  user_id: number;
  worker_id: number;
  rating: number;
  comment?: string;
  created_at: string;
  user_name?: string;
}

const WorkerDashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workerProfile, setWorkerProfile] = useState<WorkerProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [schedule, setSchedule] = useState<Record<string, unknown>[]>([]);
  const [blockedDates, setBlockedDates] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const socket = connectSocket();
    fetchWorkerData();
    registerSocketListeners();

    return () => {
      disconnectSocket();
      socket?.removeAllListeners();
    };
  }, []);

  const fetchWorkerData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setProfile(JSON.parse(storedUser));
      }

      // Fetch worker profile
      try {
        const workerResponse = await getWorkerProfile(token);
        if (workerResponse.status === 'ok') {
          setWorkerProfile(workerResponse.worker);
        }
      } catch (err) {
        console.warn('Profile not found', err);
      }

      // Fetch worker bookings
      try {
        const bookingsResponse = await getWorkerBookings(token);
        if (bookingsResponse.status === 'ok') {
          setBookings(bookingsResponse.data || []);
        }
      } catch (err) {
        console.warn('Bookings fetch failed', err);
      }

      // Fetch worker reviews
      try {
        const reviewsResponse = await getWorkerReviews(token);
        if (reviewsResponse.status === 'ok') {
          setReviews(reviewsResponse.data || []);
        }
      } catch (err) {
        console.warn('Reviews fetch failed', err);
      }

      try {
        const scheduleResponse = await getWorkerSchedule(token);
        if (scheduleResponse.status === 'ok') {
          setSchedule(scheduleResponse.data.schedule || []);
          setBlockedDates(scheduleResponse.data.blockedDates || []);
        }
      } catch (err) {
        console.warn('Schedule fetch failed', err);
      }

    } catch (error) {
      console.error('Error fetching worker data:', error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const registerSocketListeners = () => {
    onSocketEvent('booking:new', (payload) => {
      if (payload?.worker_id && payload.worker_id === workerProfile?.id) {
        toast.success('New booking request received');
        fetchWorkerData();
      }
    });

    onSocketEvent('booking:status', (payload) => {
      if (payload?.bookingId) {
        fetchWorkerData();
      }
    });

    onSocketEvent('booking:reschedule_request', (payload) => {
      toast.info('A reschedule request has arrived');
      fetchWorkerData();
    });
  };

  const toggleAvailability = async () => {
    if (!workerProfile) return;

    try {
      setUpdating(true);
      const token = getToken();
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const newStatus = !workerProfile.is_available;
      const response = await updateWorkerAvailability(token, newStatus);

      if (response.status === 'ok') {
        setWorkerProfile(prev => prev ? { ...prev, is_available: newStatus } : null);
        toast.success(newStatus ? "You are now available for bookings" : "You are now offline");
      } else {
        toast.error("Failed to update availability");
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error("Failed to update availability");
    } finally {
      setUpdating(false);
    }
  };

  const handleBookingStatusUpdate = async (bookingId: number, status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled") => {
    try {
      setUpdating(true);
      const token = getToken();
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await patchBookingStatus(token, bookingId, status);

      if (response.status === 'ok') {
        toast.success(`Booking ${status} successfully`);
        // Refresh data to show updated status
        await fetchWorkerData();
      } else {
        toast.error("Failed to update booking status");
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error("Failed to update booking status");
    } finally {
      setUpdating(false);
    }
  };

  const getVerificationBadge = () => {
    if (!workerProfile) return null;

    switch (workerProfile.verification_status) {
      case "verified":
        return <Badge className="bg-verified">Verified</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending Verification</Badge>;
      case "rejected":
        return <Badge variant="destructive">Verification Rejected</Badge>;
      default:
        return null;
    }
  };

  const isAvailable = workerProfile?.is_available ?? false;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your worker dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 via-background to-muted/30 p-8 mb-10 shadow-sm">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-primary/80 mb-1">Worker workspace</p>
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome, {profile?.full_name || "Professional"}!</p>
            <div className="mt-2">{getVerificationBadge()}</div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-background/80 px-4 py-3 shadow-sm">
            <span className="text-sm font-medium">
              {isAvailable ? "Available" : "Offline"}
            </span>
            <Switch checked={isAvailable} onCheckedChange={toggleAvailability} />
          </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{workerProfile?.total_jobs || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold">
                  {workerProfile?.rating?.toFixed(1) || "0.0"}
                </div>
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {bookings.filter(b => b.status === "pending").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {bookings.filter(b => b.status === "accepted" || b.status === "in_progress").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-2xl font-bold mb-6">Job Requests</h2>

        <div className="space-y-4">
          {bookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No job requests yet</p>
              </CardContent>
            </Card>
          ) : (
            bookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {booking.user_name || "Customer"}
                      </h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {booking.service_category.replace("_", " ")}
                      </p>
                    </div>
                    <Badge variant={booking.status === "completed" ? "default" : "secondary"}>
                      {booking.status.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(booking.scheduled_date).toLocaleDateString()}</span>
                      <Clock className="h-4 w-4 ml-4" />
                      <span>{booking.scheduled_time}</span>
                    </div>
                    <p className="text-foreground">{booking.address}</p>
                    {booking.description && <p className="text-muted-foreground">{booking.description}</p>}
                  </div>

                  {booking.status === "pending" && (
                    <div className="flex gap-2">
                      <Button onClick={() => handleBookingStatusUpdate(booking.id, "accepted")}>
                        Accept Job
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleBookingStatusUpdate(booking.id, "cancelled")}
                      >
                        Decline
                      </Button>
                    </div>
                  )}

                  {booking.status === "accepted" && (
                    <Button onClick={() => handleBookingStatusUpdate(booking.id, "in_progress")}>
                      Start Job
                    </Button>
                  )}

                  {booking.status === "in_progress" && (
                    <Button onClick={() => handleBookingStatusUpdate(booking.id, "completed")}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark as Completed
                    </Button>
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

export default WorkerDashboard;
