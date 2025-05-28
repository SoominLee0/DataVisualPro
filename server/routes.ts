import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // This is a Firebase-based app, so most API functionality
  // is handled client-side through Firebase SDK.
  // We can add any necessary server-side routes here if needed.
  
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API route for any additional server-side functionality
  app.get("/api/status", (req, res) => {
    res.json({ 
      message: "Challenge App API is running",
      version: "1.0.0"
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
