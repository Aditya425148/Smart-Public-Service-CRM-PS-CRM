export type ComplaintStatus =
  | "Submitted"
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
  assignedTo?: string;
  imageUrl?: string;
  aiConfidence?: number;
  isDuplicate?: boolean;
  escalated?: boolean;
  state?: string;
  area?: string;
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
  // --- DELHI MANAGERS (5) ---
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
    managedAreas: ["South Delhi", "Saket"],
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

  // --- UP MANAGERS (10) ---
  {
    id: "MGR-UP-01",
    name: "Yash Pal",
    email: "yash@civicpulse.com",
    phone: "+919920011223",
    managedState: "Uttar Pradesh",
    managedAreas: ["Lucknow City", "Hazratganj"],
  },
  {
    id: "MGR-UP-02",
    name: "Priti Yadav",
    email: "priti@civicpulse.com",
    phone: "+919920022334",
    managedState: "Uttar Pradesh",
    managedAreas: ["Kanpur Central", "Kalyanpur"],
  },
  {
    id: "MGR-UP-03",
    name: "Manoj Mishra",
    email: "manoj@civicpulse.com",
    phone: "+919920033445",
    managedState: "Uttar Pradesh",
    managedAreas: ["Varanasi Ghant", "Lanka"],
  },
  {
    id: "MGR-UP-04",
    name: "Renu Devi",
    email: "renu@civicpulse.com",
    phone: "+919920044556",
    managedState: "Uttar Pradesh",
    managedAreas: ["Agra Fort", "Tajganj"],
  },
  {
    id: "MGR-UP-05",
    name: "Suresh Chandra",
    email: "suresh@civicpulse.com",
    phone: "+919920055667",
    managedState: "Uttar Pradesh",
    managedAreas: ["Meerut Cantt", "Modipuram"],
  },
  {
    id: "MGR-UP-06",
    name: "Kiran Singh",
    email: "kiran@civicpulse.com",
    phone: "+919920066778",
    managedState: "Uttar Pradesh",
    managedAreas: ["Prayagraj", "Civil Lines UP"],
  },
  {
    id: "MGR-UP-07",
    name: "Deepak Rawat",
    email: "deepak@civicpulse.com",
    phone: "+919920077889",
    managedState: "Uttar Pradesh",
    managedAreas: ["Ghaziabad", "Indirapuram"],
  },
  {
    id: "MGR-UP-08",
    name: "Alka Jha",
    email: "alka@civicpulse.com",
    phone: "+919920088990",
    managedState: "Uttar Pradesh",
    managedAreas: ["Noida Sector 62", "Greater Noida"],
  },
  {
    id: "MGR-UP-09",
    name: "Vikrant Tomar",
    email: "vikrant@civicpulse.com",
    phone: "+919920099001",
    managedState: "Uttar Pradesh",
    managedAreas: ["Bareilly", "Izatnagar"],
  },
  {
    id: "MGR-UP-10",
    name: "Sudhir Maurya",
    email: "sudhir@civicpulse.com",
    phone: "+919920010112",
    managedState: "Uttar Pradesh",
    managedAreas: ["Gorakhpur", "Cantt Area"],
  },
];

export const mockWorkers: Worker[] = [
  // Workers for Delhi (4 per area focus)
  {
    id: "WKR-DEL-01",
    name: "Ramu",
    phone: "+919001100111",
    state: "Delhi",
    area: "North Delhi",
    status: "Available",
    rating: 4.2,
  },
  {
    id: "WKR-DEL-02",
    name: "Shamu",
    phone: "+919001100112",
    state: "Delhi",
    area: "North Delhi",
    status: "Available",
    rating: 4.5,
  },
  {
    id: "WKR-DEL-03",
    name: "Kalu",
    phone: "+919001100113",
    state: "Delhi",
    area: "North Delhi",
    status: "Busy",
    rating: 3.9,
  },
  {
    id: "WKR-DEL-04",
    name: "Golu",
    phone: "+919001100114",
    state: "Delhi",
    area: "North Delhi",
    status: "Available",
    rating: 4.8,
  },

  {
    id: "WKR-DEL-05",
    name: "Vikram",
    phone: "+919002200221",
    state: "Delhi",
    area: "Central Delhi",
    status: "Available",
    rating: 4.1,
  },
  {
    id: "WKR-DEL-06",
    name: "Manoj",
    phone: "+919002200222",
    state: "Delhi",
    area: "Central Delhi",
    status: "Busy",
    rating: 4.4,
  },
  {
    id: "WKR-DEL-07",
    name: "Sunil",
    phone: "+919002200223",
    state: "Delhi",
    area: "Central Delhi",
    status: "Available",
    rating: 4.0,
  },
  {
    id: "WKR-DEL-08",
    name: "Anil",
    phone: "+919002200224",
    state: "Delhi",
    area: "Central Delhi",
    status: "Available",
    rating: 4.6,
  },

  // Workers for UP (Representative sample of 4 for Lucknow)
  {
    id: "WKR-UP-01",
    name: "Prakash",
    phone: "+919111100111",
    state: "Uttar Pradesh",
    area: "Lucknow City",
    status: "Available",
    rating: 4.3,
  },
  {
    id: "WKR-UP-02",
    name: "Om",
    phone: "+919111100112",
    state: "Uttar Pradesh",
    area: "Lucknow City",
    status: "Busy",
    rating: 4.0,
  },
  {
    id: "WKR-UP-03",
    name: "Ved",
    phone: "+919111100113",
    state: "Uttar Pradesh",
    area: "Lucknow City",
    status: "Available",
    rating: 4.7,
  },
  {
    id: "WKR-UP-04",
    name: "Jai",
    phone: "+919111100114",
    state: "Uttar Pradesh",
    area: "Lucknow City",
    status: "Available",
    rating: 4.2,
  },

  {
    id: "WKR-UP-05",
    name: "Ravi",
    phone: "+919112200221",
    state: "Uttar Pradesh",
    area: "Kanpur Central",
    status: "Available",
    rating: 4.4,
  },
  {
    id: "WKR-UP-06",
    name: "Som",
    phone: "+919112200222",
    state: "Uttar Pradesh",
    area: "Kanpur Central",
    status: "Available",
    rating: 4.1,
  },
  {
    id: "WKR-UP-07",
    name: "Harry",
    phone: "+919112200223",
    state: "Uttar Pradesh",
    area: "Kanpur Central",
    status: "Busy",
    rating: 3.8,
  },
  {
    id: "WKR-UP-08",
    name: "Dev",
    phone: "+919112200224",
    state: "Uttar Pradesh",
    area: "Kanpur Central",
    status: "Available",
    rating: 4.5,
  },
];

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
      name: "Ward Champion",
      icon: "🏆",
      earned: false,
      criteria: "Top contributor in ward for 3 months",
    },
  ],
  ward: "Ward 4",
  nextMilestone: 500,
};
