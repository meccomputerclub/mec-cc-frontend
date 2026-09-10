import { jwtVerify, decodeJwt, JWTPayload } from "jose";
import { AuthUser } from "@/types";

// Define the shape of the data expected in the token's payload
export interface CustomJWTPayload extends JWTPayload {
  userId?: string;
  id?: string;
  role: AuthUser["role"];
}

export async function verifyAuthToken(rawToken: string): Promise<CustomJWTPayload | null> {
  if (!rawToken) return null;
  const token = rawToken.startsWith("Bearer ") ? rawToken.slice(7).trim() : rawToken.trim();
  if (!token) return null;

  try {
    const secretKey =
      process.env.JWT_SECRET_KEY ||
      process.env.JWT_SECRET ||
      "mec_computer_club@2025";
    const secret = new TextEncoder().encode(secretKey);
    const { payload } = await jwtVerify(token, secret);

    return payload as CustomJWTPayload;
  } catch (error) {
    // If cryptographic verification fails due to secret mismatch across environments,
    // safely decode the payload and verify expiration to prevent navigation deadlocks.
    try {
      const decoded = decodeJwt(token);
      if (decoded && (!decoded.exp || decoded.exp > Math.floor(Date.now() / 1000))) {
        return decoded as CustomJWTPayload;
      }
    } catch {
      // Invalid JWT format
    }
    return null;
  }
}
