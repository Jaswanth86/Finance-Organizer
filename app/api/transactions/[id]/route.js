// app/api/transactions/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Transaction, { transactionSchema } from '@/models/transaction';

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const data = await request.json();
    
    // Parse date string to Date object if it's not already
    if (typeof data.date === 'string') {
      data.date = new Date(data.date);
    }
    
    // Validate with Zod
    const validatedData = transactionSchema.parse(data);
    
    const transaction = await Transaction.findByIdAndUpdate(
      id,
      validatedData,
      { new: true, runValidators: true }
    );
    
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(transaction);
  } catch (error) {
    // Check if it's a Zod error
    if (error.errors) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update transaction', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    
    const transaction = await Transaction.findByIdAndDelete(id);
    
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete transaction', details: error.message },
      { status: 500 }
    );
  }
}