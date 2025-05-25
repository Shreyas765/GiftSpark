import { NextResponse } from 'next/server';
import getBusinessModel from '@/models/User';

export async function POST(request: Request) {
  try {
    console.log('Starting business registration process...');
    
    const body = await request.json();
    console.log('Received registration data:', { 
      email: body.email,
      companyName: body.companyName,
      industry: body.industry,
      size: body.size,
      hasPassword: !!body.password 
    });

    const Business = await getBusinessModel();
    console.log('Successfully connected to Business MongoDB');

    // Check if business already exists
    const existingBusiness = await Business.findOne({ email: body.email });
    if (existingBusiness) {
      console.log('Business already exists:', body.email);
      return NextResponse.json(
        { error: 'Business account already exists' },
        { status: 400 }
      );
    }

    // Create new business - password will be hashed by Business model's pre-save hook
    const business = new Business({
      email: body.email,
      companyName: body.companyName,
      industry: body.industry,
      size: body.size,
      password: body.password,
      employees: [],
    });

    console.log('Attempting to save business to database...');
    await business.save();
    console.log('Business saved successfully:', business.email);

    return NextResponse.json(
      { 
        message: 'Business account created successfully',
        business: {
          id: business._id,
          email: business.email,
          companyName: business.companyName,
          industry: business.industry,
          size: business.size,
        }
      },
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
      { error: 'Failed to create business account' },
      { status: 500 }
    );
  }
} 