export type ComplaintStatus =
  | "Submitted"
  | "Pending Verification"
  | "Verified"
  | "Assigned"
  | "In Progress"
  | "Resolved"
  | "Closed"
  | "Escalated"
  | "Rejected";

export type ComplaintCategory =
  | "Garbage"
  | "Streetlight"
  | "Pothole"
  | "Water"
  | "Sanitation"
  | "Construction"
  | "Safety"
  | "Other";

export interface Complaint {
  id: string;
  category: ComplaintCategory;
  subcategory: string;
  description: string;
  status: ComplaintStatus;
  priorityScore: number;
  address: string;
  ward: string;
  lat: number;
  lng: number;
  slaDeadline: string;
  slaHours: number;
  slaRemainingHours: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  reporterName: string;
  reporterTier: number;
  confirmations: number;
  assignedTo?: string;
  imageUrl?: string;
  aiConfidence?: number;
  isDuplicate?: boolean;
  escalated?: boolean;
  timeline: TimelineEvent[];
}

export interface TimelineEvent {
  status: ComplaintStatus;
  timestamp: string;
  note: string;
  actor: string;
}

export interface Officer {
  id: string;
  name: string;
  avatar: string;
  activeComplaints: number;
  resolvedThisWeek: number;
  ward: string;
  status: "Available" | "On Site" | "Off Duty";
}

export interface WardStats {
  ward: string;
  totalComplaints: number;
  resolved: number;
  inProgress: number;
  pending: number;
  civicHealthScore: number;
  avgResolutionHours: number;
  rank: number;
}

export const mockComplaints: Complaint[] = [
  {
    id: "CMP-2026-04821",
    category: "Pothole",
    subcategory: "Road",
    description:
      "Large pothole on MG Road near bus stop. Very dangerous for two-wheelers. Multiple accidents reported.",
    status: "In Progress",
    priorityScore: 0.87,
    address: "MG Road, Near Bus Stop 12, Ward 4",
    ward: "Ward 4",
    lat: 28.6139,
    lng: 77.209,
    slaDeadline: "2026-03-06T10:00:00",
    slaHours: 72,
    slaRemainingHours: 14,
    createdAt: "2026-03-03T10:00:00",
    updatedAt: "2026-03-04T08:00:00",
    reporterName: "Rahul Sharma",
    reporterTier: 2,
    confirmations: 7,
    assignedTo: "Officer Priya Mehta",
    imageUrl:
      "https://images.unsplash.com/photo-1730674337922-0bf08006a66a?w=400",
    aiConfidence: 0.92,
    isDuplicate: false,
    escalated: false,
    timeline: [
      {
        status: "Submitted",
        timestamp: "2026-03-03T10:00:00",
        note: "Complaint submitted via mobile app",
        actor: "Rahul Sharma",
      },
      {
        status: "Verified",
        timestamp: "2026-03-03T10:45:00",
        note: "AI priority score 0.87 — fast tracked",
        actor: "System",
      },
      {
        status: "Assigned",
        timestamp: "2026-03-03T11:00:00",
        note: "Assigned to Officer Priya Mehta (Ward 4)",
        actor: "Auto-Router",
      },
      {
        status: "In Progress",
        timestamp: "2026-03-04T08:00:00",
        note: "Officer en route to location",
        actor: "Priya Mehta",
      },
    ],
  },
  {
    id: "CMP-2026-04822",
    category: "Garbage",
    subcategory: "Overflow",
    description:
      "Garbage bin near Sector 5 market overflowing for 3 days. Foul smell and health hazard.",
    status: "Resolved",
    priorityScore: 0.79,
    address: "Sector 5 Market, Ward 7",
    ward: "Ward 7",
    lat: 28.6229,
    lng: 77.218,
    slaDeadline: "2026-03-02T14:00:00",
    slaHours: 24,
    slaRemainingHours: 0,
    createdAt: "2026-03-01T14:00:00",
    updatedAt: "2026-03-02T10:30:00",
    resolvedAt: "2026-03-02T10:30:00",
    reporterName: "Anjali Desai",
    reporterTier: 1,
    confirmations: 12,
    assignedTo: "Officer Ravi Kumar",
    imageUrl:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400",
    aiConfidence: 0.88,
    isDuplicate: false,
    escalated: false,
    timeline: [
      {
        status: "Submitted",
        timestamp: "2026-03-01T14:00:00",
        note: "Filed via WhatsApp bot",
        actor: "Anjali Desai",
      },
      {
        status: "Verified",
        timestamp: "2026-03-01T14:12:00",
        note: "Auto-verified",
        actor: "System",
      },
      {
        status: "Assigned",
        timestamp: "2026-03-01T14:30:00",
        note: "Assigned to Ravi Kumar",
        actor: "Auto-Router",
      },
      {
        status: "In Progress",
        timestamp: "2026-03-02T07:00:00",
        note: "Cleaning crew dispatched",
        actor: "Ravi Kumar",
      },
      {
        status: "Resolved",
        timestamp: "2026-03-02T10:30:00",
        note: "Garbage cleared. GPS-verified proof uploaded.",
        actor: "Ravi Kumar",
      },
    ],
  },
  {
    id: "CMP-2026-04823",
    category: "Streetlight",
    subcategory: "Main Road",
    description:
      "3 consecutive streetlights not working on Nehru Nagar lane. Dark stretch at night — safety concern.",
    status: "Assigned",
    priorityScore: 0.65,
    address: "Nehru Nagar Lane 3, Ward 2",
    ward: "Ward 2",
    lat: 28.605,
    lng: 77.198,
    slaDeadline: "2026-03-06T20:00:00",
    slaHours: 48,
    slaRemainingHours: 32,
    createdAt: "2026-03-04T20:00:00",
    updatedAt: "2026-03-04T21:00:00",
    reporterName: "Mohammed Farouk",
    reporterTier: 1,
    confirmations: 4,
    assignedTo: "Officer Sunita Rao",
    aiConfidence: 0.75,
    isDuplicate: false,
    escalated: false,
    timeline: [
      {
        status: "Submitted",
        timestamp: "2026-03-04T20:00:00",
        note: "Complaint submitted",
        actor: "Mohammed Farouk",
      },
      {
        status: "Verified",
        timestamp: "2026-03-04T20:30:00",
        note: "Volunteer verification confirmed",
        actor: "Volunteer",
      },
      {
        status: "Assigned",
        timestamp: "2026-03-04T21:00:00",
        note: "Assigned to Electrical dept",
        actor: "Auto-Router",
      },
    ],
  },
  {
    id: "CMP-2026-04824",
    category: "Water",
    subcategory: "Supply Failure",
    description: "No water supply since 2 days in Block C. Affecting 40+ households.",
    status: "Escalated",
    priorityScore: 0.91,
    address: "Block C, Indira Colony, Ward 3",
    ward: "Ward 3",
    lat: 28.618,
    lng: 77.205,
    slaDeadline: "2026-03-04T06:00:00",
    slaHours: 24,
    slaRemainingHours: -18,
    createdAt: "2026-03-03T06:00:00",
    updatedAt: "2026-03-04T09:00:00",
    reporterName: "Priya Singh",
    reporterTier: 2,
    confirmations: 21,
    assignedTo: "Officer Deepak Varma",
    aiConfidence: 0.95,
    isDuplicate: false,
    escalated: true,
    timeline: [
      {
        status: "Submitted",
        timestamp: "2026-03-03T06:00:00",
        note: "Emergency report filed",
        actor: "Priya Singh",
      },
      {
        status: "Verified",
        timestamp: "2026-03-03T06:05:00",
        note: "Fast-tracked — AI score 0.91",
        actor: "System",
      },
      {
        status: "Assigned",
        timestamp: "2026-03-03T06:30:00",
        note: "Assigned to water dept",
        actor: "Auto-Router",
      },
      {
        status: "Escalated",
        timestamp: "2026-03-04T06:00:00",
        note: "SLA breached — auto-escalated to department head",
        actor: "System",
      },
    ],
  },
  {
    id: "CMP-2026-04825",
    category: "Safety",
    subcategory: "Public Hazard",
    description: "Exposed electric wire hanging low on Rajiv Chowk. Immediate safety risk.",
    status: "Submitted",
    priorityScore: 0.96,
    address: "Rajiv Chowk, Near ATM, Ward 1",
    ward: "Ward 1",
    lat: 28.632,
    lng: 77.22,
    slaDeadline: "2026-03-04T22:00:00",
    slaHours: 12,
    slaRemainingHours: 5,
    createdAt: "2026-03-04T10:00:00",
    updatedAt: "2026-03-04T10:00:00",
    reporterName: "Kiran Patel",
    reporterTier: 1,
    confirmations: 3,
    aiConfidence: 0.89,
    isDuplicate: false,
    escalated: false,
    timeline: [
      {
        status: "Submitted",
        timestamp: "2026-03-04T10:00:00",
        note: "Emergency safety complaint",
        actor: "Kiran Patel",
      },
    ],
  },
  {
    id: "CMP-2026-04826",
    category: "Sanitation",
    subcategory: "Drainage",
    description: "Clogged drain on Patel Street. Sewage overflow onto road after rain.",
    status: "Pending Verification",
    priorityScore: 0.52,
    address: "Patel Street, Ward 5",
    ward: "Ward 5",
    lat: 28.598,
    lng: 77.212,
    slaDeadline: "2026-03-06T15:00:00",
    slaHours: 24,
    slaRemainingHours: 28,
    createdAt: "2026-03-03T15:00:00",
    updatedAt: "2026-03-03T16:00:00",
    reporterName: "Anonymous",
    reporterTier: 0,
    confirmations: 2,
    aiConfidence: 0.61,
    isDuplicate: false,
    escalated: false,
    timeline: [
      {
        status: "Submitted",
        timestamp: "2026-03-03T15:00:00",
        note: "Submitted as pseudonymous",
        actor: "Anonymous",
      },
      {
        status: "Pending Verification",
        timestamp: "2026-03-03T16:00:00",
        note: "Routed to volunteer verifier",
        actor: "System",
      },
    ],
  },
  {
    id: "CMP-2026-04827",
    category: "Construction",
    subcategory: "Illegal",
    description: "Unauthorized construction happening at plot 43. No visible permits.",
    status: "Submitted",
    priorityScore: 0.44,
    address: "Plot 43, Shastri Nagar, Ward 6",
    ward: "Ward 6",
    lat: 28.625,
    lng: 77.195,
    slaDeadline: "2026-03-09T12:00:00",
    slaHours: 120,
    slaRemainingHours: 96,
    createdAt: "2026-03-04T12:00:00",
    updatedAt: "2026-03-04T12:00:00",
    reporterName: "Suresh Nair",
    reporterTier: 2,
    confirmations: 1,
    aiConfidence: 0.55,
    isDuplicate: false,
    escalated: false,
    timeline: [
      {
        status: "Submitted",
        timestamp: "2026-03-04T12:00:00",
        note: "Complaint submitted with photos",
        actor: "Suresh Nair",
      },
    ],
  },
  {
    id: "CMP-2026-04828",
    category: "Pothole",
    subcategory: "Footpath",
    description: "Broken footpath tiles near school causing injury risk to children.",
    status: "Closed",
    priorityScore: 0.71,
    address: "Near Govt School, Lajpat Nagar, Ward 4",
    ward: "Ward 4",
    lat: 28.609,
    lng: 77.203,
    slaDeadline: "2026-02-28T08:00:00",
    slaHours: 120,
    slaRemainingHours: 0,
    createdAt: "2026-02-23T08:00:00",
    updatedAt: "2026-02-28T07:00:00",
    resolvedAt: "2026-02-28T07:00:00",
    reporterName: "Meena Kumari",
    reporterTier: 1,
    confirmations: 8,
    assignedTo: "Officer Priya Mehta",
    aiConfidence: 0.82,
    isDuplicate: false,
    escalated: false,
    timeline: [
      {
        status: "Submitted",
        timestamp: "2026-02-23T08:00:00",
        note: "Complaint filed",
        actor: "Meena Kumari",
      },
      {
        status: "Verified",
        timestamp: "2026-02-23T09:00:00",
        note: "Verified by volunteer",
        actor: "Volunteer",
      },
      {
        status: "Assigned",
        timestamp: "2026-02-23T10:00:00",
        note: "Assigned",
        actor: "Auto-Router",
      },
      {
        status: "In Progress",
        timestamp: "2026-02-25T08:00:00",
        note: "Repair work started",
        actor: "Priya Mehta",
      },
      {
        status: "Resolved",
        timestamp: "2026-02-28T07:00:00",
        note: "Tiles replaced and area cleared",
        actor: "Priya Mehta",
      },
      {
        status: "Closed",
        timestamp: "2026-02-28T10:00:00",
        note: "Citizen confirmed resolution",
        actor: "Meena Kumari",
      },
    ],
  },
];

export const mockOfficers: Officer[] = [
  {
    id: "OFF-001",
    name: "Priya Mehta",
    avatar: "PM",
    activeComplaints: 4,
    resolvedThisWeek: 12,
    ward: "Ward 4",
    status: "On Site",
  },
  {
    id: "OFF-002",
    name: "Ravi Kumar",
    avatar: "RK",
    activeComplaints: 2,
    resolvedThisWeek: 8,
    ward: "Ward 7",
    status: "Available",
  },
  {
    id: "OFF-003",
    name: "Sunita Rao",
    avatar: "SR",
    activeComplaints: 5,
    resolvedThisWeek: 9,
    ward: "Ward 2",
    status: "On Site",
  },
  {
    id: "OFF-004",
    name: "Deepak Varma",
    avatar: "DV",
    activeComplaints: 3,
    resolvedThisWeek: 6,
    ward: "Ward 3",
    status: "On Site",
  },
  {
    id: "OFF-005",
    name: "Anjana Pillai",
    avatar: "AP",
    activeComplaints: 1,
    resolvedThisWeek: 15,
    ward: "Ward 1",
    status: "Available",
  },
];

export const mockWardStats: WardStats[] = [
  {
    ward: "Ward 7",
    totalComplaints: 134,
    resolved: 118,
    inProgress: 10,
    pending: 6,
    civicHealthScore: 94,
    avgResolutionHours: 28,
    rank: 1,
  },
  {
    ward: "Ward 1",
    totalComplaints: 98,
    resolved: 84,
    inProgress: 9,
    pending: 5,
    civicHealthScore: 89,
    avgResolutionHours: 31,
    rank: 2,
  },
  {
    ward: "Ward 4",
    totalComplaints: 142,
    resolved: 121,
    inProgress: 14,
    pending: 7,
    civicHealthScore: 85,
    avgResolutionHours: 37,
    rank: 3,
  },
  {
    ward: "Ward 2",
    totalComplaints: 87,
    resolved: 71,
    inProgress: 11,
    pending: 5,
    civicHealthScore: 82,
    avgResolutionHours: 42,
    rank: 4,
  },
  {
    ward: "Ward 5",
    totalComplaints: 115,
    resolved: 88,
    inProgress: 16,
    pending: 11,
    civicHealthScore: 78,
    avgResolutionHours: 48,
    rank: 5,
  },
  {
    ward: "Ward 3",
    totalComplaints: 103,
    resolved: 72,
    inProgress: 20,
    pending: 11,
    civicHealthScore: 71,
    avgResolutionHours: 58,
    rank: 6,
  },
  {
    ward: "Ward 6",
    totalComplaints: 76,
    resolved: 48,
    inProgress: 18,
    pending: 10,
    civicHealthScore: 64,
    avgResolutionHours: 71,
    rank: 7,
  },
];

export const kpiData = {
  mtta: 3.2,
  mttr: 54.7,
  slaCompliance: 82.4,
  verificationRate: 67.3,
  reopenRate: 7.8,
  satisfactionScore: 4.2,
  totalComplaints: 1248,
  resolvedThisMonth: 347,
  activeToday: 42,
  escalatedToday: 3,
};

export const complaintTrendData = [
  { day: "Feb 26", submitted: 38, resolved: 32, escalated: 2 },
  { day: "Feb 27", submitted: 45, resolved: 29, escalated: 3 },
  { day: "Feb 28", submitted: 52, resolved: 44, escalated: 1 },
  { day: "Mar 1", submitted: 41, resolved: 38, escalated: 4 },
  { day: "Mar 2", submitted: 63, resolved: 47, escalated: 5 },
  { day: "Mar 3", submitted: 55, resolved: 51, escalated: 2 },
  { day: "Mar 4", submitted: 48, resolved: 36, escalated: 3 },
];

export const categoryBreakdown = [
  { name: "Pothole", value: 28, color: "#EF4444" },
  { name: "Garbage", value: 22, color: "#F59E0B" },
  { name: "Streetlight", value: 15, color: "#3B82F6" },
  { name: "Water", value: 14, color: "#06B6D4" },
  { name: "Sanitation", value: 10, color: "#8B5CF6" },
  { name: "Safety", value: 6, color: "#EC4899" },
  { name: "Construction", value: 4, color: "#10B981" },
  { name: "Other", value: 1, color: "#6B7280" },
];

export const slaConfig = [
  {
    category: "Pothole (Road)",
    defaultSLA: 72,
    escalationSLA: 48,
    emergencySLA: null,
  },
  {
    category: "Pothole (Footpath)",
    defaultSLA: 120,
    escalationSLA: 72,
    emergencySLA: null,
  },
  {
    category: "Garbage Overflow",
    defaultSLA: 24,
    escalationSLA: 12,
    emergencySLA: null,
  },
  {
    category: "Streetlight Failure",
    defaultSLA: 48,
    escalationSLA: 24,
    emergencySLA: null,
  },
  {
    category: "Water Supply Failure",
    defaultSLA: 24,
    escalationSLA: 8,
    emergencySLA: 4,
  },
  {
    category: "Sewage / Sanitation",
    defaultSLA: 24,
    escalationSLA: 8,
    emergencySLA: 4,
  },
  {
    category: "Illegal Construction",
    defaultSLA: 120,
    escalationSLA: 72,
    emergencySLA: null,
  },
  {
    category: "Public Safety Hazard",
    defaultSLA: 12,
    escalationSLA: 4,
    emergencySLA: 1,
  },
];

export const currentUser = {
  id: "USR-001",
  name: "Rahul Sharma",
  phone: "+91 98765 43210",
  email: "rahul.sharma@gmail.com",
  tier: 2,
  reputationScore: 420,
  reputationLevel: "Verified Contributor",
  joinedDate: "January 2026",
  complaintsField: 18,
  verified: 15,
  resolved: 12,
  badges: [
    { id: "first_reporter", name: "First Reporter", icon: "🌱", earned: true },
    {
      id: "verified_contributor",
      name: "Verified Contributor",
      icon: "🔍",
      earned: true,
    },
    {
      id: "problem_solver",
      name: "Problem Solver",
      icon: "🛠️",
      earned: true,
    },
    {
      id: "neighborhood_hero",
      name: "Neighborhood Hero",
      icon: "🦸",
      earned: false,
      criteria: "25 verified reports, >90% accuracy",
    },
    {
      id: "ward_champion",
      name: "Ward Champion",
      icon: "🏆",
      earned: false,
      criteria: "Top contributor in ward for 3 months",
    },
    {
      id: "volunteer_star",
      name: "Volunteer Star",
      icon: "🤝",
      earned: false,
      criteria: "50 verifications completed",
    },
  ],
  ward: "Ward 4",
  nextMilestone: 500,
  confirmationsGiven: 23,
};
