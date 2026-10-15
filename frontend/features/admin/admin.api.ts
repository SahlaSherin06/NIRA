import { api } from "@/lib/axios";

export interface RegistrationDay {
  date: string;
  day: string;
  count: number;
}

export interface AdminActivityItem {
  id: string;
  type: "signup" | "report" | "premium";
  title: string;
  description: string;
  timestamp: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsersToday: number;
  premiumUsers: number;
  totalMatches: number;
  bannedUsers: number;
  reportsCount: number;
  revenue: {
    monthlyRevenue: number;
    totalSubscriptions: number;
    planPrice: number;
  };
  genderRatio: {
    male: number;
    female: number;
    other: number;
  };
  registrationGrowth: RegistrationDay[];
  recentActivities: AdminActivityItem[];
}

export interface AdminUserProfile {
  dob?: string;
  height?: string;
  weight?: string;
  bloodGroup?: string;
  maritalStatus?: string;
  haveChildren?: string;
  numberOfChildren?: string;
  city?: string;
  state?: string;
  country?: string;
  religion?: string;
  caste?: string;
  motherTongue?: string;
  educationLevel?: string;
  profession?: string;
  annualIncome?: string;
  diet?: string;
  dressingSense?: string;
  smoke?: string;
  drink?: string;
  personality?: string[];
  interests?: string[];
  bio?: string;
  whatBringsYouHere?: string;
  marryWithin?: string;
  mainPhoto?: string;
  galleryPhotos?: string[];
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  gender?: string;
  createdFor?: string;
  isEmailVerified: boolean;
  isOnboardingComplete: boolean;
  isBanned?: boolean;
  photo?: string | null;
  galleryPhotos?: string[];
  profile?: AdminUserProfile | null;
  subscription?: {
    plan: "free" | "premium";
    expiresAt?: string;
  };
  createdAt: string;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  pages: number;
  metrics?: {
    total: number;
    premium: number;
    banned: number;
  };
}

export interface AdminReport {
  _id: string;
  actorId: {
    _id: string;
    name: string;
    email: string;
  };
  targetId: {
    _id: string;
    name: string;
    email: string;
    gender?: string;
    isBanned?: boolean;
    warningsCount?: number;
    warningNotes?: Array<{
      message: string;
      date: string;
    }>;
    subscription?: {
      plan: string;
    };
  };
  targetProfile?: {
    mainPhoto?: string | null;
    city?: string | null;
    state?: string | null;
    profession?: string | null;
    religion?: string | null;
    dob?: string | null;
  } | null;
  targetReportCount?: number;
  action: string;
  reason?: string;
  status: "pending" | "warned" | "resolved" | "dismissed";
  adminNote?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface AdminReportsResponse {
  reports: AdminReport[];
  metrics: {
    total: number;
    pending: number;
    warned: number;
    resolved: number;
    dismissed: number;
  };
}

export const getAdminStatsApi = async (): Promise<AdminStats> => {
  const res = await api.get("/admin/stats");
  return res.data;
};

export const getAdminUsersApi = async (params: {
  page?: number;
  search?: string;
  filter?: string;
  gender?: string;
}): Promise<AdminUsersResponse> => {
  const res = await api.get("/admin/users", { params });
  return res.data;
};

export const toggleBanUserApi = async (id: string): Promise<{ message: string; isBanned: boolean }> => {
  const res = await api.patch(`/admin/users/${id}/ban`);
  return res.data;
};

export const togglePremiumUserApi = async (id: string): Promise<{ message: string; plan: string }> => {
  const res = await api.patch(`/admin/users/${id}/premium`);
  return res.data;
};

export const getAdminReportsApi = async (params?: {
  search?: string;
  status?: string;
}): Promise<AdminReportsResponse> => {
  const res = await api.get("/admin/reports", { params });
  return res.data;
};

export const warnReportUserApi = async (data: {
  reportId: string;
  message: string;
}): Promise<{ message: string; report: AdminReport }> => {
  const res = await api.patch(`/admin/reports/${data.reportId}/warn`, { message: data.message });
  return res.data;
};

export const dismissAdminReportApi = async (data: {
  reportId: string;
  note?: string;
}): Promise<{ message: string; report: AdminReport }> => {
  const res = await api.patch(`/admin/reports/${data.reportId}/dismiss`, { note: data.note });
  return res.data;
};

export const resolveAdminReportApi = async (data: {
  reportId: string;
  note?: string;
}): Promise<{ message: string; report: AdminReport }> => {
  const res = await api.patch(`/admin/reports/${data.reportId}/resolve`, { note: data.note });
  return res.data;
};

// --- Subscriptions & Revenue Types & API ---
export interface AdminSubscriber {
  _id: string;
  name: string;
  email: string;
  gender: string;
  isBanned: boolean;
  createdAt: string;
  photo?: string | null;
  profile?: {
    city?: string;
    state?: string;
    profession?: string;
    religion?: string;
    dob?: string;
    mainPhoto?: string;
  } | null;
  subscription: {
    plan: "free" | "premium";
    duration?: "1_month" | "3_months" | "6_months" | "lifetime" | null;
    amountPaid?: number;
    planLabel?: string;
    startDate: string;
    expiresAt?: string | null;
    source: "razorpay" | "admin_grant" | "dev_mode";
    adminNote?: string | null;
    daysRemaining?: number | null;
    status: "active" | "expiring_soon" | "expired";
  };
}

export interface AdminSubscriptionsResponse {
  subscribers: AdminSubscriber[];
  total: number;
  page: number;
  pages: number;
  metrics: {
    activeVip: number;
    mrr: number;
    conversionRate: number;
    expiringSoon: number;
    expired: number;
    totalUsers: number;
  };
}

export interface EligibleUserForGrant {
  _id: string;
  name: string;
  email: string;
  gender?: string;
  photo?: string | null;
  currentPlan: string;
  expiresAt?: string | null;
}

export const getAdminSubscriptionsApi = async (params?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<AdminSubscriptionsResponse> => {
  const res = await api.get("/admin/subscriptions", { params });
  return res.data;
};

export const getEligibleUsersForGrantApi = async (search?: string): Promise<{ users: EligibleUserForGrant[] }> => {
  const res = await api.get("/admin/subscriptions/eligible-users", { params: { search } });
  return res.data;
};

export const grantVipAccessApi = async (data: {
  userId: string;
  duration: "1_month" | "3_months" | "6_months" | "lifetime";
  note?: string;
}): Promise<{ message: string; user: any }> => {
  const res = await api.post("/admin/subscriptions/grant", data);
  return res.data;
};

export const extendVipSubscriptionApi = async (data: {
  subscriberId: string;
  days: number;
  note?: string;
}): Promise<{ message: string; user: any }> => {
  const res = await api.patch(`/admin/subscriptions/${data.subscriberId}/extend`, {
    days: data.days,
    note: data.note,
  });
  return res.data;
};

export const revokeVipSubscriptionApi = async (data: {
  subscriberId: string;
  note?: string;
}): Promise<{ message: string; user: any }> => {
  const res = await api.patch(`/admin/subscriptions/${data.subscriberId}/revoke`, { note: data.note });
  return res.data;
};

