// app/api/budgets/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Budget, { budgetSchema } from '@/models/budget';

export async function GET(request) {
  try {
    await dbConnect();
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month');
    
    let query = {};
    if (month) {
      query.month = month;
    }
    
    const budgets = await Budget.find(query);
    return NextResponse.json(budgets);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch budgets', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    
    // Validate with Zod
    const validatedData = budgetSchema.parse(data);
    
    // Use findOneAndUpdate with upsert to handle both create and update
    const budget = await Budget.findOneAndUpdate(
      { category: validatedData.category, month: validatedData.month },
      validatedData,
      { upsert: true, new: true, runValidators: true }
    );
    
    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    // Check if it's a Zod error
    if (error.errors) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create/update budget', details: error.message },
      { status: 500 }
    );
  }
}