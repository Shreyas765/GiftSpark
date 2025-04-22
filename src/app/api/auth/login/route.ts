import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    // Connect to MongoDB
    await connectDB();

    const { email, password } = await request.json();

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      id: user._id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Error logging in' },
      { status: 500 }
    );
  }
} 