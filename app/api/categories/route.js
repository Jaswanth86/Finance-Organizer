// app/api/categories/route.js
import { NextResponse } from 'next/server';
import { expenseCategories, incomeCategories } from '@/lib/utils';
import { z } from 'zod';

// We'll use in-memory categories for this demo, but in a real-world app,
// you would store these in the database

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'all';
    
    let categories;
    if (type === 'expense') {
      categories = expenseCategories;
    } else if (type === 'income') {
      categories = incomeCategories;
    } else {
      categories = {
        expense: expenseCategories,
        income: incomeCategories
      };
    }
    
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch categories', details: error.message },
      { status: 500 }
    );
  }
}

// Validation schema for new categories
const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  type: z.enum(['expense', 'income']),
});

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Validate with Zod
    const validatedData = categorySchema.parse(data);
    
    // In a real app, we would store this in the database
    // For this demo, we'll just return success
    
    return NextResponse.json(
      { message: 'Category added successfully', category: validatedData.name },
      { status: 201 }
    );
  } catch (error) {
    // Check if it's a Zod error
    if (error.errors) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create category', details: error.message },
      { status: 500 }
    );
  }
}