import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    console.log('Starting registration process...');
    
    const body = await request.json();
    console.log('Received registration data:', { 
      email: body.email,
      name: body.name,
      hasPassword: !!body.password 
    });

    await connectDB();
    console.log('Successfully connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      console.log('User already exists:', body.email);
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Create new user - password will be hashed by User model's pre-save hook
    const user = new User({
      email: body.email,
      name: body.name,
      password: body.password,
    });

    console.log('Attempting to save user to database...');
    await user.save();
    console.log('User saved successfully:', user.email);

    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 