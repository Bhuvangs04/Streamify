import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { User, Mail, Lock, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CreateAccountPage() {
  const navigate = useNavigate(); // Initialize navigate

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    number: false,
    specialChar: false,
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      setPasswordCriteria({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        number: /[0-9]/.test(value),
        specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      });
    }
  };

  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage("");

    try {
      await axios.post(
        "http://localhost:8081/api/netflix/new/admin-account",
        formData,
        {
          withCredentials: true,
        }
      );
      navigate("/"); // Navigate to login page after successful submission
    } catch (error) {
      setErrorMessage(
        error.response?.data || "An error occurred. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const CriteriaIcon = ({ met }) =>
    met ? (
      <CheckCircle className="h-4 w-4 text-green-500 animate-in fade-in-50 duration-300" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500 animate-in fade-in-50 duration-300" />
    );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 relative">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-2xl blur-3xl animate-gradient" />

        <div className="relative bg-card p-8 rounded-xl shadow-2xl border border-border/50 backdrop-blur-xl animate-in fade-in-50 duration-500 slide-in-from-bottom-10">
          <div className="flex flex-col space-y-2 text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
              Create Admin Account
            </h1>
            <p className="text-muted-foreground">
              Join our MiniNetflix community today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Username Field */}
              <div className="relative group">
                <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  className="pl-10 transition-all border-border/50 focus:border-primary"
                  required
                />
              </div>

              {/* Email Field */}
              <div className="relative group">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 transition-all border-border/50 focus:border-primary"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 transition-all border-border/50 focus:border-primary"
                  required
                />
              </div>

              {/* Password Criteria */}
              <div className="bg-card/50 p-4 rounded-lg border border-border/50">
                <h3 className="text-sm font-medium mb-2 text-muted-foreground">
                  Password Requirements:
                </h3>
                <ul className="space-y-2 text-sm">
                  {Object.entries({
                    "Minimum 8 characters": passwordCriteria.length,
                    "One uppercase letter": passwordCriteria.uppercase,
                    "One number": passwordCriteria.number,
                    "One special character": passwordCriteria.specialChar,
                  }).map(([text, met]) => (
                    <li key={text} className="flex items-center space-x-2">
                      <CriteriaIcon met={met} />
                      <span className={met ? "text-green-500" : "text-red-500"}>
                        {text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {errorMessage && (
              <Alert
                variant="destructive"
                className="animate-in fade-in-50 slide-in-from-top-5"
              >
                {errorMessage}
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full relative overflow-hidden group"
              disabled={isProcessing || !isPasswordValid}
            >
              {isProcessing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Create Account"
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateAccountPage;
