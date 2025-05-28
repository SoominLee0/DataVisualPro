import { z } from "zod";
import { pgTable, text, integer, boolean, timestamp, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

// Database Tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  currentDay: integer("current_day").notNull().default(1),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  totalPoints: integer("total_points").notNull().default(0),
  totalChallenges: integer("total_challenges").notNull().default(0),
  successRate: integer("success_rate").notNull().default(0),
  badges: jsonb("badges").notNull().default("[]"),
  groupIds: jsonb("group_ids").notNull().default("[]"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at").notNull().defaultNow(),
});

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  day: integer("day").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  videoUrl: text("video_url").notNull(),
  duration: text("duration").notNull(),
  difficulty: integer("difficulty").notNull(),
  points: integer("points").notNull().default(100),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  challengeId: integer("challenge_id").notNull(),
  challengeDay: integer("challenge_day").notNull(),
  type: text("type").notNull(),
  content: text("content").notNull(),
  isSuccess: boolean("is_success").notNull(),
  points: integer("points").notNull(),
  groupId: integer("group_id"),
  reactions: jsonb("reactions").notNull().default("[]"),
  comments: jsonb("comments").notNull().default("[]"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: integer("owner_id").notNull(),
  memberIds: jsonb("member_ids").notNull().default("[]"),
  totalPoints: integer("total_points").notNull().default(0),
  isPublic: boolean("is_public").notNull().default(false),
  inviteCode: text("invite_code").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Zod schemas for type safety
export const userSchema = createSelectSchema(users);
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true, 
  lastLoginAt: true 
});

export const challengeSchema = createSelectSchema(challenges);
export const insertChallengeSchema = createInsertSchema(challenges).omit({ 
  id: true, 
  createdAt: true 
});

export const submissionSchema = createSelectSchema(submissions);
export const insertSubmissionSchema = createInsertSchema(submissions).omit({ 
  id: true, 
  createdAt: true,
  reactions: true,
  comments: true
});

export const groupSchema = createSelectSchema(groups);
export const insertGroupSchema = createInsertSchema(groups).omit({ 
  id: true, 
  createdAt: true,
  inviteCode: true
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Challenge = z.infer<typeof challengeSchema>;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Submission = z.infer<typeof submissionSchema>;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Group = z.infer<typeof groupSchema>;
export type InsertGroup = z.infer<typeof insertGroupSchema>;

// Additional types for compatibility
export type WeeklyRanking = {
  id: number;
  userId: number;
  groupId: number;
  weekStart: Date;
  weeklyPoints: number;
  rank: number;
  completedChallenges: number;
};

export type Activity = {
  id: number;
  userId: number;
  type: 'challenge_completed' | 'streak_milestone' | 'badge_earned' | 'joined_group';
  content: string;
  relatedId?: number;
  groupId?: number;
  createdAt: Date;
};