export type UserRole = "admin" | "coach" | "parent";

export interface Profile {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  role: UserRole;
}

export interface Batch {
  id: string;
  name: "U14" | "U16" | "U19" | "U23" | "Open";
  sessionTime: "Morning" | "Evening" | "Under lights";
  timeSlot: string;
  playerCount: number;
  leadCoach: string;
}

export interface Player {
  id: string;
  playerCode: string;
  fullName: string;
  dob: string;
  age: number;
  gender: "Boy" | "Girl";
  batchId: string;
  batchName: string;
  parentId: string;
  parentName: string;
  parentPhone: string;
  primaryRole: "Fast Bowler" | "Batsman" | "All-rounder" | "Wicketkeeper" | "Spinner";
  bowlingStyle?: string;
  battingStyle?: string;
  status: "active" | "inactive" | "injured";
  joiningDate: string;
}

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface AttendanceRecord {
  id: string;
  playerId: string;
  batchId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
}

export interface FeeRecord {
  id: string;
  playerId: string;
  monthYear: string;
  amount: number;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
  paymentMode?: "UPI" | "Cash" | "Card" | "Bank Transfer";
  transactionRef?: string;
  paidAt?: string;
  receiptNo?: string;
}

export interface MatchPerformance {
  id: string;
  playerId: string;
  matchDate: string;
  opponent: string;
  level: "Academy" | "Inter-academy" | "District" | "State";
  battingScore: string;
  bowlingFigures: string;
  coachNotes?: string;
}

export interface VideoAnalysis {
  id: string;
  playerId: string;
  coachName: string;
  date: string;
  videoUrl: string;
  thumbnailPlaceholderColor: string;
  skillCategory: "Run-up & Approach" | "Release Point" | "Seam & Wrist Position" | "Follow-through" | "Pitch Map Accuracy";
  bowlingSpeedKmph?: number;
  feedback: string;
  keyPointers: string[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: "Notice" | "Match Day" | "Holiday" | "Camp" | "Schedule";
  date: string;
  targetBatch?: string;
}

export interface Enquiry {
  id: string;
  playerName: string;
  age: number;
  phone: string;
  preferredBatch: string;
  status: "new" | "contacted" | "trial_booked" | "enrolled" | "archived";
  createdAt: string;
  notes?: string;
}
