"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Menu, X, Download } from "lucide-react";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip as ChartJSTooltip,
  Legend as ChartJSLegend,
  ArcElement,
} from "chart.js";
import { Chart, Pie } from "react-chartjs-2";
import {
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  Area,
  Bar,
  Line,
} from "recharts";
import AdmSidebar from "@/components/admSidebar";
import Header from "@/components/NavBar";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  ChartJSTooltip,
  ChartJSLegend
);

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
  plan_type: string;
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
  checkout_session_id: string;
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
  plan_type: string;
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
  crypto_address: string;
  created_at: string;
}

export default function DashboardHome() {
  const [activeSection, setActiveSection] = useState("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponse[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [surveyGranularity, setSurveyGranularity] = useState<
    "daily" | "weekly" | "monthly"
  >("daily");

  const fetchData = async (section: string) => {
    setLoading(true);
    try {
      const apiSection =
        section === "subscriptions"
          ? "subscription"
          : section === "transactions"
          ? "transaction"
          : section === "users"
          ? "user"
          : section;
      const response = await fetch(`/api/adm/${apiSection}`);
      const data = await response.json();
      const safeData = Array.isArray(data) ? data : [];
      if (section === "orders") setOrders(safeData);
      if (section === "subscriptions") setSubscriptions(safeData);
      if (section === "survey-responses") setSurveyResponses(safeData);
      if (section === "transactions") setTransactions(safeData);
      if (section === "users") setUsers(safeData);
    } catch (error) {
      console.error(`Error fetching ${section}:`, error);
      if (section === "orders") setOrders([]);
      if (section === "subscriptions") setSubscriptions([]);
      if (section === "survey-responses") setSurveyResponses([]);
      if (section === "transactions") setTransactions([]);
      if (section === "users") setUsers([]);
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

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const exportToCSV = (section: string) => {
    let data: any[] = [];
    let headers: string[] = [];
    let filename: string = "";

    switch (section) {
      case "orders":
        headers = [
          "ID",
          "User ID",
          "Plan ID",
          "Status",
          "Start Date",
          "End Date",
          "Active",
          "Created At",
        ];
        data = orders.map((order) => ({
          id: order.id,
          user_id: order.user_id,
          plan_id: order.plan_id,
          status: order.status,
          start_date: new Date(order.start_date).toLocaleDateString(),
          end_date: new Date(order.end_date).toLocaleDateString(),
          active: order.is_active ? "Yes" : "No",
          created_at: new Date(order.created_at).toLocaleDateString(),
        }));
        filename = "Orders.csv";
        break;
      case "subscriptions":
        headers = [
          "ID",
          "User ID",
          "Plan ID",
          "Status",
          "Period Start",
          "Period End",
          "Created At",
        ];
        data = subscriptions.map((sub) => ({
          id: sub.id,
          user_id: sub.user_id,
          plan_type: sub.plan_type,
          status: sub.status,
          period_start: new Date(sub.current_period_start).toLocaleDateString(),
          period_end: new Date(sub.current_period_end).toLocaleDateString(),
          created_at: new Date(sub.created_at).toLocaleDateString(),
        }));
        filename = "Subscriptions.csv";
        break;
      case "survey-responses":
        headers = [
          "ID",
          "User ID",
          "Satisfaction",
          "NPS",
          "Issue",
          "Created At",
        ];
        data = surveyResponses.map((r) => ({
          id: r.id,
          user_id: r.user_id || r.anonymous_user_id,
          satisfaction: r.satisfaction,
          nps: r.nps,
          issue: r.issue,
          suggestion: r.suggestion,
          created_at: new Date(r.created_at).toLocaleDateString(),
        }));
        filename = "SurveyResponses.csv";
        break;
      case "transactions":
        headers = [
          "ID",
          "User ID",
          "Amount",
          "Currency",
          "Status",
          "PlanType",
          "Created At",
        ];
        data = transactions.map((t) => ({
          id: t.id,
          user_id: t.user_id,
          amount: t.amount,
          currency: t.currency,
          status: t.status,
          plan_type: t.plan_type,
          payment_provider_reference: t.payment_provider_reference,
          created_at: new Date(t.created_at).toLocaleDateString(),
        }));
        filename = "Transactions.csv";
        break;
      case "users":
        headers = [
          "ID",
          "Name",
          "Email",
          "Stripe Customer",
          "BTC",
          "Created At",
        ];
        data = users.map((user) => ({
          id: user.id,
          name: user.full_name,
          email: user.email,
          stripe: user.stripe_customer_id,
          crypto_address: user.crypto_address,
          created_at: new Date(user.created_at).toLocaleDateString(),
        }));
        filename = "Users.csv";
        break;
    }

    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map(
            (header) =>
              `"${row[header.toLowerCase().replace(/\s/g, "_")] || ""}"`
          )
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const getOrderAnalytics = () => {
    const totalOrders = orders.length;
    const completedOrders = orders.filter(
      (o) => o.status === "completed" || o.status === "Completed"
    ).length;
    const activeSubscriptions = orders.filter((o) => o.is_active).length;
    const orderTrend = orders.reduce((acc, o) => {
      const date = new Date(o.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const trendLabels = Object.keys(orderTrend).slice(-10);
    const trendData = trendLabels.map((o) => orderTrend[o]);

    return {
      totalOrders,
      completedOrders,
      activeSubscriptions,
      trendLabels,
      trendData,
    };
  };

  const getSubscriptionAnalytics = () => {
    const activeSubs = subscriptions.filter(
      (s) => s.status === "active"
    ).length;
    const canceledSubs = subscriptions.filter(
      (s) => s.status === "incomplete"
    ).length;
    const churnRate = subscriptions.length
      ? ((canceledSubs / subscriptions.length) * 100).toFixed(2)
      : "0.00";
    const statusCounts = subscriptions.reduce((acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { activeSubs, canceledSubs, churnRate, statusCounts };
  };

  const getTransactionAnalytics = () => {
    const totalRevenue = transactions.reduce(
      (sum, t) => sum + (t.status === "completed" ? t.amount : 0),
      0
    );
    const successfulTx = transactions.filter(
      (t) => t.status === "completed"
    ).length;
    const txTrend = transactions.reduce((acc, t) => {
      const date = new Date(t.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      acc[date] = (acc[date] || 0) + (t.status === "completed" ? t.amount : 0);
      return acc;
    }, {} as Record<string, number>);
    const trendLabels = Object.keys(txTrend).slice(-10);
    const trendData = trendLabels.map((t) => txTrend[t]);

    return { totalRevenue, successfulTx, trendLabels, trendData };
  };

  const getUserAnalytics = () => {
    const totalUsers = users.length;
    const newUsers = users.filter(
      (u) =>
        new Date(u.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;
    const userTrend = users.reduce((acc, u) => {
      const date = new Date(u.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const trendLabels = Object.keys(userTrend).slice(-10);
    const trendData = trendLabels.map((u) => userTrend[u]);

    return { totalUsers, newUsers, trendLabels, trendData };
  };

  const getSurveyChartData = () => {
    const groupedData = surveyResponses.reduce((acc, response) => {
      let date: string;
      if (surveyGranularity === "monthly") {
        date = new Date(response.created_at).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
      } else if (surveyGranularity === "weekly") {
        const d = new Date(response.created_at);
        const weekStart = new Date(d.setDate(d.getDate() - d.getDay()));
        date = weekStart.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      } else {
        date = new Date(response.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }
      if (!acc[date]) {
        acc[date] = { count: 0, npsSum: 0, npsCount: 0 };
      }
      acc[date].count += 1;
      acc[date].npsSum += response.nps;
      acc[date].npsCount += 1;
      return acc;
    }, {} as Record<string, { count: number; npsSum: number; npsCount: number }>);

    const sortedDates = Object.keys(groupedData).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );
    return sortedDates.map((date) => ({
      date,
      responses: groupedData[date].count,
      nps:
        groupedData[date].npsCount > 0
          ? Number(
              (groupedData[date].npsSum / groupedData[date].npsCount).toFixed(1)
            )
          : 0,
    }));
  };

  const renderTable = () => {
    switch (activeSection) {
      case "orders":
        const orderAnalytics = getOrderAnalytics();
        return (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <Card className="bg-white/80 border-none shadow-md rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-black">
                    Total Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl text-black">
                    {orderAnalytics.totalOrders}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white/80 border-none shadow-md rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-black">
                    Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl text-black">
                    {orderAnalytics.completedOrders}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white/80 border-none shadow-md rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-black">
                    Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Chart
                    type="line"
                    data={{
                      labels: orderAnalytics.trendLabels,
                      datasets: [
                        {
                          label: "Orders",
                          data: orderAnalytics.trendData,
                          borderColor: "rgba(75, 192, 192, 1)",
                          backgroundColor: "rgba(75, 192, 192, 0.2)",
                          fill: true,
                          tension: 0.4,
                        },
                      ],
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
                onClick={() => exportToCSV("orders")}
                className="bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-md rounded-xl"
              >
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table className="bg-white/80 rounded-xl">
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-100 to-gray-200 border-b border-gray-300 hover:bg-gray-100 transition-colors duration-200">
                    <TableHead className="font-semibold text-black">
                      ID
                    </TableHead>
                    <TableHead className="font-semibold text-black">
                      User
                    </TableHead>
                    <TableHead className="font-semibold text-black">
                      Plan
                    </TableHead>
                    <TableHead className="font-semibold text-black">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-black">
                      Start
                    </TableHead>
                    <TableHead className="font-semibold text-black">
                      End
                    </TableHead>
                    <TableHead className="font-semibold text-black">
                      Active
                    </TableHead>
                    <TableHead className="font-semibold text-black">
                      Created
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="border-b border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <TableCell className="text-black">{order.id}</TableCell>
                      <TableCell className="text-black">
                        {order.user_id}
                      </TableCell>
                      <TableCell className="text-black">
                        {order.plan_id}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.status === "completed"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            order.status === "completed"
                              ? "bg-gradient-to-r from-green-600 to-green-700 text-white"
                              : "bg-gray-200 text-gray-800"
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-black">
                        {new Date(order.start_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-black">
                        {new Date(order.end_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-black">
                        {order.is_active ? "Yes" : "No"}
                      </TableCell>
                      <TableCell className="text-black">
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        );
      case "subscriptions":
        const subAnalytics = getSubscriptionAnalytics();
        return (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <Card className="bg-white/80 border-none shadow-md rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-black">
                    Active
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl text-black">
                    {subAnalytics.activeSubs}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white/80 border-none shadow-md rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-black">
                    Churn
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl text-black">
                    {subAnalytics.churnRate}%
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white/80 border-none shadow-md rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-black">
                    Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Pie
                    data={{
                      labels: Object.keys(subAnalytics.statusCounts),
                      datasets: [
                        {
                          data: Object.values(subAnalytics.statusCounts),
                          backgroundColor: [
                            "rgba(54, 162, 235, 0.5)",
                            "rgba(255, 99, 132, 0.5)",
                            "rgba(255, 206, 86, 0.5)",
                          ],
                          borderColor: [
                            "rgba(54, 162, 235, 1)",
                            "rgba(255, 99, 132, 1)",
                            "rgba(255, 206, 86, 1)",
                          ],
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: "bottom" as const,
                          labels: { color: "#000000" },
                        },
                      },
                    }}
                  />
                </CardContent>
              </Card>
            </motion.div>
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => exportToCSV("subscriptions")}
                className="bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-md rounded-xl"
              >
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table className="bg-white/80 rounded-xl">
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-100 to-gray-200 border-b border-gray-300 hover:bg-gray-100 transition-colors duration-200">
                    <TableHead className="font-semibold text-black">
                      ID
                    </TableHead>
                    <TableHead className="font-semibold text-black">
                      User
                    </TableHead>
                    <TableHead className="font-semibold text-black">
                      Plan
                    </TableHead>
                    <TableHead className="font-semibold text-black">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-black">
                      Start
                    </TableHead>
                    <TableHead className="font-semibold text-black">
                      End
                    </TableHead>
                    <TableHead className="font-semibold text-black">
                      Created
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub) => (
                    <TableRow
                      key={sub.id}
                      className="border-b border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <TableCell className="text-black">{sub.id}</TableCell>
                      <TableCell className="text-black">
                        {sub.user_id}
                      </TableCell>
                      <TableCell className="text-black">
                        {sub.plan_id}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            sub.status === "active" ? "default" : "secondary"
                          }
                          className={
                            sub.status === "active"
                              ? "bg-gradient-to-r from-green-600 to-green-700 text-white"
                              : "bg-gray-200 text-gray-800"
                          }
                        >
                          {sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-black">
                        {new Date(
                          sub.current_period_start
                        ).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-black">
                        {new Date(sub.current_period_end).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-black">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        );
      case "survey-responses":
        const surveyData = getSurveyChartData();
        return (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <Card className="bg-white/80 border-none shadow-md rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-bold text-black">
                    Survey Analytics
                  </CardTitle>
                  <Select
                    value={surveyGranularity}
                    onValueChange={(value: "daily" | "weekly" | "monthly") =>
                      setSurveyGranularity(value)
                    }
                  >
                    <SelectTrigger className="w-[120px] bg-gray-100 border-gray-300 text-black rounded-xl">
                      <SelectValue placeholder="Granularity" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-100 border-gray-300 text-black rounded-xl">
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  {surveyData.length > 0 ? (
                    <LineChart
                      width={700}
                      height={340}
                      data={surveyData}
                      className="mx-auto"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      <defs>
                        <linearGradient
                          id="barGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#22d3ee"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="100%"
                            stopColor="#22d3ee"
                            stopOpacity={0.2}
                          />
                        </linearGradient>
                        <linearGradient
                          id="lineGradient"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop
                            offset="0%"
                            stopColor="#ec4899"
                            stopOpacity={1}
                          />
                          <stop
                            offset="100%"
                            stopColor="#f43f5e"
                            stopOpacity={1}
                          />
                        </linearGradient>
                        <linearGradient
                          id="areaGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#ec4899"
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="100%"
                            stopColor="#f43f5e"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                        <filter id="glow">
                          <feGaussianBlur
                            stdDeviation="2.5"
                            result="coloredBlur"
                          />
                          <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>
                      <CartesianGrid
                        stroke="#3f3f46"
                        strokeDasharray="3 3"
                        opacity={0.2}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        stroke="#9ca3af"
                        tick={{
                          fill: "#000000",
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                        label={{
                          value: "Date",
                          position: "insideBottom",
                          offset: -10,
                          fill: "#000000",
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                        padding={{ left: 10, right: 10 }}
                        angle={-45}
                        textAnchor="end"
                      />
                      <YAxis
                        yAxisId="left"
                        stroke="#9ca3af"
                        tick={{
                          fill: "#000000",
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                        label={{
                          value: "Responses",
                          angle: -90,
                          position: "insideLeft",
                          offset: 15,
                          fill: "#000000",
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#9ca3af"
                        tick={{
                          fill: "#000000",
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                        label={{
                          value: "NPS",
                          angle: 90,
                          position: "insideRight",
                          offset: 15,
                          fill: "#000000",
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          background: "#1f2937",
                          borderRadius: "8px",
                          border: "none",
                          padding: "12px",
                          fontSize: "12px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                          fontFamily: "'Inter', sans-serif",
                        }}
                        labelStyle={{
                          color: "#f3f4f6",
                          fontWeight: "600",
                          marginBottom: "4px",
                        }}
                        itemStyle={{ fontWeight: "500" }}
                        formatter={(value: number, name: string) => [
                          value,
                          name === "responses" ? "Responses" : "NPS",
                        ]}
                        labelFormatter={(label: string) => `Date: ${label}`}
                      />
                      <RechartsLegend
                        wrapperStyle={{
                          color: "#000000",
                          fontSize: 12,
                          paddingTop: 15,
                          fontWeight: 500,
                        }}
                        formatter={(value: string) => (
                          <span
                            style={{
                              color: "#000000",
                              fontFamily: "'Inter', sans-serif",
                            }}
                          >
                            {value === "responses" ? "Responses" : "NPS"}
                          </span>
                        )}
                      />
                      <Bar
                        yAxisId="left"
                        dataKey="responses"
                        fill="url(#barGradient)"
                        barSize={20}
                        isAnimationActive={true}
                        animationDuration={1200}
                        animationEasing="ease-in-out"
                      />
                      <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="nps"
                        stroke="none"
                        fill="url(#areaGradient)"
                        isAnimationActive={true}
                        animationDuration={1200}
                        animationEasing="ease-in-out"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="nps"
                        stroke="url(#lineGradient)"
                        strokeWidth={4}
                        filter="url(#glow)"
                        dot={{
                          stroke: "#ec4899",
                          strokeWidth: 2,
                          fill: "#1f2937",
                          r: 6,
                        }}
                        activeDot={{
                          r: 10,
                          fill: "#ec4899",
                          stroke: "#1f2937",
                          strokeWidth: 2,
                        }}
                        isAnimationActive={true}
                        animationDuration={1200}
                        animationEasing="ease-in-out"
                      />
                    </LineChart>
                  ) : (
                    <div className="text-center text-gray-600">
                      No survey data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => exportToCSV("survey-responses")}
                className="bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-md rounded-xl"
              >
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table className="bg-white/80 rounded-xl">
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-100 to-gray-200 border-b border-gray-300 hover:bg-gray-100 transition-colors duration-200">
                    <TableHead className="font-semibold text-black">
                      ID
                    </TableHead>
                    <TableHead className="font-semibold text-black">
                      User
                    </TableHead>
                    <TableHead className="font-semibold text-black">
                      Satisfaction
                    </TableHead>
                    <TableHead className="font-semibold text-black">
                      NPS
                    </TableHead>
                    <TableHead className="font-semibold text-black">
                      Issue
                    </TableHead>
                    <TableHead className="font-semibold text-black">
                      suggestion
                    </TableHead>
                    <TableHead className="font-semibold text-black">
                      Created
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {surveyResponses.map((response) => (
                    <TableRow
                      key={response.id}
                      className="border-b border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <TableCell className="text-black">
                        {response.id}
                      </TableCell>
                      <TableCell className="text-black">
                        {response.user_id || response.anonymous_user_id}
                      </TableCell>
                      <TableCell className="text-black">
                        {response.satisfaction}
                      </TableCell>
                      <TableCell className="text-black">
                        {response.nps}
                      </TableCell>
                      <TableCell className="text-black">
                        {response.issue}
                      </TableCell>
                      <TableCell className="text-black">
                        {response.suggestion}
                      </TableCell>
                      <TableCell className="text-black">
                        {new Date(response.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        );
      case "transactions":
        const txAnalytics = getTransactionAnalytics();
        return (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <Card className="bg-white/80 border-none shadow-md rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-black">
                    Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl text-black">
                    ${txAnalytics.totalRevenue.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white/80 border-none shadow-md rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-black">
                    Successful
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl text-black">
                    {txAnalytics.successfulTx}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white/80 border-none shadow-md rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-black">
                    Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Chart
                    type="bar"
                    data={{
                      labels: txAnalytics.trendLabels,
                      datasets: [
                        {
                          label: "Revenue",
                          data: txAnalytics.trendData,
                          backgroundColor: "rgba(153, 102, 255, 0.5)",
                          borderColor: "rgba(153, 102, 255, 1)",
                          borderWidth: 1,
                        },
                      ],
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
                onClick={() => exportToCSV("transactions")}
                className="bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-md rounded-xl"
              >
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table className="bg-white/80 rounded-xl">
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-100 to-gray-200 border-b border-gray-300 hover:bg-gray-100 transition-colors duration-200">
                    <TableHead className="font-semibold text-black">
                      ID
                    </TableHead>
                    <TableHead className="font-semibold text-black">
                      User
                    </TableHead>
                    <TableHead className="font-semibold text-black">
                      Amount
                    </TableHead>
                    <TableHead className="font-semibold text-black">
                      Currency
                    </TableHead>
                    <TableHead className="font-semibold text-black">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-black">
                      Plan Type
                    </TableHead>
                    <TableHead className="font-semibold text-black">
                      Payment Provider
                    </TableHead>
                    <TableHead className="font-semibold text-black">
                      Created
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow
                      key={transaction.id}
                      className="border-b border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <TableCell className="text-black">
                        {transaction.id}
                      </TableCell>
                      <TableCell className="text-black">
                        {transaction.user_id}
                      </TableCell>
                      <TableCell className="text-black">
                        {transaction.amount}
                      </TableCell>
                      <TableCell className="text-black">
                        {transaction.currency}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            transaction.status === "succeeded"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            transaction.status === "succeeded"
                              ? "bg-gradient-to-r from-green-600 to-green-700 text-white"
                              : "bg-gray-200 text-gray-800"
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-black">
                        {transaction.plan_type}
                      </TableCell>
                      <TableCell className="text-black">
                        {transaction.payment_provider_reference}
                      </TableCell>
                      <TableCell className="text-black">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        );
      case "users":
        const userAnalytics = getUserAnalytics();
        return (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <Card className="bg-white/80 border-none shadow-md rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-black">
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl text-black">
                    {userAnalytics.totalUsers}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white/80 border-none shadow-md rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-black">
                    New Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl text-black">
                    {userAnalytics.newUsers}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white/80 border-none shadow-md rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-black">
                    Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Chart
                    type="line"
                    data={{
                      labels: userAnalytics.trendLabels,
                      datasets: [
                        {
                          label: "Users",
                          data: userAnalytics.trendData,
                          borderColor: "rgba(255, 159, 64, 1)",
                          backgroundColor: "rgba(255, 159, 64, 0.2)",
                          fill: true,
                          tension: 0.4,
                        },
                      ],
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
                onClick={() => exportToCSV("users")}
                className="bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-md rounded-xl"
              >
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table className="bg-white/80 rounded-xl">
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-100 to-gray-200 border-b border-gray-300 hover:bg-gray-100 transition-colors duration-200">
                    <TableHead className="font-semibold text-black">
                      ID
                    </TableHead>
                    <TableHead className="font-semibold text-black">
                      Name
                    </TableHead>
                    <TableHead className="font-semibold text-black">
                      Email
                    </TableHead>
                    <TableHead className="font-semibold text-black">
                      Stripe
                    </TableHead>
                    <TableHead className="font-semibold text-black">
                      BTC Address
                    </TableHead>
                    <TableHead className="font-semibold text-black">
                      Created
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow
                      key={user.id}
                      className="border-b border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <TableCell className="text-black">{user.id}</TableCell>
                      <TableCell className="text-black">
                        {user.full_name}
                      </TableCell>
                      <TableCell className="text-black">{user.email}</TableCell>
                      <TableCell className="text-black">
                        {user.stripe_customer_id}
                      </TableCell>
                      <TableCell className="text-black">
                        {user.crypto_address}
                      </TableCell>
                      <TableCell className="text-black">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Header />
      <div className="flex flex-1 sm:pt-16 pt-16">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-1000 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}
        <AdmSidebar
          isOpen={isSidebarOpen}
          activeSection={activeSection}
          setActiveSection={handleSectionChange}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <div className="flex-1 p-4 md:p-6">
          <button
            onClick={toggleSidebar}
            className="mb-4 p-2 rounded-lg bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-md"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Card className="bg-white/80 border-none shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-black">
                {activeSection.charAt(0).toUpperCase() +
                  activeSection.replace("-", " ").slice(1)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center text-gray-600 animate-pulse">
                  Loading...
                </div>
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
