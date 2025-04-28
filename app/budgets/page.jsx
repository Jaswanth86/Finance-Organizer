"use client";

import { useState, useEffect } from 'react';
import BudgetForm from '@/app/components/budget-form';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { PlusIcon, EditIcon, TrashIcon } from 'lucide-react';
import { Skeleton } from '@/app/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [budgetsRes, categoriesRes, transactionsRes] = await Promise.all([
          fetch('/api/budgets'),
          fetch('/api/categories'),
          fetch('/api/transactions')
        ]);
        
        const budgetsData = await budgetsRes.json();
        const categoriesData = await categoriesRes.json();
        const transactionsData = await transactionsRes.json();
        
        setBudgets(budgetsData);
        setCategories(categoriesData);
        setTransactions(transactionsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  const handleAddBudget = async (newBudget) => {
    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBudget),
      });
      
      if (response.ok) {
        const addedBudget = await response.json();
        setBudgets([...budgets, addedBudget]);
        setShowForm(false);
      } else {
        console.error('Failed to add budget');
      }
    } catch (error) {
      console.error('Error adding budget:', error);
    }
  };

  const handleUpdateBudget = async (updatedBudget) => {
    try {
      const response = await fetch(`/api/budgets/${updatedBudget._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedBudget),
      });
      
      if (response.ok) {
        const updated = await response.json();
        setBudgets(
          budgets.map((b) => (b._id === updated._id ? updated : b))
        );
        setEditingBudget(null);
      } else {
        console.error('Failed to update budget');
      }
    } catch (error) {
      console.error('Error updating budget:', error);
    }
  };

  const handleDeleteBudget = async (id) => {
    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setBudgets(budgets.filter((b) => b._id !== id));
      } else {
        console.error('Failed to delete budget');
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  // Get current month's transactions
  const getCurrentMonthTransactions = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return transactions.filter(transaction => {
      const date = new Date(transaction.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
  };

  // Calculate spending for each budget
  const calculateSpending = (category) => {
    const currentMonthTransactions = getCurrentMonthTransactions();
    
    return currentMonthTransactions
      .filter(t => t.category === category && t.type === 'expense')
      .reduce((total, t) => total + t.amount, 0);
  };

  if (loading) {
    return <BudgetsPageSkeleton />;
  }

  return (
    <main className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
        <Button onClick={() => setShowForm(true)}>
          <PlusIcon className="mr-2 h-4 w-4" /> Add Budget
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => {
          const spending = calculateSpending(budget.category);
          const remainingAmount = budget.amount - spending;
          const percentSpent = (spending / budget.amount) * 100;
          const isOverBudget = spending > budget.amount;
          
          return (
            <Card key={budget._id} className={isOverBudget ? 'border-red-500' : ''}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="capitalize">{budget.category}</CardTitle>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setEditingBudget(budget)}
                    >
                      <EditIcon className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteBudget(budget._id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {isOverBudget 
                    ? `Overspent by ${formatCurrency(Math.abs(remainingAmount))}`
                    : `${formatCurrency(remainingAmount)} remaining`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{percentSpent.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div 
                      className={`h-2.5 rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-blue-500'}`}
                      style={{ width: `${Math.min(percentSpent, 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="w-full flex justify-between text-sm">
                  <div>
                    <span className="text-muted-foreground">Spent: </span>
                    <span className={isOverBudget ? 'text-red-500 font-semibold' : ''}>{formatCurrency(spending)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Budget: </span>
                    <span>{formatCurrency(budget.amount)}</span>
                  </div>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {budgets.length === 0 && !showForm && (
        <Card className="border-dashed border-2">
          <CardHeader>
            <CardTitle className="text-center">No Budgets Found</CardTitle>
            <CardDescription className="text-center">
              Create your first budget to start tracking your spending.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => setShowForm(true)}>
              <PlusIcon className="mr-2 h-4 w-4" /> Add Budget
            </Button>
          </CardFooter>
        </Card>
      )}

      {showForm && (
        <BudgetForm
          onSubmit={handleAddBudget}
          onCancel={() => setShowForm(false)}
          categories={categories.filter(
            category => !budgets.some(budget => budget.category === category.name)
          )}
        />
      )}

      {editingBudget && (
        <BudgetForm
          budget={editingBudget}
          onSubmit={handleUpdateBudget}
          onCancel={() => setEditingBudget(null)}
          categories={categories}
          isEditing
        />
      )}
    </main>
  );
}

function BudgetsPageSkeleton() {
  return (
    <main className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-32" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-32" />
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-4 w-40 mt-1" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-2.5 w-full rounded-full" />
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
}