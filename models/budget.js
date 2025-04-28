// models/budget.js
import mongoose from 'mongoose';
import { z } from 'zod';

// Zod schema for validation
export const budgetSchema = z.object({
  category: z.string().min(1, "Category is required"),
  amount: z.number().min(0, "Budget amount must be non-negative"),
  month: z.string().min(1, "Month is required"), // Format: YYYY-MM
});

// Mongoose schema for MongoDB
const BudgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be non-negative'],
  },
  month: {
    type: String,
    required: [true, 'Month is required'],
    // Regex to validate YYYY-MM format
    match: [/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'],
  },
}, {
  timestamps: true,
});

// Create a compound index to ensure one budget per category per month
BudgetSchema.index({ category: 1, month: 1 }, { unique: true });

// Check if the model is already defined to avoid overwriting during hot reloads
export default mongoose.models.Budget || 
  mongoose.model('Budget', BudgetSchema);