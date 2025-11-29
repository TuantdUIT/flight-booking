import type { Config } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config({ path: ".env.dev" });

const config: Config = {
    schema: "./src/infrastructure/db/schema.ts",
    out: "./src/infrastructure/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
}

export default config;