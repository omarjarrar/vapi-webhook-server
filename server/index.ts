import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import fs from "fs";
import { setupDirectVapiWebhook } from "./direct-vapi-webhook";
import { Pool } from '@neondatabase/serverless';

const app = express();

// Create database pool for direct webhook handler
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(process.cwd(), "public")));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);
  
  // Set up direct Vapi webhook handler with raw SQL queries
  setupDirectVapiWebhook(app, pool);
  
  // Legacy webhook endpoints for backward compatibility
  app.post("/vapi-webhook", express.json(), (req: Request, res: Response) => {
    console.log("🚨 Legacy Vapi webhook HIT - redirecting to direct handler");
    // Forward to our direct handler
    req.url = '/direct-vapi-webhook';
    app._router.handle(req, res);
  });
  
  app.get("/vapi-webhook", express.json(), (req: Request, res: Response) => {
    res.json({ 
      status: "ok", 
      message: "Vapi webhook endpoint is active", 
      directEndpoint: "/direct-vapi-webhook",
      timestamp: new Date().toISOString()
    });
  });

  app.get("/test", (req: Request, res: Response) => {
    res.send("Test route works!");
  });

  app.post("/hook", (req: Request, res: Response) => {
    console.log("SIMPLE HOOK ENDPOINT HIT");
    res.status(200).send("OK");
  });

  app.all("/raw-webhook", (req: Request, res: Response) => {
    console.log(`RAW WEBHOOK HIT - ${req.method}`);
    res.status(200).send("OK");
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  app.use((req, res) => {
    res.status(404).send("Not Found — from Express backend");
  });

  const port = 5000;
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    }
  );
})();
