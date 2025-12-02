import bcrypt from "bcryptjs";
import { getUserByEmail, createUser } from "../repository/user.repo";
import { SignUpFormData } from "../validations/signup";

export interface AuthResult {
  success: boolean;
  user?: {
    id: number;
    email: string;
    name: string | null;
  };
  error?: string;
}

export async function verifyCredentials(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    // Get user from database
    const user = await getUserByEmail(email);
    
    if (!user) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    // Check if user has a password (for OAuth users)
    if (!user.password) {
      return {
        success: false,
        error: "Please sign in with your social account",
      };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    // Return successful result
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  } catch (error) {
    console.error("Error verifying credentials:", error);
    return {
      success: false,
      error: "An error occurred during authentication",
    };
  }
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function signup(data: SignUpFormData): Promise<AuthResult> {
  try {
    const existingUser = await getUserByEmail(data.email);

    if (existingUser) {
      return {
        success: false,
        error: "User with this email already exists",
      };
    }

    const hashedPassword = await hashPassword(data.password);
    const newUser = await createUser({
      email: data.email,
      password: hashedPassword,
    });

    return {
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    };
  } catch (error) {
    console.error("Error signing up:", error);
    return {
      success: false,
      error: "An error occurred during signup",
    };
  }
}
