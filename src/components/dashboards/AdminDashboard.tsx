import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  Briefcase,
  CheckCircle,
  IndianRupee,
  LayoutDashboard,
  Loader2,
  Star,
  Users,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getAdminBookings,
  getAdminStats,
  getAdminUsers,
  getPendingWorkers,
  getToken,
  registerUser,
  verifyWorkerByAdmin,
  updateBookingStatus,
} from "@/lib/api";

interface Stats {
  totalUsers: number;
  totalWorkers: number;
  totalBookings: number;
  pendingVerifications: number;
  revenue: number;
  completedBookings: number;
  emergencyBookings: number;
}

type AdminRecord = Record<string, unknown>;

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalWorkers: 0,
    totalBookings: 0,
    pendingVerifications: 0,
    revenue: 0,
    completedBookings: 0,
    emergencyBookings: 0,
  });
  const [pendingWorkers, setPendingWorkers] = useState<AdminRecord[]>([]);
  const [topWorkers, setTopWorkers] = useState<AdminRecord[]>([]);
  const [users, setUsers] = useState<AdminRecord[]>([]);
  const [bookings, setBookings] = useState<AdminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionWorkerId, setActionWorkerId] = useState<number | null>(null);

  const fetchAdminData = useCallback(async () => {
    const token = getToken();
    if (!token) {
      toast.error("Please sign in again");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [statsRes, usersRes, bookingsRes, pendingRes] = await Promise.all([
        getAdminStats(token),
        getAdminUsers(token),
        getAdminBookings(token),
        getPendingWorkers(token),
      ]);

      const overview = statsRes.data?.overview as Record<string, number> | undefined;
      const tops = (statsRes.data?.topWorkers as AdminRecord[]) || [];

      if (overview) {
        setStats({
          totalUsers: Number(overview.totalUsers) || 0,
          totalWorkers: Number(overview.totalWorkers) || 0,
          totalBookings: Number(overview.totalBookings) || 0,
          pendingVerifications: (pendingRes.data as AdminRecord[])?.length || 0,
          revenue: Number(overview.revenue) || 0,
          completedBookings: Number(overview.completedBookings) || 0,
          emergencyBookings: Number(overview.emergencyBookings) || 0,
        });
      }

      setTopWorkers(tops);
      setPendingWorkers((pendingRes.data as AdminRecord[]) || []);
      setUsers((usersRes.data as AdminRecord[]) || []);
      setBookings((bookingsRes.data as AdminRecord[]) || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load admin data";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const updateWorkerVerification = async (workerId: number, status: "verified" | "rejected") => {
    const token = getToken();
    if (!token) return;

    try {
      setActionWorkerId(workerId);
      await verifyWorkerByAdmin(token, workerId, status);
      toast.success(status === "verified" ? "Worker verified" : "Worker rejected");
      await fetchAdminData();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Update failed";
      toast.error(message);
    } finally {
      setActionWorkerId(null);
    }
  };

  const updateBookingState = async (bookingId: number, status: string) => {
    const token = getToken();
    if (!token) return;

    try {
      await updateBookingStatus(token, bookingId, status);
      toast.success(`Booking status updated to ${status}`);
      await fetchAdminData();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Update failed";
      toast.error(message);
    }
  };

  const fmtCategory = (c: unknown) =>
    String(c ?? "")
      .replace(/_/g, " ")
      .trim() || "—";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 via-background to-muted/30 p-8 mb-10 shadow-sm">
          <div className="absolute right-6 top-6 opacity-[0.06] pointer-events-none">
            <LayoutDashboard className="h-28 w-28 text-primary" />
          </div>
          <p className="text-sm font-medium uppercase tracking-wider text-primary/80 mb-1">Operations</p>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Admin dashboard</h1>
          <p className="text-muted-foreground max-w-2xl">
            Monitor users, bookings, revenue, and worker verification from a single view. Data loads from your live API.
          </p>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalUsers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Verified workers</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalWorkers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Bookings</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalBookings}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pending verifications</CardTitle>
                  <CheckCircle className="h-4 w-4 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.pendingVerifications}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-3 mb-10">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Revenue (completed payments)</CardTitle>
                  <IndianRupee className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{stats.revenue.toLocaleString("en-IN")}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Completed jobs</CardTitle>
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completedBookings}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Emergency bookings</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.emergencyBookings}</div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <section className="space-y-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <h2 className="text-2xl font-bold">Pending verification</h2>
                <p className="text-sm text-muted-foreground">Approve or reject worker applications</p>
              </div>
              {loading ? (
                <Skeleton className="h-40 w-full rounded-xl" />
              ) : pendingWorkers.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No workers waiting for verification.
                  </CardContent>
                </Card>
              ) : (
                pendingWorkers.map((worker) => (
                  <Card key={String(worker.id)}>
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="font-semibold text-lg">{String(worker.full_name ?? "—")}</h3>
                            <Badge variant="secondary">pending</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {fmtCategory(worker.service_category)} · {String(worker.experience_years ?? 0)} yrs · ₹
                            {Number(worker.hourly_rate ?? 0).toLocaleString("en-IN")}/hr
                          </p>
                          <p className="text-sm text-muted-foreground">{String(worker.email ?? "")}</p>
                          <p className="text-sm">Service area: {String(worker.service_area ?? "—")}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            size="sm"
                            disabled={actionWorkerId === Number(worker.id)}
                            onClick={() => updateWorkerVerification(Number(worker.id), "verified")}
                          >
                            {actionWorkerId === Number(worker.id) ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="mr-2 h-4 w-4" />
                            )}
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={actionWorkerId === Number(worker.id)}
                            onClick={() => updateWorkerVerification(Number(worker.id), "rejected")}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Top rated workers</h2>
              {loading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <Skeleton className="h-32 rounded-xl" />
                  <Skeleton className="h-32 rounded-xl" />
                </div>
              ) : topWorkers.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center text-muted-foreground">
                    No verified workers to highlight yet.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {topWorkers.map((w) => (
                    <Card key={String(w.id)}>
                      <CardContent className="p-5 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold">{String(w.full_name)}</h3>
                          <Badge variant="outline" className="shrink-0">
                            {Number(w.rating ?? 0).toFixed(1)} ★
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">{fmtCategory(w.service_category)}</p>
                        <p className="text-xs text-muted-foreground">{String(w.total_jobs ?? 0)} jobs completed</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Recent Bookings</h2>
              </div>
              {loading ? (
                <Skeleton className="h-56 w-full rounded-xl" />
              ) : bookings.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">No recent bookings.</CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {bookings.slice(0, 6).map((booking) => (
                    <Card key={String(booking.id)}>
                      <CardContent className="p-6 space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-semibold truncate">
                            {String(booking.user_name ?? "User")} → {String(booking.worker_name ?? "Worker")}
                          </h3>
                          <Badge className="capitalize">{String(booking.status)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">{fmtCategory(booking.service_category)}</p>
                        <p className="text-sm">
                          {booking.scheduled_date
                            ? new Date(String(booking.scheduled_date)).toLocaleDateString()
                            : "—"}{" "}
                          at {String(booking.scheduled_time ?? "—")}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">{String(booking.address ?? "")}</p>
                        {booking.status === "pending" && (
                          <div className="flex gap-2 pt-2">
                            <Button size="sm" onClick={() => updateBookingState(Number(booking.id), "accepted")}>
                              <CheckCircle className="mr-2 h-4 w-4" /> Accept
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => updateBookingState(Number(booking.id), "cancelled")}>
                              <XCircle className="mr-2 h-4 w-4" /> Cancel
                            </Button>
                          </div>
                        )}
                        {(booking.status === "accepted" || booking.status === "in_progress") && (
                          <div className="flex gap-2 pt-2">
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => updateBookingState(Number(booking.id), "completed")}>
                              <CheckCircle className="mr-2 h-4 w-4" /> Mark Completed
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <h2 className="text-2xl font-bold">All users</h2>
            {loading ? (
              <Skeleton className="h-48 w-full rounded-xl" />
            ) : users.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">No users found.</CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {users.map((user) => (
                  <Card key={String(user.id)}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold">{String(user.full_name)}</h3>
                        <Badge variant="secondary" className="capitalize shrink-0">
                          {String(user.role ?? "user")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{String(user.email ?? "")}</p>
                      <p className="text-sm text-muted-foreground">{String(user.phone ?? "—")}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <h2 className="text-2xl font-bold">All bookings</h2>
            {loading ? (
              <Skeleton className="h-56 w-full rounded-xl" />
            ) : bookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">No bookings yet.</CardContent>
              </Card>
            ) : (
              bookings.map((booking) => (
                <Card key={String(booking.id)}>
                  <CardContent className="p-6 space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-semibold">
                        {String(booking.user_name ?? "User")} → {String(booking.worker_name ?? "Worker")}
                      </h3>
                      <Badge className="capitalize">{String(booking.status)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground capitalize">{fmtCategory(booking.service_category)}</p>
                    <p className="text-sm">
                      {booking.scheduled_date
                        ? new Date(String(booking.scheduled_date)).toLocaleDateString()
                        : "—"}{" "}
                      at {String(booking.scheduled_time ?? "—")}
                    </p>
                    <p className="text-sm text-muted-foreground">{String(booking.address ?? "")}</p>
                    {booking.status === "pending" && (
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" onClick={() => updateBookingState(Number(booking.id), "accepted")}>
                          <CheckCircle className="mr-2 h-4 w-4" /> Accept
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => updateBookingState(Number(booking.id), "cancelled")}>
                          <XCircle className="mr-2 h-4 w-4" /> Cancel
                        </Button>
                      </div>
                    )}
                    {(booking.status === "accepted" || booking.status === "in_progress") && (
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => updateBookingState(Number(booking.id), "completed")}>
                          <CheckCircle className="mr-2 h-4 w-4" /> Mark Completed
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <h2 className="text-2xl font-bold">Register new user</h2>
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle>Create account</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const formData = new FormData(form);
                    const full_name = String(formData.get("full_name") || "").trim();
                    const email = String(formData.get("email") || "").trim();
                    const phone = String(formData.get("phone") || "").trim();
                    const password = String(formData.get("password") || "");
                    const role = formData.get("role") as "admin" | "worker" | "user";

                    try {
                      await registerUser({ full_name, email, phone: phone || "", password, role });
                      toast.success("User registered successfully");
                      form.reset();
                      fetchAdminData();
                    } catch (error) {
                      const message = error instanceof Error ? error.message : "Registration failed";
                      toast.error(message);
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full name</label>
                    <input
                      name="full_name"
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <input
                      name="email"
                      type="email"
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <input
                      name="phone"
                      type="tel"
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      placeholder="+91 …"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <input
                      name="password"
                      type="password"
                      required
                      minLength={6}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role</label>
                    <select
                      name="role"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    >
                      <option value="user">User</option>
                      <option value="worker">Worker</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <Button type="submit" className="w-full">
                    Register user
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
