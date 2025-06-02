'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Menu, X, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Chart, Pie } from 'react-chartjs-2';
import AdmSidebar from '@/components/admSidebar';
import Header from '@/components/NavBar';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

interface Order {
  id: string;
  user_id: string;
  plan_id: string;
  transaction_id: string;
  subscription_id: string;
  crypto_address: string;
  status: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  auto_renew: boolean;
  next_billing_date: string;
  created_at: string;
}

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  payment_method_id: string;
  provider_subscription_id: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string;
  created_at: string;
  updated_at: string;
}

interface SurveyResponse {
  id: string;
  user_id: string;
  anonymous_user_id: string;
  satisfaction: number;
  completed: boolean;
  issue: string;
  suggestion: string;
  nps: number;
  metadata: any;
  created_at: string;
}

interface Transaction {
  id: string;
  user_id: string;
  plan_id: string;
  subscription_id: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  payment_method_id: string;
  payment_provider_reference: string;
  metadata: any;
  created_at: string;
}

interface User {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  stripe_customer_id: string;
  btc_address: string;
  created_at: string;
}

export default function DashboardHome() {
  const [activeSection, setActiveSection] = useState('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponse[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [surveyGranularity, setSurveyGranularity] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const fetchData = async (section: string) => {
    setLoading(true);
    try {
      const apiSection = section === 'subscriptions' ? 'subscription' :
                        section === 'transactions' ? 'transaction' :
                        section === 'users' ? 'user' : section;
      const response = await fetch(`/api/adm/${apiSection}`);
      const data = await response.json();
      if (section === 'orders') setOrders(data);
      if (section === 'subscriptions') setSubscriptions(data);
      if (section === 'survey-responses') setSurveyResponses(data);
      if (section === 'transactions') setTransactions(data);
      if (section === 'users') setUsers(data);
    } catch (error) {
      console.error(`Error fetching ${section}:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeSection);
  }, [activeSection]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Export table data to CSV
  const exportToCSV = (section: string) => {
    let data: any[] = [];
    let headers: string[] = [];
    let filename: string = '';

    switch (section) {
      case 'orders':
        headers = ['ID', 'User ID', 'Plan ID', 'Status', 'Start Date', 'End Date', 'Active', 'Created At'];
        data = orders.map(o => ({
          id: o.id,
          user_id: o.user_id,
          plan_id: o.plan_id,
          status: o.status,
          start_date: new Date(o.start_date).toLocaleDateString(),
          end_date: new Date(o.end_date).toLocaleDateString(),
          is_active: o.is_active ? 'Yes' : 'No',
          created_at: new Date(o.created_at).toLocaleDateString(),
        }));
        filename = 'orders.csv';
        break;
      case 'subscriptions':
        headers = ['ID', 'User ID', 'Plan ID', 'Status', 'Period Start', 'Period End', 'Created At'];
        data = subscriptions.map(s => ({
          id: s.id,
          user_id: s.user_id,
          plan_id: s.plan_id,
          status: s.status,
          current_period_start: new Date(s.current_period_start).toLocaleDateString(),
          current_period_end: new Date(s.current_period_end).toLocaleDateString(),
          created_at: new Date(s.created_at).toLocaleDateString(),
        }));
        filename = 'subscriptions.csv';
        break;
      case 'survey-responses':
        headers = ['ID', 'User ID', 'Satisfaction', 'NPS', 'Issue', 'Created At'];
        data = surveyResponses.map(r => ({
          id: r.id,
          user_id: r.user_id || r.anonymous_user_id,
          satisfaction: r.satisfaction,
          nps: r.nps,
          issue: r.issue,
          created_at: new Date(r.created_at).toLocaleDateString(),
        }));
        filename = 'survey-responses.csv';
        break;
      case 'transactions':
        headers = ['ID', 'User ID', 'Amount', 'Currency', 'Status', 'Description', 'Created At'];
        data = transactions.map(t => ({
          id: t.id,
          user_id: t.user_id,
          amount: t.amount,
          currency: t.currency,
          status: t.status,
          description: t.description,
          created_at: new Date(t.created_at).toLocaleDateString(),
        }));
        filename = 'transactions.csv';
        break;
      case 'users':
        headers = ['ID', 'Full Name', 'Email', 'Stripe Customer ID', 'BTC Address', 'Created At'];
        data = users.map(u => ({
          id: u.id,
          full_name: u.full_name,
          email: u.email,
          stripe_customer_id: u.stripe_customer_id,
          btc_address: u.btc_address,
          created_at: new Date(u.created_at).toLocaleDateString(),
        }));
        filename = 'users.csv';
        break;
    }

    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header.toLowerCase().replace(/\s/g, '_')] || ''}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Analytics: Orders
  const getOrderAnalytics = () => {
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const activeSubscriptions = orders.filter(o => o.is_active).length;
    const orderTrend = orders.reduce((acc, o) => {
      const date = new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const trendLabels = Object.keys(orderTrend).slice(-7);
    const trendData = trendLabels.map(label => orderTrend[label]);

    return { totalOrders, completedOrders, activeSubscriptions, trendLabels, trendData };
  };

  // Analytics: Subscriptions
  const getSubscriptionAnalytics = () => {
    const activeSubs = subscriptions.filter(s => s.status === 'active').length;
    const canceledSubs = subscriptions.filter(s => s.canceled_at).length;
    const churnRate = subscriptions.length ? (canceledSubs / subscriptions.length * 100).toFixed(1) : '0.0';
    const statusCounts = subscriptions.reduce((acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { activeSubs, canceledSubs, churnRate, statusCounts };
  };

  // Analytics: Transactions
  const getTransactionAnalytics = () => {
    const totalRevenue = transactions.reduce((sum, t) => sum + (t.status === 'succeeded' ? t.amount : 0), 0);
    const successfulTx = transactions.filter(t => t.status === 'succeeded').length;
    const txTrend = transactions.reduce((acc, t) => {
      const date = new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      acc[date] = (acc[date] || 0) + (t.status === 'succeeded' ? t.amount : 0);
      return acc;
    }, {} as Record<string, number>);
    const trendLabels = Object.keys(txTrend).slice(-7);
    const trendData = trendLabels.map(label => txTrend[label]);

    return { totalRevenue, successfulTx, trendLabels, trendData };
  };

  // Analytics: Users
  const getUserAnalytics = () => {
    const totalUsers = users.length;
    const newUsers = users.filter(u => new Date(u.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length;
    const userTrend = users.reduce((acc, u) => {
      const date = new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const trendLabels = Object.keys(userTrend).slice(-7);
    const trendData = trendLabels.map(label => userTrend[label]);

    return { totalUsers, newUsers, trendLabels, trendData };
  };

  // Survey Chart Data
  const getSurveyChartData = () => {
    const groupedData = surveyResponses.reduce((acc, response) => {
      let date: string;
      if (surveyGranularity === 'monthly') {
        date = new Date(response.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      } else if (surveyGranularity === 'weekly') {
        const d = new Date(response.created_at);
        const weekStart = new Date(d.setDate(d.getDate() - d.getDay()));
        date = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        date = new Date(response.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      if (!acc[date]) {
        acc[date] = { count: 0, npsSum: 0, npsCount: 0 };
      }
      acc[date].count += 1;
      acc[date].npsSum += response.nps;
      acc[date].npsCount += 1;
      return acc;
    }, {} as Record<string, { count: number; npsSum: number; npsCount: number }>);

    const labels = Object.keys(groupedData).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const counts = labels.map(date => groupedData[date].count);
    const npsAverages = labels.map(date => groupedData[date].npsSum / groupedData[date].npsCount);

    return {
      labels,
      datasets: [
        {
          type: 'bar' as const,
          label: 'Response Count',
          data: counts,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
          yAxisID: 'y',
        },
        {
          type: 'line' as const,
          label: 'NPS Average',
          data: npsAverages,
          borderColor: 'rgba(255, 255, 255, 0.8)',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y1',
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#E4E4E7',
          font: { size: 14 },
        },
      },
      title: {
        display: true,
        text: 'Survey Responses and NPS Trends',
        color: '#E4E4E7',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(39, 39, 42, 0.9)',
        titleColor: '#E4E4E7',
        bodyColor: '#E4E4E7',
        borderColor: '#3B82F6',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#D4D4D8' },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: { display: true, text: 'Response Count', color: '#E4E4E7' },
        grid: { color: 'rgba(63, 63, 70, 0.3)' },
        ticks: { color: '#D4D4D8' },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: { display: true, text: 'NPS Average', color: '#E4E4E7' },
        grid: { drawOnChartArea: false },
        ticks: { color: '#D4D4D8' },
      },
    },
  };

  const renderTable = () => {
    switch (activeSection) {
      case 'orders':
        const orderAnalytics = getOrderAnalytics();
        return (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <Card className="bg-zinc-900/80 backdrop-blur-md border-zinc-800 shadow-lg shadow-blue-500/10">
                <CardHeader>
                  <CardTitle className="text-lg font-bold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">Total Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl text-blue-400">{orderAnalytics.totalOrders}</p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/80 backdrop-blur-md border-zinc-800 shadow-lg shadow-blue-500/10">
                <CardHeader>
                  <CardTitle className="text-lg font-bold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">Completed Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl text-blue-400">{orderAnalytics.completedOrders}</p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/80 backdrop-blur-md border-zinc-800 shadow-lg shadow-blue-500/10">
                <CardHeader>
                  <CardTitle className="text-lg font-bold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">Order Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <Chart
                    type="line"
                    data={{
                      labels: orderAnalytics.trendLabels,
                      datasets: [{
                        label: 'Orders',
                        data: orderAnalytics.trendData,
                        borderColor: 'rgba(59, 130, 246, 1)',
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        fill: true,
                        tension: 0.4,
                      }],
                    }}
                    options={{
                      responsive: true,
                      plugins: { legend: { display: false } },
                      scales: { x: { display: false }, y: { display: false } },
                    }}
                    height={50}
                  />
                </CardContent>
              </Card>
            </motion.div>
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => exportToCSV('orders')}
                className="bg-gradient-to-r from-zinc-800 to-zinc-900 text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 transition-all duration-300 shadow-md shadow-blue-500/20"
              >
                <Download className="mr-2 h-4 w-4" /> Export to CSV
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-zinc-800 to-zinc-900 border-b border-zinc-700 hover:bg-zinc-700/50 transition-colors">
                  <TableHead className="font-semibold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">ID</TableHead>
                  <TableHead className="font-semibold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">User ID</TableHead>
                  <TableHead className="font-semibold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">Plan ID</TableHead>
                  <TableHead className="font-semibold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">Status</TableHead>
                  <TableHead className="font-semibold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">Start Date</TableHead>
                  <TableHead className="font-semibold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">End Date</TableHead>
                  <TableHead className="font-semibold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">Active</TableHead>
                  <TableHead className="font-semibold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                    <TableCell className="text-zinc-200">{order.id}</TableCell>
                    <TableCell className="text-zinc-200">{order.user_id}</TableCell>
                    <TableCell className="text-zinc-200">{order.plan_id}</TableCell>
                    <TableCell>
                      <Badge
                        variant={order.status === 'completed' ? 'default' : 'secondary'}
                        className={order.status === 'completed' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' : 'bg-zinc-600 text-zinc-200'}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-200">{new Date(order.start_date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-zinc-200">{new Date(order.end_date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-zinc-200">{order.is_active ? 'Yes' : 'No'}</TableCell>
                    <TableCell className="text-zinc-200">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        );
      case 'subscriptions':
        const subAnalytics = getSubscriptionAnalytics();
        return (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <Card className="bg-zinc-900/80 backdrop-blur-md border-zinc-800 shadow-lg shadow-blue-500/10">
                <CardHeader>
                  <CardTitle className="text-lg font-bold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">Active Subscriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl text-blue-400">{subAnalytics.activeSubs}</p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/80 backdrop-blur-md border-zinc-800 shadow-lg shadow-blue-500/10">
                <CardHeader>
                  <CardTitle className="text-lg font-bold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">Churn Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl text-blue-400">{subAnalytics.churnRate}%</p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/80 backdrop-blur-md border-zinc-800 shadow-lg shadow-blue-500/10">
                <CardHeader>
                  <CardTitle className="text-lg font-bold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <Pie
                    data={{
                      labels: Object.keys(subAnalytics.statusCounts),
                      datasets: [{
                        data: Object.values(subAnalytics.statusCounts),
                        backgroundColor: ['rgba(59, 130, 246, 0.5)', 'rgba(255, 99, 132, 0.5)', 'rgba(255, 255, 255, 0.2)'],
                        borderColor: ['rgba(59, 130, 246, 1)', 'rgba(255, 99, 132, 1)', 'rgba(255, 255, 255, 0.8)'],
                        borderWidth: 1,
                      }],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'bottom' as const, labels: { color: '#E4E4E7' } },
                      },
                    }}
                  />
                </CardContent>
              </Card>
            </motion.div>
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => exportToCSV('subscriptions')}
                className="bg-gradient-to-r from-zinc-800 to-zinc-900 text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 transition-all duration-300 shadow-md shadow-blue-500/20"
              >
                <Download className="mr-2 h-4 w-4" /> Export to CSV
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-zinc-800 to-zinc-900 border-b border-zinc-700 hover:bg-zinc-700/50 transition-colors">
                  <TableHead className="font-semibold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">ID</TableHead>
                  <TableHead className="font-semibold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">User ID</TableHead>
                  <TableHead className="font-semibold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">Plan ID</TableHead>
                  <TableHead className="font-semibold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">Status</TableHead>
                  <TableHead className="font-semibold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">Period Start</TableHead>
                  <TableHead className="font-semibold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">Period End</TableHead>
                  <TableHead className="font-semibold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => (
                  <TableRow key={sub.id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                    <TableCell className="text-zinc-200">{sub.id}</TableCell>
                    <TableCell className="text-zinc-200">{sub.user_id}</TableCell>
                    <TableCell className="text-zinc-200">{sub.plan_id}</TableCell>
                    <TableCell>
                      <Badge
                        variant={sub.status === 'active' ? 'default' : 'secondary'}
                        className={sub.status === 'active' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' : 'bg-zinc-600 text-zinc-200'}
                      >
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-200">{new Date(sub.current_period_start).toLocaleDateString()}</TableCell>
                    <TableCell className="text-zinc-200">{new Date(sub.current_period_end).toLocaleDateString()}</TableCell>
                    <TableCell className="text-zinc-200">{new Date(sub.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        );
      case 'survey-responses':
        return (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <Card className="bg-zinc-900/80 backdrop-blur-md border-zinc-800 shadow-lg shadow-blue-500/10">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-bold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">
                    Survey Analytics
                  </CardTitle>
                  <Select value={surveyGranularity} onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setSurveyGranularity(value)}>
                    <SelectTrigger className="w-[120px] bg-zinc-800 border-zinc-700 text-zinc-200">
                      <SelectValue placeholder="Granularity" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  {surveyResponses.length > 0 ? (
                    <Chart type="bar" data={getSurveyChartData()} options={chartOptions} />
                  ) : (
                    <div className="text-center text-zinc-400">No survey data available</div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => exportToCSV('survey-responses')}
                className="bg-gradient-to-r from-zinc-800 to-zinc-900 text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 transition-all duration-300 shadow-md shadow-blue-500/20"
              >
                <Download className="mr-2 h-4 w-4" /> Export to CSV
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-zinc-800 to-zinc-900 border-b border-zinc-700 hover:bg-zinc-700/50 transition-colors">
                  <TableHead className="font-semibold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">ID</TableHead>
                  <TableHead className="font-semibold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">User ID</TableHead>
                  <TableHead className="font-semibold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">Satisfaction</TableHead>
                  <TableHead className="font-semibold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">NPS</TableHead>
                  <TableHead className="font-semibold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">Issue</TableHead>
                  <TableHead className="font-semibold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {surveyResponses.map((response) => (
                  <TableRow key={response.id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                    <TableCell className="text-zinc-200">{response.id}</TableCell>
                    <TableCell className="text-zinc-200">{response.user_id || response.anonymous_user_id}</TableCell>
                    <TableCell className="text-zinc-200">{response.satisfaction}</TableCell>
                    <TableCell className="text-zinc-200">{response.nps}</TableCell>
                    <TableCell className="text-zinc-200">{response.issue}</TableCell>
                    <TableCell className="text-zinc-200">{new Date(response.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        );
      case 'transactions':
        const txAnalytics = getTransactionAnalytics();
        return (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <Card className="bg-zinc-900/80 backdrop-blur-md border-zinc-800 shadow-lg shadow-blue-500/10">
                <CardHeader>
                  <CardTitle className="text-lg font-bold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl text-blue-400">${(txAnalytics.totalRevenue / 100).toFixed(2)}</p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/80 backdrop-blur-md border-zinc-800 shadow-lg shadow-blue-500/10">
                <CardHeader>
                  <CardTitle className="text-lg font-bold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">Successful Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl text-blue-400">{txAnalytics.successfulTx}</p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/80 backdrop-blur-md border-zinc-800 shadow-lg shadow-blue-500/10">
                <CardHeader>
                  <CardTitle className="text-lg font-bold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <Chart
                    type="bar"
                    data={{
                      labels: txAnalytics.trendLabels,
                      datasets: [{
                        label: 'Revenue',
                        data: txAnalytics.trendData,
                        backgroundColor: 'rgba(59, 130, 246, 0.5)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 1,
                      }],
                    }}
                    options={{
                      responsive: true,
                      plugins: { legend: { display: false } },
                      scales: { x: { display: false }, y: { display: false } },
                    }}
                    height={50}
                  />
                </CardContent>
              </Card>
            </motion.div>
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => exportToCSV('transactions')}
                className="bg-gradient-to-r from-zinc-800 to-zinc-900 text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 transition-all duration-300 shadow-md shadow-blue-500/20"
              >
                <Download className="mr-2 h-4 w-4" /> Export to CSV
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-zinc-800 to-zinc-900 border-b border-zinc-700 hover:bg-zinc-700/50 transition-colors">
                  <TableHead className="font-semibold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">ID</TableHead>
                  <TableHead className="font-semibold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">User ID</TableHead>
                  <TableHead className="font-semibold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">Amount</TableHead>
                  <TableHead className="font-semibold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">Currency</TableHead>
                  <TableHead className="font-semibold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">Status</TableHead>
                  <TableHead className="font-semibold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">Description</TableHead>
                  <TableHead className="font-semibold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                    <TableCell className="text-zinc-200">{transaction.id}</TableCell>
                    <TableCell className="text-zinc-200">{transaction.user_id}</TableCell>
                    <TableCell className="text-zinc-200">{transaction.amount}</TableCell>
                    <TableCell className="text-zinc-200">{transaction.currency}</TableCell>
                    <TableCell>
                      <Badge
                        variant={transaction.status === 'succeeded' ? 'default' : 'secondary'}
                        className={transaction.status === 'succeeded' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' : 'bg-zinc-600 text-zinc-200'}
                      >
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-200">{transaction.description}</TableCell>
                    <TableCell className="text-zinc-200">{new Date(transaction.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        );
      case 'users':
        const userAnalytics = getUserAnalytics();
        return (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <Card className="bg-zinc-900/80 backdrop-blur-md border-zinc-800 shadow-lg shadow-blue-500/10">
                <CardHeader>
                  <CardTitle className="text-lg font-bold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl text-blue-400">{userAnalytics.totalUsers}</p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/80 backdrop-blur-md border-zinc-800 shadow-lg shadow-blue-500/10">
                <CardHeader>
                  <CardTitle className="text-lg font-bold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">New Users (30d)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl text-blue-400">{userAnalytics.newUsers}</p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/80 backdrop-blur-md border-zinc-800 shadow-lg shadow-blue-500/10">
                <CardHeader>
                  <CardTitle className="text-lg font-bold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">User Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <Chart
                    type="line"
                    data={{
                      labels: userAnalytics.trendLabels,
                      datasets: [{
                        label: 'Users',
                        data: userAnalytics.trendData,
                        borderColor: 'rgba(59, 130, 246, 1)',
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        fill: true,
                        tension: 0.4,
                      }],
                    }}
                    options={{
                      responsive: true,
                      plugins: { legend: { display: false } },
                      scales: { x: { display: false }, y: { display: false } },
                    }}
                    height={50}
                  />
                </CardContent>
              </Card>
            </motion.div>
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => exportToCSV('users')}
                className="bg-gradient-to-r from-zinc-800 to-zinc-900 text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 transition-all duration-300 shadow-md shadow-blue-500/20"
              >
                <Download className="mr-2 h-4 w-4" /> Export to CSV
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-zinc-800 to-zinc-900 border-b border-zinc-700 hover:bg-zinc-700/50 transition-colors">
                  <TableHead className="font-semibold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">ID</TableHead>
                  <TableHead className="font-semibold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">Full Name</TableHead>
                  <TableHead className="font-semibold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">Email</TableHead>
                  <TableHead className="font-semibold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">Stripe Customer ID</TableHead>
                  <TableHead className="font-semibold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">BTC Address</TableHead>
                  <TableHead className="font-semibold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                    <TableCell className="text-zinc-200">{user.id}</TableCell>
                    <TableCell className="text-zinc-200">{user.full_name}</TableCell>
                    <TableCell className="text-zinc-200">{user.email}</TableCell>
                    <TableCell className="text-zinc-200">{user.stripe_customer_id}</TableCell>
                    <TableCell className="text-zinc-200">{user.btc_address}</TableCell>
                    <TableCell className="text-zinc-200">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-black to-zinc-950">
      <Header />
      <div className="flex flex-1 pt-16">
        <AdmSidebar isOpen={isSidebarOpen} activeSection={activeSection} setActiveSection={setActiveSection} />
        <div className={`flex-1 p-8 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <button
            onClick={toggleSidebar}
            className="mb-4 p-2 rounded-lg bg-gradient-to-r from-zinc-800 to-zinc-900 text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 transition-all duration-300 shadow-md shadow-blue-500/20"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Card className="bg-zinc-900/80 backdrop-blur-md border-zinc-800 shadow-lg shadow-blue-500/10">
            <CardHeader>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">
                {activeSection.charAt(0).toUpperCase() + activeSection.replace('-', ' ').slice(1)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center text-zinc-400 animate-pulse">Loading...</div>
              ) : (
                renderTable()
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}