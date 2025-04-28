"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { ArrowUpIcon, ArrowDownIcon, BarChart3, PieChart, Wallet } from "lucide-react";
import { formatCurrency } from '@/lib/utils';

export default function SummaryCards() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummaryData() {
      try {
        // Fetch transactions for summary calculations
        const response = await fetch('/api/transactions');
        const transactions = await response.json();
        
        // Calculate summary metrics
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        // Filter transactions for the current month
        const currentMonthTransactions = transactions.filter(transaction => {
          const transactionDate = new Date(transaction.date);
          return transactionDate.getMonth() === currentMonth && 
                 transactionDate.getFullYear() === currentYear;
        });
        
        // Calculate income and expenses for the current month
        const income = currentMonthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const expenses = currentMonthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        
        // Calculate balance
        const balance = income - expenses;
        
        // Calculate month-over-month changes
        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        
        const previousMonthTransactions = transactions.filter(transaction => {
          const transactionDate = new Date(transaction.date);
          return transactionDate.getMonth() === previousMonth && 
                 transactionDate.getFullYear() === previousYear;
        });
        
        const previousIncome = previousMonthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const previousExpenses = previousMonthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        
        // Calculate percentage changes
        const incomeChange = previousIncome === 0 ? 100 : ((income - previousIncome) / previousIncome) * 100;
        const expensesChange = previousExpenses === 0 ? 0 : ((expenses - previousExpenses) / previousExpenses) * 100;
        
        // Top spending category
        const categories = {};
        currentMonthTransactions
          .filter(t => t.type === 'expense')
          .forEach(t => {
            if (!categories[t.category]) {
              categories[t.category] = 0;
            }
            categories[t.category] += t.amount;
          });
        
        let topCategory = { name: 'None', amount: 0 };
        
        Object.keys(categories).forEach(category => {
          if (categories[category] > topCategory.amount) {
            topCategory = { name: category, amount: categories[category] };
          }
        });
        
        setData({
          income,
          expenses,
          balance,
          incomeChange,
          expensesChange,
          topCategory
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching summary data:', error);
        setLoading(false);
      }
    }
    
    fetchSummaryData();
  }, []);

  if (loading) {
    return <SummaryCardsSkeleton />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Monthly Income
          </CardTitle>
          <Wallet className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(data.income)}</div>
          <p className="text-xs text-muted-foreground flex items-center">
            {data.incomeChange > 0 ? (
              <>
                <ArrowUpIcon className="mr-1 h-4 w-4 text-green-500" />
                <span className="text-green-500">{Math.abs(data.incomeChange).toFixed(1)}% from last month</span>
              </>
            ) : (
              <>
                <ArrowDownIcon className="mr-1 h-4 w-4 text-red-500" />
                <span className="text-red-500">{Math.abs(data.incomeChange).toFixed(1)}% from last month</span>
              </>
            )}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Monthly Expenses
          </CardTitle>
          <BarChart3 className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(data.expenses)}</div>
          <p className="text-xs text-muted-foreground flex items-center">
            {data.expensesChange > 0 ? (
              <>
                <ArrowUpIcon className="mr-1 h-4 w-4 text-red-500" />
                <span className="text-red-500">{Math.abs(data.expensesChange).toFixed(1)}% from last month</span>
              </>
            ) : (
              <>
                <ArrowDownIcon className="mr-1 h-4 w-4 text-green-500" />
                <span className="text-green-500">{Math.abs(data.expensesChange).toFixed(1)}% from last month</span>
              </>
            )}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Monthly Balance
          </CardTitle>
          <PieChart className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${data.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatCurrency(data.balance)}
          </div>
          <p className="text-xs text-muted-foreground">
            {data.balance >= 0 ? 'Savings this month' : 'Deficit this month'}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Top Spending Category
          </CardTitle>
          <BarChart3 className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold capitalize">{data.topCategory.name}</div>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(data.topCategory.amount)} spent this month
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}