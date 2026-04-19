export type ComplaintStatus =
  | "Submitted"
  | "Assigned"
  | "In Progress"
  | "Pending Review"
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
  area: string;
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
  assignedTo?: string;
  imageUrl?: string;
  aiConfidence?: number;
  isDuplicate?: boolean;
  escalated?: boolean;
  state?: string;
  photos?: string[];
  timeline: TimelineEvent[];
}

export interface Worker {
  id: string;
  name: string;
  phone: string;
  state: string;
  area: string;
  status: "Available" | "Busy" | "Offline";
  rating: number;
}

export interface Manager {
  id: string;
  name: string;
  email: string;
  phone: string;
  managedState: string;
  managedAreas: string[];
}

export const mockManagers: Manager[] = [
  {
    id: "MGR-DEL-01",
    name: "Sanjay Sharma",
    email: "sanjay@civicpulse.com",
    phone: "+919810012345",
    managedState: "Delhi",
    managedAreas: ["North Delhi", "Civil Lines"],
  },
  {
    id: "MGR-DEL-02",
    name: "Meena Kumari",
    email: "meena@civicpulse.com",
    phone: "+919810023456",
    managedState: "Delhi",
    managedAreas: ["New Delhi", "Chanakyapuri"],
  },
  {
    id: "MGR-DEL-03",
    name: "Rajesh Tyagi",
    email: "rajesh@civicpulse.com",
    phone: "+919810034567",
    managedState: "Delhi",
    managedAreas: ["East Delhi", "Laxmi Nagar"],
  },
  {
    id: "MGR-DEL-04",
    name: "Anita Singh",
    email: "anita@civicpulse.com",
    phone: "+919810045678",
    managedState: "Delhi",
    managedAreas: ["West Delhi", "Dwarka"],
  },
  {
    id: "MGR-DEL-05",
    name: "Amit Goel",
    email: "amit@civicpulse.com",
    phone: "+919810056789",
    managedState: "Delhi",
    managedAreas: ["Central Delhi", "Connaught Place"],
  },
  {
    id: "MGR-DEL-06",
    name: "Priya Sharma",
    email: "priya@civicpulse.com",
    phone: "+919810067890",
    managedState: "Delhi",
    managedAreas: ["North Delhi", "Civil Lines"],
  },
  {
    id: "MGR-DEL-07",
    name: "Vikram Singh",
    email: "vikram@civicpulse.com",
    phone: "+919810078901",
    managedState: "Delhi",
    managedAreas: ["North West Delhi", "Rohini"],
  },
  {
    id: "MGR-DEL-08",
    name: "Sunita Devi",
    email: "sunita@civicpulse.com",
    phone: "+919810089012",
    managedState: "Delhi",
    managedAreas: ["North East Delhi", "Karawal Nagar"],
  },
  {
    id: "MGR-DEL-09",
    name: "Rakesh Gupta",
    email: "rakesh@civicpulse.com",
    phone: "+919810090123",
    managedState: "Delhi",
    managedAreas: ["Shahdara", "Seelampur"],
  },
  {
    id: "MGR-DEL-10",
    name: "Kavita Reddy",
    email: "kavita@civicpulse.com",
    phone: "+919810101234",
    managedState: "Delhi",
    managedAreas: ["South East Delhi", "Okhla"],
  },
  {
    id: "MGR-DEL-11",
    name: "Suresh Kumar",
    email: "suresh@civicpulse.com",
    phone: "+919810112345",
    managedState: "Delhi",
    managedAreas: ["South West Delhi", "Najafgarh"],
  },
];

// Worker Login Credentials for Testing
// Worker Demo Credentials for Testing
// Note: In production, workers will be created in Appwrite
export interface WorkerCredential {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  state: string;
  area: string;
}

export const workerCredentials: WorkerCredential[] = [
  // Delhi Workers
  {
    id: "WKR-DEL-01",
    name: "Ramu",
    email: "ramu@civicpulse.com",
    password: "Worker@123",
    phone: "+919001100111",
    state: "Delhi",
    area: "North Delhi",
  },
  {
    id: "WKR-DEL-07",
    name: "Sunil",
    email: "sunil@civicpulse.com",
    password: "Worker@123",
    phone: "+919002200223",
    state: "Delhi",
    area: "Central Delhi",
  },
  {
    id: "WKR-DEL-02",
    name: "Shamu",
    email: "shamu@civicpulse.com",
    password: "Worker@123",
    phone: "+919001100112",
    state: "Delhi",
    area: "North Delhi",
  },
  {
    id: "WKR-DEL-04",
    name: "Golu",
    email: "golu@civicpulse.com",
    password: "Worker@123",
    phone: "+919001100114",
    state: "Delhi",
    area: "North Delhi",
  },
  {
    id: "WKR-DEL-05",
    name: "Vikram",
    email: "vikram@civicpulse.com",
    password: "Worker@123",
    phone: "+919002200221",
    state: "Delhi",
    area: "Central Delhi",
  },
  {
    id: "WKR-DEL-08",
    name: "Anil",
    email: "anil@civicpulse.com",
    password: "Worker@123",
    phone: "+919002200224",
    state: "Delhi",
    area: "Central Delhi",
  },
];

export const mockWorkers: Worker[] = workerCredentials.map((w) => ({
  id: w.id,
  name: w.name,
  phone: w.phone,
  state: w.state,
  area: w.area,
  status: "Available",
  rating: 4.5,
}));

export const mockComplaints: Complaint[] = [];

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
  area: string;
  status: "Available" | "On Site" | "Off Duty";
}

export interface AreaStats {
  area: string;
  totalComplaints: number;
  resolved: number;
  inProgress: number;
  pending: number;
  civicHealthScore: number;
  avgResolutionHours: number;
  rank: number;
}

export const mockOfficers: Officer[] = [
  {
    id: "OFF-001",
    name: "Priya Mehta",
    avatar: "PM",
    activeComplaints: 4,
    resolvedThisWeek: 12,
    area: "North Delhi",
    status: "On Site",
  },
  {
    id: "OFF-002",
    name: "Ravi Kumar",
    avatar: "RK",
    activeComplaints: 2,
    resolvedThisWeek: 8,
    area: "South Delhi",
    status: "Available",
  },
  {
    id: "OFF-003",
    name: "Sunita Rao",
    avatar: "SR",
    activeComplaints: 5,
    resolvedThisWeek: 9,
    area: "East Delhi",
    status: "On Site",
  },
  {
    id: "OFF-004",
    name: "Deepak Varma",
    avatar: "DV",
    activeComplaints: 3,
    resolvedThisWeek: 6,
    area: "West Delhi",
    status: "On Site",
  },
  {
    id: "OFF-005",
    name: "Anjana Pillai",
    avatar: "AP",
    activeComplaints: 1,
    resolvedThisWeek: 15,
    area: "Central Delhi",
    status: "Available",
  },
];

export const mockAreaStats: AreaStats[] = [
  {
    area: "Delhi Central",
    totalComplaints: 134,
    resolved: 118,
    inProgress: 10,
    pending: 6,
    civicHealthScore: 94,
    avgResolutionHours: 28,
    rank: 1,
  },
  {
    area: "South Delhi",
    totalComplaints: 98,
    resolved: 84,
    inProgress: 9,
    pending: 5,
    civicHealthScore: 89,
    avgResolutionHours: 31,
    rank: 2,
  },
  {
    area: "East Delhi",
    totalComplaints: 142,
    resolved: 121,
    inProgress: 14,
    pending: 7,
    civicHealthScore: 85,
    avgResolutionHours: 37,
    rank: 3,
  },
  {
    area: "West Delhi",
    totalComplaints: 87,
    resolved: 71,
    inProgress: 11,
    pending: 5,
    civicHealthScore: 82,
    avgResolutionHours: 42,
    rank: 4,
  },
  {
    area: "North Delhi",
    totalComplaints: 115,
    resolved: 88,
    inProgress: 16,
    pending: 11,
    civicHealthScore: 78,
    avgResolutionHours: 48,
    rank: 5,
  },
  {
    area: "Connaught Place",
    totalComplaints: 103,
    resolved: 72,
    inProgress: 20,
    pending: 11,
    civicHealthScore: 71,
    avgResolutionHours: 58,
    rank: 6,
  },
  {
    area: "Dwarka",
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
  reputationLevel: "Active Reporter",
  joinedDate: "January 2026",
  complaintsField: 18,
  resolved: 12,
  badges: [
    { id: "first_reporter", name: "First Reporter", icon: "🌱", earned: true },
    {
      id: "consistent_reporter",
      name: "Consistent Reporter",
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
      criteria: "25 reports, >90% accuracy",
    },
    {
      id: "ward_champion",
      name: "Area Champion",
      icon: "🏆",
      earned: false,
      criteria: "Top contributor in area for 3 months",
    },
  ],
  area: "Connaught Place",
  nextMilestone: 500,
};
