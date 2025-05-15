import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Lead data schema for trial signups
export const leadData = pgTable("lead_data", {
  id: serial("id").primaryKey(),
  businessName: text("business_name").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  industry: text("industry").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const leadDataSchema = createInsertSchema(leadData).pick({
  businessName: true,
  fullName: true,
  email: true,
  phone: true,
  industry: true,
});

export type InsertLeadData = z.infer<typeof leadDataSchema>;
export type LeadData = typeof leadData.$inferSelect;

// Vapi calls schema for tracking call data
export const calls = pgTable("calls", {
  id: serial("id").primaryKey(),
  call_id: varchar("call_id", { length: 100 }).notNull().unique(),
  caller_id: varchar("caller_id", { length: 100 }),
  start_time: timestamp("start_time"),
  end_time: timestamp("end_time"),
  duration_seconds: integer("duration_seconds"),
  workflow_id: varchar("workflow_id", { length: 100 }),
  transcription: text("transcription"),
  summary: text("summary"),
  status: varchar("status", { length: 20 }).default("started"), // started, ended, completed, etc.
  created_at: timestamp("created_at").notNull().defaultNow(),
  user_id: integer("user_id").references(() => users.id).default(1), // Associate with a user (default to admin1)
});

export const insertCallSchema = createInsertSchema(calls).omit({
  id: true,
  created_at: true,
});

export type InsertCall = z.infer<typeof insertCallSchema>;
export type Call = typeof calls.$inferSelect;
