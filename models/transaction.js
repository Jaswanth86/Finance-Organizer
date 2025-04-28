// models/transaction.js
import mongoose from 'mongoose';
import { z } from 'zod';

// Zod schema for validation
export const transactionSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  date: z.date(),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  type: z.enum(['income', 'expense']),
});

// Mongoose schema for MongoDB
const TransactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0'],
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: [true, 'Transaction type is required'],
  },
}, {
  timestamps: true,
});

// Check if the model is already defined to avoid overwriting during hot reloads
export default mongoose.models.Transaction || 
  mongoose.model('Transaction', TransactionSchema);