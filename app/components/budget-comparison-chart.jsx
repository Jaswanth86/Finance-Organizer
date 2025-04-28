'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency, getCurrentMonth } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function BudgetComparisonChart() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch budgets for the current month
        const budgetsResponse = await fetch(`/api/budgets?month=${currentMonth}`);
        if (!budgetsResponse.ok) {
          throw new Error('Failed to fetch budgets');
        }
        const budgets = await budgetsResponse.json();
        
        // Fetch all transactions
        const transactionsResponse = await fetch('/api/transactions');
        if (!transactionsResponse.ok) {
          throw new Error('Failed to fetch transactions');
        }
        const transactions = await transactionsResponse.json();
        
        // Filter transactions for the current month and expenses only
        const monthlyExpenses = transactions.filter(t => {
          const transactionMonth = new Date(t.date).toISOString().substring(0, 7);
          return t.type === 'expense' && transactionMonth === currentMonth;
        });
        
        // Calculate actual expenses by category
        const actualExpensesByCategory = {};
        monthlyExpenses.forEach(transaction => {
          if (!actualExpensesByCategory[transaction.category]) {
            actualExpensesByCategory[transaction.category] = 0;
          }
          actualExpensesByCategory[transaction.category] += transaction.amount;
        });
        
        // Prepare data for the chart
        const data = budgets.map(budget => {
          const actual = actualExpensesByCategory[budget.category] || 0;
          const remaining = budget.amount - actual;
          const status = actual > budget.amount ? 'over' : 'under';
          
          return {
            category: budget.category,
            budgeted: budget.amount,
            actual: actual,
            remaining: remaining > 0 ? remaining : 0,
            overspent: remaining < 0 ? Math.abs(remaining) : 0,
            status
          };
        });
        
        setChartData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentMonth]);
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="font-semibold">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  if (loading) return <div className="text-center py-8">Loading chart data...</div>;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget vs. Actual Spending</CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : chartData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No budget data available for this month.
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis tickFormatter={(value) => formatCurrency(value).replace('.00', '')} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar name="Budgeted" dataKey="budgeted" fill="#60a5fa" />
                <Bar name="Actual" dataKey="actual" fill="#f87171" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {/* Spending Insights */}
        {chartData.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="font-semibold">Spending Insights:</h3>
            <ul className="list-disc pl-5 space-y-1">
              {chartData.filter(item => item.status === 'over').map(item => (
                <li key={item.category} className="text-red-600">
                  You've exceeded your {item.category} budget by {formatCurrency(item.overspent)}
                </li>
              ))}
              {chartData.filter(item => item.status === 'under').map(item => (
                <li key={item.category} className="text-green-600">
                  You're under budget for {item.category} by {formatCurrency(item.remaining)}
                </li>
              ))}
              {chartData.filter(item => item.status === 'over').length === 0 && (
                <li className="text-green-600">Great job! You're within all your budgets this month.</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}