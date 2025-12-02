import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/db/client";
import { users } from "@/infrastructure/db/schema";

export async function getUserByEmail(email: string) {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user[0] || null;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}

export async function getUserById(id: number) {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user[0] || null;
  } catch (error) {
    console.error("Error fetching user by id:", error);
    return null;
  }
}

export async function createUser(data: { email: string; password?: string; name?: string }) {
  try {
    const newUser = await db.insert(users).values(data).returning();
    return newUser[0];
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Could not create user");
  }
}
