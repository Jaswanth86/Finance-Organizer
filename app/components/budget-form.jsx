'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { expenseCategories, getCurrentMonth } from '@/lib/utils';

// Form schema
const formSchema = z.object({
  category: z.string().min(1, "Category is required"),
  amount: z.string().min(1, "Amount is required").transform(val => parseFloat(val)),
  month: z.string().min(1, "Month is required"),
});

export default function BudgetForm({ budget = null, onSuccess }) {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [availableMonths, setAvailableMonths] = useState([]);
  
  // Generate available months (current month and next 3 months)
  useEffect(() => {
    const months = [];
    const now = new Date();
    
    for (let i = 0; i < 4; i++) {
      const month = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthString = format(month, 'yyyy-MM');
      const monthLabel = format(month, 'MMMM yyyy');
      months.push({ value: monthString, label: monthLabel });
    }
    
    setAvailableMonths(months);
  }, []);
  
  // Initialize form with default values or budget data
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: budget ? {
      category: budget.category,
      amount: budget.amount.toString(),
      month: budget.month,
    } : {
      category: '',
      amount: '',
      month: currentMonth,
    },
  });
  
  async function onSubmit(data) {
    setError('');
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: data.category,
          amount: parseFloat(data.amount),
          month: data.month,
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
      
      // Reset form if it's a new budget
      if (!budget) {
        form.reset({
          category: '',
          amount: '',
          month: currentMonth,
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
        {budget ? 'Edit Budget' : 'Set Category Budget'}
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
            name="month"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Month</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableMonths.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    {expenseCategories.map((category) => (
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
          
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget Amount</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    placeholder="0.00" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : budget ? 'Update Budget' : 'Set Budget'}
          </Button>
        </form>
      </Form>
    </div>
  );
}