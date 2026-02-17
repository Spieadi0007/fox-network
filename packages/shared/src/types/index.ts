export enum Role {
  Admin = "admin",
  Manager = "manager",
  Technician = "technician",
  Viewer = "viewer",
}

export enum AccountType {
  Company = "company",
  Partner = "partner",
}

export enum OrgSize {
  XSmall = "1-10",
  Small = "11-50",
  Medium = "51-200",
  Large = "201-500",
  Enterprise = "500+",
}

export enum PartnerRequestStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  size: OrgSize;
  industry?: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerRequest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  trade: string;
  status: PartnerRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  assigneeId?: string;
  assetId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  location: string;
  status: "active" | "inactive" | "maintenance";
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
