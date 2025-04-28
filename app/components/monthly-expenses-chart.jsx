'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { groupTransactionsByMonth, formatCurrency } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function MonthlyExpensesChart() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/transactions');
        
        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }
        
        const transactions = await response.json();
        const grouped = groupTransactionsByMonth(transactions);
        
        // Sort by month
        const sortedData = grouped.sort((a, b) => {
          return new Date(a.month) - new Date(b.month);
        });
        
        // Format month labels (e.g., 2023-01 to Jan 2023)
        const formattedData = sortedData.map(item => ({
          ...item,
          formattedMonth: format(new Date(item.month + '-01'), 'MMM yyyy')
        }));
        
        setChartData(formattedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) return <div className="text-center py-8">Loading chart data...</div>;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Income & Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : chartData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No transaction data available to display chart.
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="formattedMonth" />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value).replace('.00', '')}
                />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Bar name="Income" dataKey="income" fill="#4ade80" />
                <Bar name="Expenses" dataKey="expenses" fill="#f87171" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}