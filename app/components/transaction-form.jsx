'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { expenseCategories, incomeCategories, formatDate } from '@/lib/utils';

// Form schema
const formSchema = z.object({
  amount: z.string().min(1, "Amount is required").transform(val => parseFloat(val)),
  date: z.string().min(1, "Date is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  type: z.enum(['income', 'expense']),
});

export default function TransactionForm({ transaction = null, onSuccess }) {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  
  // Initialize form with default values or transaction data
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: transaction ? {
      amount: transaction.amount.toString(),
      date: formatDate(transaction.date),
      description: transaction.description,
      category: transaction.category,
      type: transaction.type,
    } : {
      amount: '',
      date: formatDate(new Date()),
      description: '',
      category: '',
      type: 'expense',
    },
  });
  
  // Update categories based on transaction type
  useEffect(() => {
    const type = form.watch('type');
    setCategories(type === 'expense' ? expenseCategories : incomeCategories);
  }, [form.watch('type')]);
  
  async function onSubmit(data) {
    setError('');
    setIsSubmitting(true);
    
    try {
      const url = transaction 
        ? `/api/transactions/${transaction._id}` 
        : '/api/transactions';
      
      const method = transaction ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          amount: parseFloat(data.amount),
          date: new Date(data.date),
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong');
      }
      
      // Call the success callback
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset form if it's a new transaction
      if (!transaction) {
        form.reset({
          amount: '',
          date: formatDate(new Date()),
          description: '',
          category: '',
          type: 'expense',
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        {transaction ? 'Edit Transaction' : 'Add New Transaction'}
      </h2>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    min="0.01" 
                    placeholder="0.00" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="Enter description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : transaction ? 'Update Transaction' : 'Add Transaction'}
          </Button>
        </form>
      </Form>
    </div>
  );
}