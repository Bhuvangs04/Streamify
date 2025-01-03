import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NavbarPage from "../Client/NavBar";

import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { useQuery } from "react-query";
import axios from "axios";
import { motion } from "framer-motion";
import { X, FileBarChart, Users, UserCheck, UserX } from "lucide-react";

const AdminAnalytics = () => {
  // Fetch data using React Query
  const {
    data: analyticsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const response = await axios.post(
        "http://localhost:8081/api/admin/analytics/details",
        {
          withCredentials: true,
        }
      );
      return response.data;
    },
  });

  if (isError) {
    return <div>Error loading analytics data. Please try again later.</div>;
  }

  // Sample data (replace with actual data from API)
  const registeredUsers = {
    data: [
      { name: "Registered", value: analyticsData?.totalUsers },
      { name: "Not Registered", value: analyticsData?.potentialUsers },
    ],
  };

  const paidUsers = {
    data: [
      { name: "Paid", value: analyticsData?.paidUsers },
      { name: "Unpaid", value: analyticsData?.unpaidUsers },
    ],
  };

  const subscriptionStatus = {
    data: [
      { name: "Active", value: analyticsData?.activeSubscriptions },
      { name: "Expired", value: analyticsData?.expiredSubscriptions },
    ],
  };

  const blockedUsers = {
    data: [
      { name: "Active Users", value: analyticsData?.activeUsers },
      { name: "Blocked Users", value: analyticsData?.blockedUsers },
    ],
  };

  const monthlyData =
    analyticsData?.monthlySubscriptions.map((item) => ({
      name: new Date(item.year, item.month - 1).toLocaleString("default", {
        month: "short",
      }),
      subscriptions: item.subscriptions,
    })) || [];

  const COLORS = ["#9b87f5", "#1A1F2C", "#D6BCFA", "#8E9196"];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  if (isLoading) {
    return (
      <>
        <div className="min-h-screen bg-gray-900 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-6 h-64" />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavbarPage />
      <div className="min-h-screen bg-gray-900 p-8">
        <motion.div
          className="max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-white">
              Analytics Dashboard
            </h1>

            <Button
              onClick={() => (window.location.href = "/admin/reports/detailed")}
              className="bg-purple-600 hover:bg-purple-700"
            >
              View Detailed Report
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={itemVariants}>
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-white text-lg font-medium">
                    <Users className="inline-block mr-2" /> Registered Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer className="h-[300px]" config={{}}>
                    <PieChart>
                      <Pie
                        data={registeredUsers.data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {registeredUsers.data.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-white text-lg font-medium">
                    <UserCheck className="inline-block mr-2" /> Paid Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer className="h-[300px]" config={{}}>
                    <h1 className="text-2xl text-white-500">
                      Total Income-{":"}Rs.{analyticsData?.totalRevenue}/-
                    </h1>
                    <PieChart>
                      <Pie
                        data={paidUsers.data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {paidUsers.data.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} className="md:col-span-2">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-white text-lg font-medium">
                    <FileBarChart className="inline-block mr-2" /> Monthly
                    Subscriptions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer className="h-[300px]" config={{}}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="subscriptions" fill="#9b87f5" />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-white text-lg font-medium">
                    Subscription Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer className="h-[300px]" config={{}}>
                    <PieChart>
                      <Pie
                        data={subscriptionStatus.data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {subscriptionStatus.data.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-white text-lg font-medium">
                    <UserX className="inline-block mr-2" /> User Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer className="h-[300px]" config={{}}>
                    <PieChart>
                      <Pie
                        data={blockedUsers.data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {blockedUsers.data.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default AdminAnalytics;
