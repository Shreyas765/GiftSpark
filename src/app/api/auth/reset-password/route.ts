import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/email";

interface EmailError extends Error {
  code?: string;
  response?: unknown;
  responseCode?: number;
}

// Store reset codes temporarily (in production, use a proper cache like Redis)
const resetCodes = new Map<string, { code: string; expires: Date }>();

// Helper function to generate a random 6-digit code
function generateResetCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// API route for requesting password reset
export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return new Response(JSON.stringify({ error: "Email is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    console.log("Connecting to database...");
    await connectDB();
    
    console.log("Finding user...");
    const user = await User.findOne({ email });

    if (!user) {
      console.log("User not found:", email);
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    const code = generateResetCode();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15); // code expires in 15 mins

    console.log("Setting reset code for:", email);
    resetCodes.set(email, { code, expires });

    try {
      console.log("Sending email to:", email);
      await sendEmail({
        to: email,
        subject: "Password Reset Code",
        html: `
          <h1>GiftSpark - Password Reset</h1>
          <p>Hello ${user.name},</p>
          <p>Your password reset code is: <strong>${code}</strong></p>
          <p>This code will expire in 15 minutes.</p>
        `
      });
    } catch (emailError) {
      console.error("Failed to send email:", {
        error: emailError instanceof Error ? emailError.message : 'Unknown error',
        stack: emailError instanceof Error ? emailError.stack : undefined,
        code: (emailError as EmailError)?.code,
        response: (emailError as EmailError)?.response,
        responseCode: (emailError as EmailError)?.responseCode,
      });
      resetCodes.delete(email);
      throw new Error("Failed to send reset code email. Please try again later.");
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in password reset request:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Internal server error" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

// API route for resetting password with code
export async function PUT(request: Request) {
  const { email, code, newPassword } = await request.json();

  if (!email || !code || !newPassword) {
    return new Response(JSON.stringify({ error: "Email, code, and new password are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    console.log("Connecting to database...");
    await connectDB();
    
    const resetData = resetCodes.get(email);
    if (!resetData || resetData.code !== code) {
      console.log("Invalid or missing reset code for:", email);
      return new Response(JSON.stringify({ error: "Invalid or expired code" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (new Date() > resetData.expires) {
      console.log("Expired reset code for:", email);
      resetCodes.delete(email);
      return new Response(JSON.stringify({ error: "Code has expired" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    console.log("Updating password for:", email);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate(
      { email },
      { password: hashedPassword }
    );

    resetCodes.delete(email);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "Pragma": "no-cache"
      }
    });
  } catch (error) {
    console.error("Error in password reset:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Internal server error" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
} 