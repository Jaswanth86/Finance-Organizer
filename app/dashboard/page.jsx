"use client";

import { useState, useEffect } from 'react';
import SummaryCards from '@/app/components/summary-cards';
import MonthlyExpensesChart from '@/app/components/monthly-expenses-chart';
import CategoryPieChart from '@/app/components/category-pie-chart';
import BudgetComparisonChart from '@/app/components/budget-comparison-chart';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Skeleton } from "@/app/components/ui/skeleton";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch transactions and budgets in parallel
        const [transactionsResponse, budgetsResponse] = await Promise.all([
          fetch('/api/transactions'),
          fetch('/api/budgets')
        ]);

        const transactionsData = await transactionsResponse.json();
        const budgetsData = await budgetsResponse.json();

        setTransactions(transactionsData);
        setBudgets(budgetsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <main className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <SummaryCards />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Monthly Expenses</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <MonthlyExpensesChart transactions={transactions} />
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryPieChart transactions={transactions} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget vs. Actual Spending</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <BudgetComparisonChart 
                transactions={transactions} 
                budgets={budgets} 
              />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-2 md:col-span-2 lg:col-span-4">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {transactions
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 5)
                    .map((transaction) => (
                      <div key={transaction._id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-medium capitalize">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground capitalize">{transaction.category}</p>
                        </div>
                        <div className={`font-medium ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                          {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-2 md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle>Budget Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {budgets.map((budget) => {
                    // Calculate spending for this budget category
                    const spending = transactions
                      .filter(t => t.category === budget.category && t.type === 'expense')
                      .reduce((sum, t) => sum + t.amount, 0);
                    
                    // Calculate percentage spent
                    const percentSpent = (spending / budget.amount) * 100;
                    const isOverBudget = percentSpent > 100;

                    return (
                      <div key={budget._id}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium capitalize">{budget.category}</span>
                          <span className="text-sm font-medium">
                            ${spending.toFixed(2)} / ${budget.amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                          <div 
                            className={`h-2.5 rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-blue-500'}`}
                            style={{ width: `${Math.min(percentSpent, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}

function DashboardSkeleton() {
  return (
    <main className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}