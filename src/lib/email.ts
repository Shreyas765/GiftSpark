import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

interface EmailError extends Error {
  code?: string;
  response?: unknown;
  responseCode?: number;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Email configuration error: Missing EMAIL_USER or EMAIL_PASS environment variables');
    throw new Error('Email configuration is incomplete');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    console.log('Attempting to send email to:', to);
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Detailed email error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      code: (error as EmailError)?.code,
      response: (error as EmailError)?.response,
      responseCode: (error as EmailError)?.responseCode,
    });
    throw error;
  }
} 