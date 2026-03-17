import { defineConfig, env } from "prisma/config";
import path from "node:path";
import { config } from "dotenv";

// Load .env.local instead of .env
config({ path: path.resolve(process.cwd(), ".env.local") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
