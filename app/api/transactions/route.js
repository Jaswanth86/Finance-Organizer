// app/api/transactions/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Transaction, { transactionSchema } from '@/models/transaction';

export async function GET() {
  try {
    await dbConnect();
    const transactions = await Transaction.find({}).sort({ date: -1 });
    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch transactions', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    
    // Parse date string to Date object if it's not already
    if (typeof data.date === 'string') {
      data.date = new Date(data.date);
    }
    
    // Validate with Zod
    const validatedData = transactionSchema.parse(data);
    
    const transaction = await Transaction.create(validatedData);
    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    // Check if it's a Zod error
    if (error.errors) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create transaction', details: error.message },
      { status: 500 }
    );
  }
}