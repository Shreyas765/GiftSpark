import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectBusinessDB } from '../lib/db';

export interface IEmployee {
  name: string;
  email: string;
  position: string;
  department: string;
  salary?: number;
  startDate: Date;
  birthday?: Date;
}

export interface IBusiness extends Document {
  companyName: string;
  email: string;
  password: string;
  industry: string;
  size: string;
  employees: IEmployee[];
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const businessSchema = new Schema<IBusiness>({
  companyName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  industry: {
    type: String,
    required: true,
    trim: true,
  },
  size: {
    type: String,
    required: true,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
  },
  employees: [{
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    salary: {
      type: Number,
    },
    startDate: {
      type: Date,
      required: true,
    },
    birthday: {
      type: Date,
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Method to compare passwords
businessSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Hash password before saving
businessSchema.pre('save', async function(next) {
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Get the business database connection
const getBusinessModel = async () => {
  const businessConnection = await connectBusinessDB();
  return businessConnection.models.Business || businessConnection.model<IBusiness>('Business', businessSchema);
};

export default getBusinessModel; 