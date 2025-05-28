import { z } from "zod";

// User Schema
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatar: z.string().optional(),
  currentDay: z.number().default(1),
  currentStreak: z.number().default(0),
  longestStreak: z.number().default(0),
  totalPoints: z.number().default(0),
  totalChallenges: z.number().default(0),
  successRate: z.number().default(0),
  badges: z.array(z.string()).default([]),
  groupIds: z.array(z.string()).default([]),
  createdAt: z.date(),
  lastLoginAt: z.date(),
});

export const insertUserSchema = userSchema.omit({ 
  id: true, 
  createdAt: true, 
  lastLoginAt: true 
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Challenge Schema
export const challengeSchema = z.object({
  id: z.string(),
  day: z.number(),
  title: z.string(),
  description: z.string(),
  videoUrl: z.string(),
  duration: z.string(),
  difficulty: z.number().min(1).max(3),
  points: z.number().default(100),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
});

export const insertChallengeSchema = challengeSchema.omit({ 
  id: true, 
  createdAt: true 
});

export type Challenge = z.infer<typeof challengeSchema>;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;

// Submission Schema
export const submissionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  challengeId: z.string(),
  challengeDay: z.number(),
  type: z.enum(['video', 'photo', 'text', 'emoji']),
  content: z.string(), // URL for media, text for text/emoji
  isSuccess: z.boolean(),
  points: z.number(),
  groupId: z.string().optional(),
  reactions: z.array(z.object({
    userId: z.string(),
    type: z.enum(['heart', 'fire', 'clap'])
  })).default([]),
  comments: z.array(z.object({
    userId: z.string(),
    content: z.string(),
    createdAt: z.date()
  })).default([]),
  createdAt: z.date(),
});

export const insertSubmissionSchema = submissionSchema.omit({ 
  id: true, 
  createdAt: true,
  reactions: true,
  comments: true
});

export type Submission = z.infer<typeof submissionSchema>;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;

// Group Schema
export const groupSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  ownerId: z.string(),
  memberIds: z.array(z.string()).default([]),
  totalPoints: z.number().default(0),
  isPublic: z.boolean().default(false),
  inviteCode: z.string(),
  createdAt: z.date(),
});

export const insertGroupSchema = groupSchema.omit({ 
  id: true, 
  createdAt: true,
  inviteCode: true
});

export type Group = z.infer<typeof groupSchema>;
export type InsertGroup = z.infer<typeof insertGroupSchema>;

// Weekly Ranking Schema
export const weeklyRankingSchema = z.object({
  id: z.string(),
  userId: z.string(),
  groupId: z.string(),
  weekStart: z.date(),
  weeklyPoints: z.number().default(0),
  rank: z.number(),
  completedChallenges: z.number().default(0),
});

export type WeeklyRanking = z.infer<typeof weeklyRankingSchema>;

// Activity Feed Schema
export const activitySchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(['challenge_completed', 'streak_milestone', 'badge_earned', 'joined_group']),
  content: z.string(),
  relatedId: z.string().optional(), // challengeId, badgeId, etc.
  groupId: z.string().optional(),
  createdAt: z.date(),
});

export type Activity = z.infer<typeof activitySchema>;
