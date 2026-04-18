import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createBooking, getProfile, getToken, payForBooking } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";

const BookService = () => {
  const navigate = useNavigate();
  const [serviceName, setServiceName] = useState<string>("");
  const [serviceCategory, setServiceCategory] = useState<string>("");
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [scheduledTime, setScheduledTime] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("card");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const selection = localStorage.getItem("selectedService");
    const category = localStorage.getItem("selectedCategory");

    if (!selection || !category) {
      navigate("/services");
      return;
    }

    setServiceName(selection);
    setServiceCategory(category);

    const token = getToken();
    if (!token) return;

    getProfile(token)
      .then((response) => {
        if (response?.data?.address) {
          setAddress(response.data.address);
        }
      })
      .catch(() => {
        // ignore profile load failures
      });
  }, [navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const token = getToken();
    if (!token) {
      setIsLoading(false);
      toast.error("Please login to book a service.");
      navigate("/auth");
      return;
    }

    if (!scheduledDate || !scheduledTime || !address) {
      toast.error("Please select a date, time, and service address.");
      setIsLoading(false);
      return;
    }

    try {
      const bookingResponse = await createBooking(token, {
        service_category: serviceCategory,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        address,
        description,
        total_amount: totalAmount,
        payment_method: paymentMethod,
      });

      const bookingId = bookingResponse.bookingId;

      if (paymentMethod === "card") {
        await payForBooking(token, bookingId, "card");
      }

      toast.success("Booking created successfully. A confirmation notification has been generated.");
      navigate("/dashboard");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create booking.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="max-w-3xl mx-auto border-border/60 shadow-md">
            <CardHeader className="bg-primary/5 rounded-t-xl border-b border-border/50 pb-6 mb-6">
              <CardTitle className="text-2xl">Create a Service Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-secondary/20 p-4 rounded-lg border border-border/50">
                  <p className="text-sm text-muted-foreground mb-1">Service selected</p>
                  <h2 className="text-xl font-bold text-foreground">{serviceName}</h2>
                  <p className="text-sm text-muted-foreground mt-1 capitalize">Category: {serviceCategory.replace(/-/g, ' ')}</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="scheduledDate">Preferred Date</Label>
                    <Input
                      id="scheduledDate"
                      type="date"
                      value={scheduledDate}
                      onChange={(event) => setScheduledDate(event.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheduledTime">Preferred Time</Label>
                    <Input
                      id="scheduledTime"
                      type="time"
                      value={scheduledTime}
                      onChange={(event) => setScheduledTime(event.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Service Address</Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    required
                    rows={3}
                    placeholder="Enter full address for the service..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Details / Instructions (Optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={3}
                    placeholder="Any specific instructions for the professional?"
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2 bg-secondary/10 p-4 rounded-lg border border-border/50">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Estimated Budget</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={totalAmount === 0 ? "" : totalAmount}
                      min={0}
                      onChange={(event) => setTotalAmount(Number(event.target.value))}
                      placeholder="Enter amount (₹)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Mode</Label>
                    <select
                      id="paymentMethod"
                      value={paymentMethod}
                      onChange={(event) => setPaymentMethod(event.target.value as "cash" | "card")}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    >
                      <option value="card">Card payment (Online)</option>
                      <option value="cash">Cash on service</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between border-t border-border/50">
                  <Button type="button" variant="outline" onClick={() => navigate(-1)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                    {isLoading ? "Processing..." : "Confirm Booking"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default BookService;
