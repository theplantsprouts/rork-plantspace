import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

// app will be mounted at /api
const app = new Hono();

// Enable CORS for all routes with proper configuration
app.use("*", cors({
  origin: '*', // Allow all origins in development
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

// Handle preflight requests
app.options('*', (c) => {
  return c.text('', 200, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
    'Access-Control-Allow-Credentials': 'true',
  });
});

// Add request logging middleware
app.use("*", async (c, next) => {
  console.log(`${c.req.method} ${c.req.url}`);
  console.log('Headers:', Object.fromEntries(c.req.raw.headers.entries()));
  await next();
});

// Mount tRPC router at /trpc
app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/trpc",
    router: appRouter,
    createContext,
  })
);

// Simple health check endpoint
app.get("/", (c) => {
  console.log('Health check endpoint hit');
  return c.json({ 
    status: "ok", 
    message: "API is running", 
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    endpoints: {
      health: "/api",
      test: "/api/test",
      trpc: "/api/trpc"
    }
  });
});

// Test endpoint to verify tRPC is working
app.get("/test", (c) => {
  console.log('Test endpoint hit');
  return c.json({ 
    message: "Backend is working", 
    trpc: "available at /api/trpc",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Debug endpoint to check backend status
app.get("/debug", (c) => {
  console.log('Debug endpoint hit');
  return c.json({
    status: "Backend is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    routes: {
      health: "/api",
      test: "/api/test", 
      debug: "/api/debug",
      trpc: "/api/trpc"
    },
    cors: "enabled",
    headers: Object.fromEntries(c.req.raw.headers.entries())
  });
});

// Simple ping endpoint
app.get("/ping", (c) => {
  return c.text("pong");
});

export default app;