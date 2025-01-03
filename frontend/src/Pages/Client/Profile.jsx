import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Sidebar,
  SidebarMenuItem,
  SidebarMenu,
  SidebarContent,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Avatar } from "@/components/ui/avatar";
import VerificationBadge from "@/components/ui/Verify";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import EditProfileSection from "@/components/profile/EditProfileSection";
import UpdatePasswordSection from "@/components/profile/UpdatePasswordSection";
import PaymentSection from "@/components/profile/PaymentSection";
import OnlineDevicesSection from "@/components/profile/OnlineDevicesSection";
import { useQuery } from "react-query";

const fetchActiveDevices = async () => {
  const response = await axios.get(
    "http://localhost:8081/api/user/active-devices"
  );
  return response.data; // Assumes response has { activeDevices, WatchBy }
};

const fetchUserRole = async () => {
  const response = await axios.get("http://localhost:8081/api/user/getRole");
  return response.data; // Assumes response has { role }
};

const fetchUserProfile = async () => {
  const response = await axios.get("http://localhost:8081/api/user/profile");
  return response.data; // Assumes response has { message: "Success", userDetails }
};

export default function ProfilePage() {
  const [activeSection, setActiveSection] = useState("Edit Profile");
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [lastPayment, setLastPayment] = useState(null);
  const [OldPassword, setOldPassword] = useState("");
  const [NewPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccessMessage] = useState("");
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    number: false,
    specialChar: false,
  });

  const {
    data: activeDevicesData,
    isLoading: loadingDevices,
    error: devicesError,
  } = useQuery("activeDevices", fetchActiveDevices);

  const {
    data: userRoleData,
    isLoading: loadingUserRole,
    error: userRoleError,
  } = useQuery("userRole", fetchUserRole);

  const {
    data: profileData,
    isLoading: loadingProfile,
    error: profileError,
  } = useQuery("userProfile", fetchUserProfile);


  const onlineDevices = activeDevicesData?.activeDevices || [];
  const watchBy = activeDevicesData?.WatchBy || [];
  const lastPaymentDate =
    watchBy.length > 0 ? watchBy[0].lastPaymentDate : null;

  const userRole = userRoleData?.role || "";
  const isAdmin = userRole === "admin";

  const profile = profileData?.userDetails || {};
  const { username, email } = profile;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "NewPassword") {
      setNewPassword(value);
      setPasswordCriteria({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        number: /[0-9]/.test(value),
        specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      });
    }
  };

  useEffect(() => {
    setFormData({ name: username, email: email });
    setLastPayment(lastPaymentDate);
  }, [username, email, lastPaymentDate]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccessMessage(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const updatePassword = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8081/api/user/update/password",
        { oldPassword: OldPassword, newPassword: NewPassword },
        { withCredentials: true }
      );

      if (response.status === 200) {
        setSuccessMessage("Password updated successfully!");
        setOldPassword("");
        setNewPassword("");
      } else {
        setError("Failed to update password.");
      }
    } catch (error) {
      setError(error.response?.data.message || "Error updating password.");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8081/api/user/update/user",
        { email: formData.email, username: formData.name },
        { withCredentials: true }
      );

      if (response.status === 202) {
        setSuccessMessage("Profile updated successfully!");
        fetchUserProfile();
      } else {
        setError("Failed to update profile.");
      }
    } catch (error) {
      setError(error.response?.data.message || "Error updating profile.");
    }
  };

  const isPasswordValid =
    passwordCriteria.length &&
    passwordCriteria.uppercase &&
    passwordCriteria.number &&
    passwordCriteria.specialChar;
  const renderContent = () => {
    switch (activeSection) {
      case "Edit Profile":
        return (
          <EditProfileSection
            success={success}
            error={error}
            formData={formData}
            setFormData={setFormData}
            handleUpdate={handleUpdate}
          />
        );
      case "Update Password":
        return (
          <UpdatePasswordSection
            success={success}
            error={error}
            OldPassword={OldPassword}
            setOldPassword={setOldPassword}
            NewPassword={NewPassword}
            handleChange={handleChange}
            passwordCriteria={passwordCriteria}
            isPasswordValid={isPasswordValid}
            updatePassword={updatePassword}
          />
        );
      case "Payment":
        return (
          <PaymentSection
            userId={profile._id}
            watchBy={watchBy}
            lastPayment={lastPayment}
          />
        );
      case "Online Devices":
        return (
          <OnlineDevicesSection
            watchBy={watchBy}
            onlineDevices={onlineDevices}
          />
        );
      default:
        return (
          <p>Welcome to the profile page. Select a section to view details.</p>
        );
    }
  };
  // console.log(profile?.isEmailVerified);

  return (
    <div className="min-h-screen bg-custom-dark-bg">
      <SidebarProvider>
        <div className="flex min-h-screen">
          <Sidebar className="w-64 border-r border-gray-800 bg-custom-dark-bg shadow-lg">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-semibold text-white">
                Profile Settings
              </h2>
            </div>
            <SidebarContent>
              <SidebarMenu>
                {/* Edit Profile Menu Item */}
                <SidebarMenuItem
                  className={`p-4 mb-2 transition-all rounded-lg ${
                    activeSection === "Edit Profile"
                      ? "bg-purple-500/20 text-purple-300"
                      : "hover:bg-purple-500/10 text-gray-300 hover:text-purple-300"
                  }`}
                  onClick={() => setActiveSection("Edit Profile")}
                >
                  <span className="flex items-center gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Edit Profile
                  </span>
                </SidebarMenuItem>

                {/* Update Password Menu Item */}
                <SidebarMenuItem
                  className={`p-4 mb-2 transition-all rounded-lg ${
                    activeSection === "Update Password"
                      ? "bg-purple-500/20 text-purple-300"
                      : "hover:bg-purple-500/10 text-gray-300 hover:text-purple-300"
                  }`}
                  onClick={() => setActiveSection("Update Password")}
                >
                  <span className="flex items-center gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Update Password
                  </span>
                </SidebarMenuItem>

                {!isAdmin && (
                  <>
                    {/* Payment Menu Item */}
                    <SidebarMenuItem
                      className={`p-4 mb-2 transition-all rounded-lg ${
                        activeSection === "Payment"
                          ? "bg-purple-500/20 text-purple-300"
                          : "hover:bg-purple-500/10 text-gray-300 hover:text-purple-300"
                      }`}
                      onClick={() => setActiveSection("Payment")}
                    >
                      <span className="flex items-center gap-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            x="1"
                            y="4"
                            width="22"
                            height="16"
                            rx="2"
                            ry="2"
                          ></rect>
                          <line x1="1" y1="10" x2="23" y2="10"></line>
                        </svg>
                        Payment
                      </span>
                    </SidebarMenuItem>

                    {/* Online Devices Menu Item */}
                    <SidebarMenuItem
                      className={`p-4 mb-2 transition-all rounded-lg ${
                        activeSection === "Online Devices"
                          ? "bg-purple-500/20 text-purple-300"
                          : "hover:bg-purple-500/10 text-gray-300 hover:text-purple-300"
                      }`}
                      onClick={() => setActiveSection("Online Devices")}
                    >
                      <span className="flex items-center gap-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            x="2"
                            y="3"
                            width="20"
                            height="14"
                            rx="2"
                            ry="2"
                          ></rect>
                          <line x1="8" y1="21" x2="16" y2="21"></line>
                          <line x1="12" y1="17" x2="12" y2="21"></line>
                        </svg>
                        Online Devices
                      </span>
                    </SidebarMenuItem>
                  </>
                )}

                {!isAdmin && (
                  <SidebarMenuItem className="p-4 mb-2 text-gray-300 hover:text-custom-light-purple hover:bg-custom-purple/10 rounded-lg transition-all">
                    <Link
                      to={`/transfer?email=${encodeURIComponent(email)}`} // Pass email as query param
                      className="flex flex-col items-start"
                    >
                      <div className="flex items-center gap-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                          <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        <span className="font-medium">Transfer Account</span>
                      </div>
                      <p className="text-blue-400 text-sm ml-7 mt-1">
                        Last changed:{" "}
                        {profileData?.userDetails.userTransfer
                          ? new Date(
                              profileData.userDetails.userTransfer
                            ).toLocaleDateString()
                          : "Not Available"}
                      </p>
                    </Link>
                  </SidebarMenuItem>
                )}

                {!isAdmin && (
                  <SidebarMenuItem className="p-4 mb-2 text-gray-300 hover:text-custom-light-purple hover:bg-custom-purple/10 rounded-lg transition-all">
                    <Link to="/" className="flex items-center gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg>
                      Go to Home Page
                    </Link>
                  </SidebarMenuItem>
                )}
                {isAdmin && (
                  <SidebarMenuItem className="p-4 mb-2 text-gray-300 hover:text-custom-light-purple hover:bg-custom-purple/10 rounded-lg transition-all">
                    <Link
                      to="/users/statics"
                      className="flex items-center gap-3"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg>
                      Go to Home Page
                    </Link>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>

          <main className="flex-1 p-8 bg-custom-dark-bg">
            <Card className="w-full max-w-4xl mx-auto shadow-xl bg-gray-900/50 backdrop-blur-sm border border-gray-800">
              <CardHeader className="p-8 border-b border-gray-800">
                <div className="flex items-center space-x-6">
                  <Avatar className="w-24 h-24 border-4 border-custom-purple shadow-lg">
                    <img
                      src="https://github.com/shadcn.png"
                      alt="Profile"
                      className="object-cover"
                    />
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-gray-300 text-2xl">
                        {profile.username}
                      </h1>
                      {profile?.isEmailVerified && <VerificationBadge />}
                    </div>
                    <p className="text-gray-400 mt-1">{profile.email}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
                      </svg>
                      <span
                        className={`px-2 py-1 text-sm font-semibold text-purple-800 bg-purple-200 rounded-full`}
                      >
                        {isAdmin ? "Admin Account" : "User Account"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">{renderContent()}</div>
              </CardContent>
              <CardFooter className="p-6 bg-gray-900/30 border-t border-gray-800">
                <p className="text-sm text-gray-400">
                  Last Profile Update:{" "}
                  <span className="font-medium text-custom-light-purple">
                    {profile.userUpdated
                      ? new Date(profile.userUpdated).toLocaleString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })
                      : "N/A"}
                  </span>
                </p>
              </CardFooter>
            </Card>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
