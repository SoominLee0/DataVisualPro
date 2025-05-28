import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, sql } from "drizzle-orm";
import { users, challenges, submissions, groups, User, InsertUser, Challenge, InsertChallenge, Submission, InsertSubmission, Group, InsertGroup } from "@shared/schema";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<void>;
  
  // Challenge methods
  getChallenges(): Promise<Challenge[]>;
  getChallengeByDay(day: number): Promise<Challenge | undefined>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  
  // Submission methods
  getUserSubmissions(userId: number): Promise<Submission[]>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  getGroupSubmissions(groupId: number): Promise<Submission[]>;
  
  // Group methods
  createGroup(group: InsertGroup & { inviteCode: string }): Promise<Group>;
  getGroupByInviteCode(inviteCode: string): Promise<Group | undefined>;
  getUserGroups(userId: number): Promise<Group[]>;
  getGroupMembers(groupId: number): Promise<User[]>;
  addUserToGroup(groupId: number, userId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values({
      ...user,
      createdAt: new Date(),
      lastLoginAt: new Date()
    }).returning();
    return result[0];
  }

  async updateUser(id: number, updates: Partial<User>): Promise<void> {
    await db.update(users).set(updates).where(eq(users.id, id));
  }

  async getChallenges(): Promise<Challenge[]> {
    return await db.select().from(challenges).orderBy(challenges.day);
  }

  async getChallengeByDay(day: number): Promise<Challenge | undefined> {
    const result = await db.select().from(challenges).where(eq(challenges.day, day)).limit(1);
    return result[0];
  }

  async createChallenge(challenge: InsertChallenge): Promise<Challenge> {
    const result = await db.insert(challenges).values({
      ...challenge,
      createdAt: new Date()
    }).returning();
    return result[0];
  }

  async getUserSubmissions(userId: number): Promise<Submission[]> {
    return await db.select().from(submissions).where(eq(submissions.userId, userId)).orderBy(sql`${submissions.createdAt} DESC`);
  }

  async createSubmission(submission: InsertSubmission): Promise<Submission> {
    const result = await db.insert(submissions).values({
      ...submission,
      createdAt: new Date()
    }).returning();
    return result[0];
  }

  async getGroupSubmissions(groupId: number): Promise<Submission[]> {
    return await db.select().from(submissions).where(eq(submissions.groupId, groupId)).orderBy(sql`${submissions.createdAt} DESC`);
  }

  async createGroup(group: InsertGroup & { inviteCode: string }): Promise<Group> {
    const result = await db.insert(groups).values({
      ...group,
      createdAt: new Date()
    }).returning();
    return result[0];
  }

  async getGroupByInviteCode(inviteCode: string): Promise<Group | undefined> {
    const result = await db.select().from(groups).where(eq(groups.inviteCode, inviteCode)).limit(1);
    return result[0];
  }

  async getUserGroups(userId: number): Promise<Group[]> {
    return await db.select().from(groups).where(sql`${groups.memberIds} @> ${JSON.stringify([userId])}`);
  }

  async getGroupMembers(groupId: number): Promise<User[]> {
    const group = await db.select().from(groups).where(eq(groups.id, groupId)).limit(1);
    if (!group[0]) return [];
    
    const memberIds = group[0].memberIds as number[];
    if (!memberIds || memberIds.length === 0) return [];
    
    return await db.select().from(users).where(sql`${users.id} = ANY(${memberIds})`);
  }

  async addUserToGroup(groupId: number, userId: number): Promise<void> {
    await db.execute(sql`
      UPDATE ${groups} 
      SET ${groups.memberIds} = ${groups.memberIds} || ${JSON.stringify([userId])}
      WHERE ${groups.id} = ${groupId}
    `);
    
    await db.execute(sql`
      UPDATE ${users} 
      SET ${users.groupIds} = ${users.groupIds} || ${JSON.stringify([groupId])}
      WHERE ${users.id} = ${userId}
    `);
  }
}

export const storage = new DatabaseStorage();