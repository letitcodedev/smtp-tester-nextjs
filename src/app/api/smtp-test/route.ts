import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

interface SMTPTestRequest {
  host: string;
  port: number;
  secure: boolean; // true for SSL/TLS on connect (port 465), false for STARTTLS (ports 25, 587)
  username: string;
  password: string;
  senderName?: string; // Optional display name for "From" field
  senderEmail?: string; // Optional "From" address, defaults to username
  testRecipient?: string;
}

interface SMTPTestResponse {
  success: boolean;
  message: string;
  details?: {
    connected: boolean;
    authenticated: boolean;
    testEmailSent?: boolean;
  };
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<SMTPTestResponse>> {
  try {
    const body: SMTPTestRequest = await request.json();
    const { host, port, secure, username, password, senderName, senderEmail, testRecipient } = body;

    // Validate required fields
    if (!host || !port || !username || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
          error: "Please provide host, port, username, and password",
        },
        { status: 400 }
      );
    }

    // Create transporter with provided settings
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure, // true for 465, false for other ports (will use STARTTLS if available)
      auth: {
        user: username,
        pass: password,
      },
      // Connection timeout
      connectionTimeout: 10000,
      // Socket timeout
      socketTimeout: 10000,
    });

    // Step 1: Verify connection and authentication
    try {
      await transporter.verify();
    } catch (verifyError) {
      const errorMessage = verifyError instanceof Error ? verifyError.message : "Unknown error";
      return NextResponse.json(
        {
          success: false,
          message: "Connection or authentication failed",
          details: {
            connected: false,
            authenticated: false,
          },
          error: errorMessage,
        },
        { status: 400 }
      );
    }

    // Step 2: Optionally send a test email
    if (testRecipient) {
      try {
        const fromEmail = senderEmail || username;
        const fromAddress = senderName ? `"${senderName}" <${fromEmail}>` : fromEmail;

        await transporter.sendMail({
          from: fromAddress,
          to: testRecipient,
          subject: "SMTP Test - Connection Successful",
          text: "This is a test email to verify your SMTP configuration is working correctly.",
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2 style="color: #22c55e;">SMTP Test Successful!</h2>
              <p>This is a test email to verify your SMTP configuration is working correctly.</p>
              <p style="color: #666; font-size: 12px; margin-top: 20px;">
                Sent at: ${new Date().toISOString()}
              </p>
            </div>
          `,
        });

        return NextResponse.json({
          success: true,
          message: "Connected, authenticated, and test email sent successfully!",
          details: {
            connected: true,
            authenticated: true,
            testEmailSent: true,
          },
        });
      } catch (sendError) {
        const errorMessage = sendError instanceof Error ? sendError.message : "Unknown error";
        return NextResponse.json(
          {
            success: false,
            message: "Connected and authenticated, but failed to send test email",
            details: {
              connected: true,
              authenticated: true,
              testEmailSent: false,
            },
            error: errorMessage,
          },
          { status: 400 }
        );
      }
    }

    // No test recipient provided, just verify connection
    return NextResponse.json({
      success: true,
      message: "Connected and authenticated successfully!",
      details: {
        connected: true,
        authenticated: true,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
