import React, { useState, useEffect } from "react";
import { toast, Toaster } from "sonner";
import { useQuery, useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, X } from "lucide-react";
import PlanForm from "./PlanUpdate";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import PlansSkeleton from "./PlansSkeleton";
import PlanActions from "./PlanActions";

// Fetch plans from API
const fetchPlans = async () => {
  const response = await fetch(
    "http://localhost:8081/api/payment/admin/plans",
    {
      credentials: "include",
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch plans.");
  }
  const data = await response.json();
  if (data && Array.isArray(data.plans)) {
    return data.plans;
  }
  throw new Error("Invalid data format");
};

// Delete a plan
const deletePlan = async (planId) => {
  const response = await fetch(
    `http://localhost:8081/api/payment/delete/plan/${planId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );
  if (!response.ok) {
    throw new Error("Failed to delete plan");
  }
};

// Toggle plan status (active/inactive)
const togglePlanStatus = async ({ planId, status }) => {
  // If status is already a boolean (true/false), no need to check for "active" or "inactive"
  if (typeof status !== "boolean") {
    throw new Error("Invalid status, must be true or false");
  }

  const response = await fetch(
    `http://localhost:8081/api/payment/plans/${planId}/${status}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );
  if (!response.ok) {
    throw new Error("Failed to update plan status");
  }
};

const Plans = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 2500); // 2.5 seconds delay
    return () => clearTimeout(timer);
  }, []);

  const {
    data: plans,
    isError,
    isLoading: queryLoading,
    refetch,
  } = useQuery({
    queryKey: ["plans"],
    queryFn: fetchPlans,
  });

  const isLoading = isInitialLoading || queryLoading;

  // Mutation for deleting a plan
  const deleteMutation = useMutation(deletePlan, {
    onSuccess: () => {
      toast.info("Plan deleted successfully", {
        duration: 4000,
      });
      refetch();
    },
    onError: (error) => {
      toast.info({
        variant: "destructive",
        title: "Error deleting plan",
        description: error.message || "Please try again later",
        duration: 4000,
      });
    },
  });

  // Mutation for toggling plan status
  const toggleStatusMutation = useMutation(togglePlanStatus, {
    onSuccess: () => {
      toast.info("Plan status updated successfully", {
        duration: 4000,
      });
      refetch();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error updating status",
        description: error.message || "Please try again later",
        duration: 4000,
      });
    },
  });

  // Handle deleting a plan
  const handleDelete = (planId) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      deleteMutation.mutate(planId);
    }
  };

  // Handle updating plan status
  const handleStatusChange = (planId, checked) => {
    toggleStatusMutation.mutate({ planId, status: checked });
  };

  // Handle editing a plan
  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setIsFormOpen(true);
  };

  if (isError) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          <h2 className="text-lg font-semibold">Error fetching plans</h2>
          <p>
            Please try again later or contact support if the issue persists.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <Toaster position="top-center" richColors />
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate("/users/statics")}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="h-6 w-6 text-gray-500" />
        </button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">
            Plans Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your subscription plans and pricing
          </p>
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Plan
        </Button>
      </div>

      <div className="bg-card rounded-xl shadow-xl overflow-hidden border border-border/50">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Price</TableHead>
                <TableHead className="font-semibold">Duration</TableHead>
                <TableHead className="font-semibold">Devices</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <PlansSkeleton />
              ) : (
                plans.map((plan) => (
                  <TableRow
                    key={plan.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell className="text-primary font-semibold">
                      ₹{plan.price}
                    </TableCell>
                    <TableCell>{plan.month} months</TableCell>
                    <TableCell>{plan.devices}</TableCell>
                    <TableCell>
                      <Switch
                        checked={plan.status}
                        onCheckedChange={(checked) =>
                          handleStatusChange(plan.id, checked)
                        }
                        className="data-[state=checked]:bg-primary"
                      />
                    </TableCell>
                    <TableCell>
                      <PlanActions
                        plan={plan}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <PlanForm
            plan={editingPlan}
            onClose={() => {
              setIsFormOpen(false);
              setEditingPlan(null);
            }}
            onSuccess={() => {
              refetch();
              setIsFormOpen(false);
              setEditingPlan(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Plans;
