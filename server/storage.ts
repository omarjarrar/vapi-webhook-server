import { 
  users, type User, type InsertUser, 
  leadData, type LeadData, type InsertLeadData,
  calls, type Call, type InsertCall
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Lead/trial signup storage methods
  createLead(leadData: InsertLeadData): Promise<LeadData>;
  getLeads(): Promise<LeadData[]>;

  // Call tracking methods
  createCall(call: InsertCall): Promise<Call>;
  getCall(callId: string): Promise<Call | undefined>;
  updateCall(callId: string, updates: Partial<InsertCall>): Promise<Call | undefined>;
  getCalls(limit?: number): Promise<Call[]>;
  getCallsByStatus(status: string, limit?: number): Promise<Call[]>;
  getCallStats(): Promise<{
    totalCalls: number;
    totalMinutes: number;
    workflowCounts: Record<string, number>;
  }>;

  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    const PostgresStore = connectPg(session);
    this.sessionStore = new PostgresStore({
      pool,
      createTableIfMissing: true
    });
  }
  
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createLead(insertLeadData: InsertLeadData): Promise<LeadData> {
    const [lead] = await db.insert(leadData).values(insertLeadData).returning();
    return lead;
  }

  async getLeads(): Promise<LeadData[]> {
    return await db.select().from(leadData);
  }

  // Call tracking methods implementation
  async createCall(call: InsertCall): Promise<Call> {
    const [newCall] = await db.insert(calls).values(call).returning();
    return newCall;
  }

  async getCall(callId: string): Promise<Call | undefined> {
    const [call] = await db.select().from(calls).where(eq(calls.call_id, callId));
    return call;
  }

  async updateCall(callId: string, updates: Partial<InsertCall>): Promise<Call | undefined> {
    const [updatedCall] = await db
      .update(calls)
      .set(updates)
      .where(eq(calls.call_id, callId))
      .returning();
    return updatedCall;
  }

  async getCalls(limit?: number): Promise<Call[]> {
    const query = db.select().from(calls);
    
    // Execute the query
    const results = await query;
    
    // Sort the results in memory
    const sortedResults = results.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    
    // Apply limit if specified
    if (limit && limit > 0) {
      return sortedResults.slice(0, limit);
    }
    
    return sortedResults;
  }

  async getCallsByStatus(status: string, limit?: number): Promise<Call[]> {
    const query = db
      .select()
      .from(calls)
      .where(eq(calls.status, status));
    
    // Execute the query
    const results = await query;
    
    // Sort the results in memory
    const sortedResults = results.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    
    // Apply limit if specified
    if (limit && limit > 0) {
      return sortedResults.slice(0, limit);
    }
    
    return sortedResults;
  }

  async getCallStats(): Promise<{
    totalCalls: number;
    totalMinutes: number;
    workflowCounts: Record<string, number>;
  }> {
    // Get all calls
    const allCalls = await db.select().from(calls);
    
    // Calculate total calls
    const totalCalls = allCalls.length;
    
    // Calculate total minutes
    const totalSeconds = allCalls.reduce((acc, call) => {
      return acc + (call.duration_seconds || 0);
    }, 0);
    const totalMinutes = Math.ceil(totalSeconds / 60);
    
    // Calculate workflow counts
    const workflowCounts: Record<string, number> = {};
    
    allCalls.forEach(call => {
      if (call.workflow_id) {
        workflowCounts[call.workflow_id] = (workflowCounts[call.workflow_id] || 0) + 1;
      }
    });
    
    return {
      totalCalls,
      totalMinutes,
      workflowCounts
    };
  }
}

export const storage = new DatabaseStorage();
