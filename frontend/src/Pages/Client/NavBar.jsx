import React from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useQuery } from "react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  Home,
  Heart,
  FileText,
  Film,
  Upload,
  BarChart3,
  LogOut,
} from "lucide-react";

const fetchUserRole = async () => {
  const response = await axios.get("http://localhost:8081/api/user/getRole", {
    withCredentials: true,
  });
  return response.data;
};

export default function NavbarPage() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["userRole"],
    queryFn: fetchUserRole,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: 2,
  });

  if (isLoading) {
    return (
      <nav className="animate-pulse bg-gradient-to-r from-purple-900 to-purple-700 text-white p-4">
        <div className="h-8 bg-purple-600/50 rounded w-32"></div>
      </nav>
    );
  }

  if (isError) {
    console.error("Error fetching user data:", error);
    return (
      <nav className="bg-red-900/20 text-red-100 p-4">
        <p className="text-center">Failed to load navigation data</p>
      </nav>
    );
  }

  const isAdmin = data.role === "admin";

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        await axios.post(
          "http://localhost:8081/api/user/stop-streaming",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
      }

      await axios.post(
        "http://localhost:8081/api/user/logout",
        {},
        {
          withCredentials: true,
        }
      );

      localStorage.removeItem("authToken");
      navigate("/login");
    } catch (error) {
      alert("Error in stopping the stream or logging out");
    }
  };

  return (
    <nav className="bg-gradient-to-r from-purple-900 to-purple-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link
              to="/"
              className="text-xl mr-4 font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-white hover:from-white hover:to-purple-200 transition-all duration-300"
            >
              {isAdmin ? "Admin Portal" : "Streammify"}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isAdmin ? (
              <>
                <Link
                  to="/admin/payment/search"
                  className="nav-link hover:text-purple-200 transition-colors duration-200"
                >
                  Search Payments
                </Link>
                <Link
                  to="/admin/email/logs"
                  className="nav-link hover:text-purple-200 transition-colors duration-200"
                >
                  Email Change Logs
                </Link>
                <Link
                  to="/admin/payments"
                  className="nav-link hover:text-purple-200 transition-colors duration-200"
                >
                  Client Payments
                </Link>
                <Link
                  to="/admin/add/plans"
                  className="nav-link hover:text-purple-200 transition-colors duration-200"
                >
                  Add Plans
                </Link>
                <Link
                  to="/admin/settlements"
                  className="nav-link hover:text-purple-200 transition-colors duration-200"
                >
                  Razorpay Settlements
                </Link>
                <Link
                  to="/admin/reports"
                  className="nav-link hover:text-purple-200 transition-colors duration-200"
                >
                  <FileText className="inline-block mr-1 h-4 w-4" />
                  Reports
                </Link>
                <Link
                  to="/movie/status"
                  className="nav-link hover:text-purple-200 transition-colors duration-200"
                >
                  <Film className="inline-block mr-1 h-4 w-4" />
                  Movies Status
                </Link>
                <Link
                  to="/admin/upload"
                  className="nav-link hover:text-purple-200 transition-colors duration-200"
                >
                  <Upload className="inline-block mr-1 h-4 w-4" />
                  Upload Movies
                </Link>
                <Link
                  to="/users/statics"
                  className="nav-link hover:text-purple-200 transition-colors duration-200"
                >
                  <BarChart3 className="inline-block mr-1 h-4 w-4" />
                  Analytics
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className="nav-link hover:text-purple-200 transition-colors duration-200"
                >
                  <Home className="inline-block mr-1 h-4 w-4" />
                  Home
                </Link>
                <Link
                  to="/whishlist"
                  className="nav-link hover:text-purple-200 transition-colors duration-200"
                >
                  <Heart className="inline-block mr-1 h-4 w-4" />
                  Wishlist
                </Link>
                <Link
                  to="/history"
                  className="nav-link hover:text-purple-200 transition-colors duration-200"
                >
                  <Film className="inline-block mr-1 h-4 w-4" />
                  History
                </Link>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full hover:bg-purple-800/50"
                >
                  <Avatar>
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt="Profile"
                      className="rounded-full"
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-purple-900 text-white border border-purple-700"
              >
                {!isAdmin ? (
                  <>
                    <DropdownMenuItem className="hover:bg-purple-800 cursor-pointer">
                      <Link to="/profile" className="flex w-full items-center">
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-purple-800 cursor-pointer">
                      <Link
                        to="/reports/list"
                        className="flex w-full items-center"
                      >
                        Report List
                      </Link>
                    </DropdownMenuItem>
                    {data.user === "Blocked" && (
                      <DropdownMenuItem className="hover:bg-purple-800 cursor-pointer">
                        <Link to="/pay" className="flex w-full items-center">
                          Upgrade
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </>
                ) : (
                  <>
                    <DropdownMenuItem className="hover:bg-purple-800 cursor-pointer">
                      <Link to="/profile" className="flex w-full items-center">
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-purple-800 cursor-pointer">
                      <Link
                        to="/admin/create-admin"
                        className="flex w-full items-center"
                      >
                        Create Admin
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-purple-800 cursor-pointer">
                      <Link
                        to="/admin/view"
                        className="flex w-full items-center"
                      >
                        Active Account
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem
                  className="hover:bg-purple-800 cursor-pointer text-red-400"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="hover:bg-purple-800/50"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {isAdmin ? (
              <>
                <Link
                  to="/admin/payment/search"
                  className="block px-4 py-2 hover:bg-purple-800/50 rounded-md"
                >
                  Search Payments
                </Link>
                <Link
                  to="/admin/payments"
                  className="block px-4 py-2 hover:bg-purple-800/50 rounded-md"
                >
                  Client Payments
                </Link>
                <Link
                  to="/admin/settlements"
                  className="block px-4 py-2 hover:bg-purple-800/50 rounded-md"
                >
                  Razorpay Settlements
                </Link>
                <Link
                  to="/admin/reports"
                  className="block px-4 py-2 hover:bg-purple-800/50 rounded-md"
                >
                  <FileText className="inline-block mr-2 h-4 w-4" />
                  Reports
                </Link>
                <Link
                  to="/movie/status"
                  className="block px-4 py-2 hover:bg-purple-800/50 rounded-md"
                >
                  <Film className="inline-block mr-2 h-4 w-4" />
                  Movies Status
                </Link>
                <Link
                  to="/admin/upload"
                  className="block px-4 py-2 hover:bg-purple-800/50 rounded-md"
                >
                  <Upload className="inline-block mr-2 h-4 w-4" />
                  Upload Movies
                </Link>
                <Link
                  to="/users/statics"
                  className="block px-4 py-2 hover:bg-purple-800/50 rounded-md"
                >
                  <BarChart3 className="inline-block mr-2 h-4 w-4" />
                  Analytics
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className="block px-4 py-2 hover:bg-purple-800/50 rounded-md"
                >
                  <Home className="inline-block mr-2 h-4 w-4" />
                  Home
                </Link>
                <Link
                  to="/whishlist"
                  className="block px-4 py-2 hover:bg-purple-800/50 rounded-md"
                >
                  <Heart className="inline-block mr-2 h-4 w-4" />
                  Wishlist
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
