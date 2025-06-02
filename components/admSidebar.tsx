'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Home, Package, User, BarChart, CreditCard, Info, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface AdmSidebarProps {
  isOpen: boolean;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export default function AdmSidebar({ isOpen, activeSection, setActiveSection }: AdmSidebarProps) {
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  const menuItems = [
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'survey-responses', label: 'Survey Responses', icon: BarChart },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'users', label: 'Users', icon: User },
  ];

  const toggleAnalytics = () => {
    setIsAnalyticsOpen(!isAnalyticsOpen);
  };

  return (
    <div
      className={cn(
        'h-screen p-4 bg-gradient-to-b from-black to-zinc-900 border-r border-zinc-800 shadow-lg shadow-blue-500/10 transition-all duration-300 flex flex-col',
        isOpen ? 'w-64' : 'w-0 overflow-hidden'
      )}
    >
      <div className="flex items-center mb-8">
        <Home className="flex h-6 w-6 text-blue-400 mr-2" />
        <h1 className="flex text-xl font-bold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
      </div>
      <nav className="flex-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={cn(
              'flex items-center w-full p-2 rounded-lg mb-2 bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent hover:bg-gradient-to-r hover:from-zinc-800 hover:to-zinc-700 hover:text-blue-400 transition-all duration-300',
              activeSection === item.id && 'bg-gradient-to-r from-zinc-800 to-zinc-700 text-blue-400 shadow-md shadow-blue-500/20'
            )}
          >
            <item.icon className="h-5 w-5 mr-2" />
            {item.label}
          </button>
        ))}
      </nav>
      {isOpen && (
        <div className="mt-auto">
          <button
            onClick={toggleAnalytics}
            className="flex items-center w-full p-2 rounded-lg bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent hover:bg-gradient-to-r hover:from-zinc-800 hover:to-zinc-700 hover:text-blue-400 transition-all duration-300"
          >
            <Info className="h-5 w-5 mr-2" />
            How Analytics Work
          </button>
          {isAnalyticsOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-2"
            >
              <Card className="bg-zinc-900/80 backdrop-blur-md border-zinc-800 shadow-lg shadow-blue-500/10">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-bold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">
                    How Analytics Work
                  </CardTitle>
                  <button
                    onClick={toggleAnalytics}
                    className="text-zinc-400 hover:text-blue-400 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </CardHeader>
                <CardContent className="pt-0 text-xs text-zinc-200">
                  <p className="mb-2">
                    Analytics provide a clear, actionable view of your business performance by summarizing key data and visualizing trends. Below is how each section works and why it matters for your decision-making.
                  </p>
                  <div className="space-y-2">
                    <div>
                      <span className="font-semibold">Orders</span>
                      <ul className="list-disc ml-4">
                        <li>
                          <span className="font-medium">What You See:</span> Total orders placed, number of completed orders, active subscriptions linked to orders, and a chart of daily order activity over the past week.
                        </li>
                        <li>
                          <span className="font-medium">How It Works:</span> Counts all orders, filters for completed ones, and identifies active subscriptions. The chart groups orders by day to show changes in volume.
                        </li>
                        <li>
                          <span className="font-medium">Why It Matters:</span> Helps you monitor sales activity, assess order fulfillment efficiency, and track subscription growth for revenue planning.
                        </li>
                      </ul>
                    </div>
                    <div>
                      <span className="font-semibold">Subscriptions</span>
                      <ul className="list-disc ml-4">
                        <li>
                          <span className="font-medium">What You See:</span> Number of active subscriptions, percentage of canceled subscriptions (churn rate), and a pie chart showing the proportion of each subscription status (e.g., active, canceled).
                        </li>
                        <li>
                          <span className="font-medium">How It Works:</span> Counts active subscriptions, calculates churn by dividing canceled subscriptions by the total, and groups subscriptions by status for the chart.
                        </li>
                        <li>
                          <span className="font-medium">Why It Matters:</span> Shows customer retention and subscription health, helping you identify issues like high churn and plan retention strategies.
                        </li>
                      </ul>
                    </div>
                    <div>
                      <span className="font-semibold">Survey Responses</span>
                      <ul className="list-disc ml-4">
                        <li>
                          <span className="font-medium">What You See:</span> Number of feedback responses, average Net Promoter Score (NPS) for satisfaction, and a chart combining response volume and NPS trends, adjustable by day, week, or month.
                        </li>
                        <li>
                          <span className="font-medium">How It Works:</span> Counts responses, averages NPS scores, and groups data by your chosen time frame (daily, weekly, monthly). The chart shows response counts as bars and NPS as a line.
                        </li>
                        <li>
                          <span className="font-medium">Why It Matters:</span> Reveals user satisfaction and feedback patterns, guiding product improvements and customer experience enhancements.
                        </li>
                      </ul>
                    </div>
                    <div>
                      <span className="font-semibold">Transactions</span>
                      <ul className="list-disc ml-4">
                        <li>
                          <span className="font-medium">What You See:</span> Total revenue from successful payments, number of completed transactions, and a chart of daily revenue over the past week.
                        </li>
                        <li>
                          <span className="font-medium">How It Works:</span> Sums the amounts of successful transactions, counts completed ones, and groups revenue by day for the chart.
                        </li>
                        <li>
                          <span className="font-medium">Why It Matters:</span> Tracks financial performance and payment reliability, essential for budgeting and revenue forecasting.
                        </li>
                      </ul>
                    </div>
                    <div>
                      <span className="font-semibold">Users</span>
                      <ul className="list-disc ml-4">
                        <li>
                          <span className="font-medium">What You See:</span> Total number of users, new users signed up in the last 30 days, and a chart of daily user growth over the past week.
                        </li>
                        <li>
                          <span className="font-medium">How It Works:</span> Counts all users, filters for recent sign-ups, and groups new users by day for the chart.
                        </li>
                        <li>
                          <span className="font-medium">Why It Matters:</span> Monitors audience growth and acquisition trends, informing marketing and user engagement strategies.
                        </li>
                      </ul>
                    </div>
                    <div>
                      <span className="font-semibold">Additional Features</span>
                      <ul className="list-disc ml-4">
                        <li>
                          <span className="font-medium">CSV Exports:</span> Download any section’s data as a spreadsheet for detailed analysis in tools like Excel.
                        </li>
                        <li>
                          <span className="font-medium">Survey Filter:</span> Adjust the survey view to daily, weekly, or monthly to focus on short-term or long-term feedback trends.
                        </li>
                        <li>
                          <span className="font-medium">Why It Matters:</span> Provides flexibility to dive deeper into data and analyze trends at different scales, supporting strategic planning.
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}