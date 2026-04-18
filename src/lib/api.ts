/**
 * API Service - Complete backend API integration
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ==================== TYPE DEFINITIONS ====================

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  role: "admin" | "worker" | "user";
  address?: string;
}

export type ApiObject = Record<string, unknown>;

export interface LoginResponse {
  status: string;
  message: string;
  token: string;
  user: ApiObject;
}

export interface Notification {
  id: number;
  user_id: number;
  worker_id?: number;
  booking_id?: number;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export type ApiObject = Record<string, unknown>;

export interface ApiResponse<T> {
  status: string;
  message?: string;
  data?: T;
  token?: string;
  user?: ApiObject;
}

// ==================== AUTHENTICATION ====================

/**
 * Login user
 */
export const loginUser = async (data: LoginData): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Login failed");
  }

  return response.json();
};

/**
 * Register user
 */
export const registerUser = async (data: SignupData) => {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Registration failed");
  }

  return response.json();
};

// ==================== USER PROFILE ====================

/**
 * Get user profile
 */
export const getProfile = async (token: string) => {
  const response = await fetch(`${API_URL}/profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get profile");
  }

  return response.json();
};

/**
 * Update user profile
 */
export const updateProfile = async (token: string, data: ApiObject) => {
  const response = await fetch(`${API_URL}/profile`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update profile");
  }

  return response.json();
};

// ==================== WORKER ENDPOINTS ====================

/**
 * Create worker profile
 */
export const createWorkerProfile = async (token: string, data: ApiObject) => {
  const response = await fetch(`${API_URL}/worker/profile`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create worker profile");
  }

  return response.json();
};

/**
 * Get worker profile
 */
export const getWorkerProfile = async (token: string) => {
  const response = await fetch(`${API_URL}/worker/profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get worker profile");
  }

  return response.json();
};

/**
 * Get workers by category
 */
export const getWorkersByCategory = async (category: string) => {
  const response = await fetch(`${API_URL}/workers/category/${category}`);

  if (!response.ok) {
    throw new Error("Failed to get workers");
  }

  return response.json();
};

/**
 * Search workers
 */
export const searchWorkers = async (filters: ApiObject) => {
  const params = new URLSearchParams();
  if (filters.category) params.append("category", filters.category);
  if (filters.minRating) params.append("minRating", filters.minRating);
  if (filters.available !== undefined) params.append("available", filters.available);

  const response = await fetch(`${API_URL}/workers/search?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to search workers");
  }

  return response.json();
};

/**
 * Update worker availability
 */
export const updateWorkerAvailability = async (token: string, isAvailable: boolean) => {
  const response = await fetch(`${API_URL}/worker/availability`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ isAvailable }),
  });

  if (!response.ok) {
    throw new Error("Failed to update availability");
  }

  return response.json();
};

export const getWorkerSchedule = async (token: string) => {
  const response = await fetch(`${API_URL}/worker/schedule`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get worker schedule");
  }

  return response.json();
};

export const setWorkerSchedule = async (token: string, schedule: ApiObject[]) => {
  const response = await fetch(`${API_URL}/worker/schedule`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ schedule }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to set worker schedule");
  }

  return response.json();
};

export const blockWorkerDate = async (token: string, blocked_date: string, reason?: string) => {
  const response = await fetch(`${API_URL}/worker/blocked-dates`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ blocked_date, reason }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to block date");
  }

  return response.json();
};

// ==================== BOOKING ENDPOINTS ====================

/**
 * Create booking
 */
export const createBooking = async (token: string, data: ApiObject) => {
  const response = await fetch(`${API_URL}/bookings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create booking");
  }

  return response.json();
};

/**
 * Get user bookings
 */
export const getUserBookings = async (token: string) => {
  const response = await fetch(`${API_URL}/user/bookings`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get bookings");
  }

  return response.json();
};

export const getUpcomingBookings = async (token: string) => {
  const response = await fetch(`${API_URL}/user/bookings/upcoming`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get upcoming bookings");
  }

  return response.json();
};

export const getAvailableSlots = async (token: string, category: string, date: string) => {
  const params = new URLSearchParams({ category, date });
  const response = await fetch(`${API_URL}/bookings/slots?${params.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get available slots");
  }

  return response.json();
};

/**
 * Get worker bookings
 */
export const getWorkerBookings = async (token: string) => {
  const response = await fetch(`${API_URL}/worker/bookings`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get bookings");
  }

  return response.json();
};

/**
 * Update booking status
 */
export const updateBookingStatus = async (token: string, bookingId: number, status: string) => {
  const response = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error("Failed to update booking status");
  }

  return response.json();
};

/**
 * Cancel booking
 */
export const cancelBooking = async (token: string, bookingId: number, reason?: string) => {
  const response = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reason: reason || "" }),
  });

  if (!response.ok) {
    throw new Error("Failed to cancel booking");
  }

  return response.json();
};

export const requestReschedule = async (token: string, bookingId: number, data: { scheduled_date: string; scheduled_time: string; reason?: string }) => {
  const response = await fetch(`${API_URL}/bookings/${bookingId}/reschedule`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to request reschedule");
  }

  return response.json();
};

export const respondReschedule = async (token: string, bookingId: number, data: { status: 'accepted' | 'rejected'; note?: string }) => {
  const response = await fetch(`${API_URL}/bookings/${bookingId}/reschedule`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to respond to reschedule request");
  }

  return response.json();
};

/**
 * Create payment order for booking
 */
export const createPaymentOrder = async (token: string, bookingId: number) => {
  const response = await fetch(`${API_URL}/payments/create-order`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ booking_id: bookingId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create payment order");
  }

  return response.json();
};

export const payForBooking = async (token: string, bookingId: number, gateway: string) => {
  // This currently creates a payment order for the booking.
  // Future integration can extend this to complete payment verification.
  return createPaymentOrder(token, bookingId);
};

/**
 * Verify payment completion
 */
export const verifyPayment = async (token: string, paymentData: {
  booking_id: number;
  payment_id: string;
  order_id?: string;
  signature?: string;
  gateway: string;
}) => {
  const response = await fetch(`${API_URL}/payments/verify`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to verify payment");
  }

  return response.json();
};

/**
 * Get payment details for booking
 */
export const getPaymentDetails = async (token: string, bookingId: number) => {
  const response = await fetch(`${API_URL}/payments/booking/${bookingId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to get payment details");
  }

  return response.json();
};

/**
 * Process refund (admin only)
 */
export const processRefund = async (token: string, refundData: {
  booking_id: number;
  amount?: number;
  reason?: string;
}) => {
  const response = await fetch(`${API_URL}/payments/refund`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(refundData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to process refund");
  }

  return response.json();
};

// ==================== NOTIFICATION ENDPOINTS ====================

export const getNotifications = async (token: string) => {
  const response = await fetch(`${API_URL}/notifications`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get notifications");
  }

  return response.json();
};

export const markNotificationRead = async (token: string, notificationId: number) => {
  const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to mark notification as read");
  }

  return response.json();
};

export const getAdminStats = async (token: string) => {
  const response = await fetch(`${API_URL}/admin/stats`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get admin stats");
  }

  return response.json();
};

export const getRevenueTimeline = async (token: string, from: string, to: string) => {
  const params = new URLSearchParams({ from, to });
  const response = await fetch(`${API_URL}/admin/revenue?${params.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get revenue timeline");
  }

  return response.json();
};

export const getAdminUsers = async (token: string) => {
  const response = await fetch(`${API_URL}/users`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load users");
  }

  return response.json();
};

export const getAdminBookings = async (token: string) => {
  const response = await fetch(`${API_URL}/bookings`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load bookings");
  }

  return response.json();
};

export const getPendingWorkers = async (token: string) => {
  const response = await fetch(`${API_URL}/worker/pending`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load pending workers");
  }

  return response.json();
};

export const verifyWorkerByAdmin = async (
  token: string,
  workerId: number,
  status: "verified" | "rejected"
) => {
  const response = await fetch(`${API_URL}/worker/${workerId}/verify`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to verify worker");
  }

  return response.json();
};

// ==================== REVIEW ENDPOINTS ====================

/**
 * Create review
 */
export const createReview = async (token: string, data: ApiObject) => {
  const response = await fetch(`${API_URL}/reviews`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create review");
  }

  return response.json();
};

/**
 * Get worker reviews
 */
export const getWorkerReviews = async (token: string) => {
  const response = await fetch(`${API_URL}/reviews/worker`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get reviews");
  }

  return response.json();
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get API URL
 */
export const getApiUrl = () => API_URL;

/**
 * Get stored token
 */
export const getToken = () => localStorage.getItem("authToken");

/**
 * Clear authentication
 */
export const clearAuth = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
};

export default {
  loginUser,
  registerUser,
  getProfile,
  updateProfile,
  createWorkerProfile,
  getWorkerProfile,
  getWorkersByCategory,
  searchWorkers,
  updateWorkerAvailability,
  createBooking,
  getUserBookings,
  getWorkerBookings,
  updateBookingStatus,
  cancelBooking,
  createPaymentOrder,
  payForBooking,
  verifyPayment,
  getPaymentDetails,
  processRefund,
  getNotifications,
  markNotificationRead,
  createReview,
  getWorkerReviews,
  getApiUrl,
  getToken,
  clearAuth,
};

