import { NextResponse } from 'next/server';
import { connectBusinessDB } from '@/lib/db';
import getBusinessModel from '@/models/User';

export async function POST(request: Request) {
  try {
    // Connect to MongoDB Business database
    const Business = await getBusinessModel();

    const { email, password } = await request.json();

    // Find business
    const business = await Business.findOne({ email });
    if (!business) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
    const isMatch = await business.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      id: business._id,
      email: business.email,
      companyName: business.companyName,
      industry: business.industry,
      size: business.size,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Error logging in' },
      { status: 500 }
    );
  }
} 