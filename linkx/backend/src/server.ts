import { serve } from "@hono/node-server";
import { app } from "./app.js";
import { env } from "./config/env.js";

serve({ fetch: app.fetch, port: env.port }, (info) => {
  console.log(`🚀 LinkX API listening on http://localhost:${info.port}`);
  console.log(`   Environment: ${env.nodeEnv}`);
  console.log(`   Allowed origin (CORS): ${env.frontendUrl}`);
});
