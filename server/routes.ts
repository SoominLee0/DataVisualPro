import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertChallengeSchema, insertSubmissionSchema, insertGroupSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Initialize challenges if not exists
  app.post("/api/init", async (req, res) => {
    try {
      const existingChallenges = await storage.getChallenges();
      if (existingChallenges.length === 0) {
        const challengesData = [
          {
            day: 1,
            title: "10초 플랭크 챌린지",
            description: "코어 근육을 강화하는 기본 플랭크 자세를 10초간 유지해보세요.",
            videoUrl: "https://www.youtube.com/embed/MHcmC5QeIN8",
            duration: "1분",
            difficulty: 1,
            points: 100,
            isActive: true
          },
          {
            day: 2,
            title: "20회 스쿼트 챌린지",
            description: "하체 근력을 기르는 스쿼트 20회를 완료해보세요.",
            videoUrl: "https://www.youtube.com/embed/GbqgaOhIizc",
            duration: "3분",
            difficulty: 2,
            points: 150,
            isActive: true
          },
          {
            day: 3,
            title: "30초 점프잭",
            description: "전신 유산소 운동인 점프잭을 30초간 실시해보세요.",
            videoUrl: "https://www.youtube.com/embed/3iN33mGIdts",
            duration: "2분",
            difficulty: 1,
            points: 120,
            isActive: true
          }
        ];

        for (const challenge of challengesData) {
          await storage.createChallenge(challenge);
        }
      }
      res.json({ message: "Database initialized successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to initialize database" });
    }
  });

  // User endpoints
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  app.get("/api/users/email/:email", async (req, res) => {
    try {
      const user = await storage.getUserByEmail(req.params.email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      await storage.updateUser(parseInt(req.params.id), req.body);
      res.json({ message: "User updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Challenge endpoints
  app.get("/api/challenges", async (req, res) => {
    try {
      const challenges = await storage.getChallenges();
      res.json(challenges);
    } catch (error) {
      res.status(500).json({ error: "Failed to get challenges" });
    }
  });

  app.get("/api/challenges/day/:day", async (req, res) => {
    try {
      const challenge = await storage.getChallengeByDay(parseInt(req.params.day));
      if (!challenge) {
        return res.status(404).json({ error: "Challenge not found" });
      }
      res.json(challenge);
    } catch (error) {
      res.status(500).json({ error: "Failed to get challenge" });
    }
  });

  // Submission endpoints
  app.get("/api/users/:userId/submissions", async (req, res) => {
    try {
      const submissions = await storage.getUserSubmissions(parseInt(req.params.userId));
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ error: "Failed to get submissions" });
    }
  });

  app.post("/api/submissions", async (req, res) => {
    try {
      const submissionData = insertSubmissionSchema.parse(req.body);
      const submission = await storage.createSubmission(submissionData);
      
      // Update user stats
      const user = await storage.getUser(submission.userId);
      if (user) {
        const updates: any = {
          totalChallenges: (user.totalChallenges || 0) + 1,
          totalPoints: (user.totalPoints || 0) + submission.points,
        };

        if (submission.isSuccess) {
          updates.currentStreak = (user.currentStreak || 0) + 1;
          updates.longestStreak = Math.max(user.longestStreak || 0, updates.currentStreak);
        } else {
          updates.currentStreak = 0;
        }

        updates.successRate = Math.round((updates.totalPoints / (updates.totalChallenges * 100)) * 100);
        await storage.updateUser(submission.userId, updates);
      }
      
      res.json(submission);
    } catch (error) {
      res.status(400).json({ error: "Invalid submission data" });
    }
  });

  // Group endpoints
  app.post("/api/groups", async (req, res) => {
    try {
      const groupData = insertGroupSchema.parse(req.body);
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const group = await storage.createGroup({ ...groupData, inviteCode });
      
      // Add creator to group
      await storage.addUserToGroup(group.id, group.ownerId);
      
      res.json(group);
    } catch (error) {
      res.status(400).json({ error: "Invalid group data" });
    }
  });

  app.post("/api/groups/join", async (req, res) => {
    try {
      const { inviteCode, userId } = req.body;
      const group = await storage.getGroupByInviteCode(inviteCode);
      
      if (!group) {
        return res.status(404).json({ error: "Invalid invite code" });
      }
      
      await storage.addUserToGroup(group.id, userId);
      res.json({ message: "Successfully joined group" });
    } catch (error) {
      res.status(500).json({ error: "Failed to join group" });
    }
  });

  app.get("/api/users/:userId/groups", async (req, res) => {
    try {
      const groups = await storage.getUserGroups(parseInt(req.params.userId));
      res.json(groups);
    } catch (error) {
      res.status(500).json({ error: "Failed to get user groups" });
    }
  });

  app.get("/api/groups/:groupId/members", async (req, res) => {
    try {
      const members = await storage.getGroupMembers(parseInt(req.params.groupId));
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: "Failed to get group members" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
