import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../auth/[...nextauth]/route';
import getBusinessModel from '@/models/User';
import { IEmployee } from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const Business = await getBusinessModel();
    const business = await Business.findOne({ email: session.user.email });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // Transform employees to match the frontend interface
    const employees = business.employees.map((emp: IEmployee & { _id?: any }) => ({
      id: emp._id?.toString() || crypto.randomUUID(),
      firstName: emp.name.split(' ')[0],
      lastName: emp.name.split(' ').slice(1).join(' '),
      email: emp.email,
      lastGift: null
    }));

    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { firstName, lastName, email } = await request.json();

    const Business = await getBusinessModel();
    const business = await Business.findOne({ email: session.user.email });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // Create new employee
    const newEmployee: IEmployee = {
      name: `${firstName} ${lastName}`,
      position: 'Not specified',
      department: 'Not specified',
      startDate: new Date()
    };

    // Only add email if it's provided
    if (email) {
      newEmployee.email = email;
    }

    business.employees.push(newEmployee);
    await business.save();

    // Get the newly added employee with its _id
    const addedEmployee = business.employees[business.employees.length - 1];

    // Return the transformed employee data
    return NextResponse.json({
      id: addedEmployee._id?.toString() || crypto.randomUUID(),
      firstName,
      lastName,
      email: addedEmployee.email || '',
      lastGift: null
    });
  } catch (error) {
    console.error('Error adding employee:', error);
    return NextResponse.json(
      { error: 'Failed to add employee' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { employeeId, firstName, lastName, email } = await request.json();

    const Business = await getBusinessModel();
    const business = await Business.findOne({ email: session.user.email });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    const employee = business.employees.id(employeeId);
    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    if (firstName || lastName) {
      employee.name = `${firstName || employee.name.split(' ')[0]} ${lastName || employee.name.split(' ').slice(1).join(' ')}`;
    }
    if (email) {
      employee.email = email;
    }

    await business.save();

    return NextResponse.json({
      id: (employee as any)._id?.toString() || employeeId,
      firstName: employee.name.split(' ')[0],
      lastName: employee.name.split(' ').slice(1).join(' '),
      email: employee.email,
      lastGift: null
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json(
      { error: 'Failed to update employee' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('id');

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const Business = await getBusinessModel();
    const business = await Business.findOne({ email: session.user.email });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // Remove the employee from the array
    business.employees = business.employees.filter((emp: IEmployee & { _id?: any }) => emp._id?.toString() !== employeeId);
    await business.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { error: 'Failed to delete employee' },
      { status: 500 }
    );
  }
} 