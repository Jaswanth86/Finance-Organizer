'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { groupTransactionsByCategory, formatCurrency, getCurrentMonth } from '@/lib/utils';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Define colors for pie chart slices
const COLORS = [
  '#4ade80', '#f87171', '#60a5fa', '#fbbf24', '#a78bfa', 
  '#fb923c', '#38bdf8', '#34d399', '#f472b6', '#a3e635'
];

export default function CategoryPieChart() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/transactions');
        
        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }
        
        const transactions = await response.json();
        
        // Filter to only include expenses from the current month
        const filteredTransactions = transactions.filter(t => {
          const transactionMonth = new Date(t.date).toISOString().substring(0, 7);
          return t.type === 'expense' && transactionMonth === currentMonth;
        });
        
        const grouped = groupTransactionsByCategory(filteredTransactions, 'expense');
        
        // Sort by amount (descending)
        const sortedData = grouped.sort((a, b) => b.amount - a.amount);
        
        setChartData(sortedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentMonth]);
  
  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="font-semibold">{payload[0].name}</p>
          <p>{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };
  
  if (loading) return <div className="text-center py-8">Loading chart data...</div>;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Breakdown by Category</CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : chartData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No expense data available for this month.
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                  nameKey="category"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}