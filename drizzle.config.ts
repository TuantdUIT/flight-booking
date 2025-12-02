import dotenv from "dotenv";
import type { Config } from "drizzle-kit";

dotenv.config({ path: ".env.local" });

const config: Config = {
    schema: "./src/infrastructure/db/schema.ts",
    out: "./src/infrastructure/db/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
}

export default config;