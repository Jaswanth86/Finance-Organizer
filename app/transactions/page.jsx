"use client";

import { useState, useEffect } from 'react';
import TransactionList from '@/app/components/transaction-list';
import TransactionForm from '@/app/components/transaction-form';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { PlusIcon, SearchIcon, FilterIcon } from 'lucide-react';
import { Skeleton } from '@/app/components/ui/skeleton';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/app/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { cn } from "@/lib/utils";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    category: 'all',
    startDate: null,
    endDate: null,
  });
  const [editingTransaction, setEditingTransaction] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [transactionsRes, categoriesRes] = await Promise.all([
          fetch('/api/transactions'),
          fetch('/api/categories')
        ]);
        
        const transactionsData = await transactionsRes.json();
        const categoriesData = await categoriesRes.json();
        
        setTransactions(transactionsData);
        setCategories(categoriesData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  const handleAddTransaction = async (newTransaction) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTransaction),
      });
      
      if (response.ok) {
        const addedTransaction = await response.json();
        setTransactions([...transactions, addedTransaction]);
        setShowForm(false);
      } else {
        console.error('Failed to add transaction');
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const handleUpdateTransaction = async (updatedTransaction) => {
    try {
      const response = await fetch(`/api/transactions/${updatedTransaction._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTransaction),
      });
      
      if (response.ok) {
        const updated = await response.json();
        setTransactions(
          transactions.map((t) => (t._id === updated._id ? updated : t))
        );
        setEditingTransaction(null);
      } else {
        console.error('Failed to update transaction');
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setTransactions(transactions.filter((t) => t._id !== id));
      } else {
        console.error('Failed to delete transaction');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    // Text search filter
    const matchesSearch = transaction.description.toLowerCase().includes(filters.search.toLowerCase()) ||
                          transaction.category.toLowerCase().includes(filters.search.toLowerCase());
    
    // Type filter
    const matchesType = filters.type === 'all' || transaction.type === filters.type;
    
    // Category filter
    const matchesCategory = filters.category === 'all' || transaction.category === filters.category;
    
    // Date range filter
    const transactionDate = new Date(transaction.date);
    const afterStartDate = !filters.startDate || transactionDate >= filters.startDate;
    const beforeEndDate = !filters.endDate || transactionDate <= filters.endDate;
    
    return matchesSearch && matchesType && matchesCategory && afterStartDate && beforeEndDate;
  });

  if (loading) {
    return <TransactionsPageSkeleton />;
  }

  return (
    <main className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <Button onClick={() => setShowForm(true)}>
          <PlusIcon className="mr-2 h-4 w-4" /> Add Transaction
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex justify-between">
          <TabsList>
            <TabsTrigger value="all">All Transactions</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="expense">Expenses</TabsTrigger>
          </TabsList>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search transactions..."
                    className="pl-8"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type-filter">Type</Label>
                <Select
                  value={filters.type}
                  onValueChange={(value) => setFilters({ ...filters, type: value })}
                >
                  <SelectTrigger id="type-filter">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category-filter">Category</Label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => setFilters({ ...filters, category: value })}
                >
                  <SelectTrigger id="category-filter">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="flex space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.startDate ? format(filters.startDate, "PPP") : "Start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.startDate}
                        onSelect={(date) => setFilters({ ...filters, startDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.endDate ? format(filters.endDate, "PPP") : "End date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.endDate}
                        onSelect={(date) => setFilters({ ...filters, endDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <TabsContent value="all">
          <TransactionList 
            transactions={filteredTransactions}
            onEdit={setEditingTransaction}
            onDelete={handleDeleteTransaction}
          />
        </TabsContent>
        
        <TabsContent value="income">
          <TransactionList 
            transactions={filteredTransactions.filter(t => t.type === 'income')}
            onEdit={setEditingTransaction}
            onDelete={handleDeleteTransaction}
          />
        </TabsContent>
        
        <TabsContent value="expense">
          <TransactionList 
            transactions={filteredTransactions.filter(t => t.type === 'expense')}
            onEdit={setEditingTransaction}
            onDelete={handleDeleteTransaction}
          />
        </TabsContent>
      </Tabs>

      {showForm && (
        <TransactionForm
          onSubmit={handleAddTransaction}
          onCancel={() => setShowForm(false)}
          categories={categories}
        />
      )}

      {editingTransaction && (
        <TransactionForm
          transaction={editingTransaction}
          onSubmit={handleUpdateTransaction}
          onCancel={() => setEditingTransaction(null)}
          categories={categories}
          isEditing
        />
      )}
    </main>
  );
}

function TransactionsPageSkeleton() {
  return (
    <main className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-9 w-40" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    </main>
  );
}