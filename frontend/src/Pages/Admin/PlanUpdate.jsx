import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/hooks/use-toast";

const PlanForm = ({ plan, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    price: "",
    month: "",
    description: "",
    devices: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (plan) {
      setFormData(plan);
    }
  }, [plan]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = plan
        ? `http://localhost:8081/api/payment/update/plan/current/${plan.id}`
        : "http://localhost:8081/api/payment/plans/new";
      const response = await fetch(url, {
        method: plan ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      if (response.ok) {
        toast({
          title: `Plan ${plan ? "updated" : "added"} successfully`,
        });
        onSuccess();
      } else {
        throw new Error("Failed to save plan");
      }
    } catch (error) {
      console.error("Error saving plan:", error);
      toast({
        variant: "destructive",
        title: "Error saving plan",
        description: "Please try again later",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="id">Plan ID</Label>
        <Input
          id="id"
          name="id"
          value={formData.id}
          onChange={handleChange}
          required
          disabled={!!plan} // Disable if plan exists (updating)
          className={plan ? "cursor-not-allowed text-white-200" : ""}
          placeholder={plan ? "ID cannot be changed" : "Enter plan ID"}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Enter plan name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price</Label>
        <Input
          id="price"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          required
          min="0"
          step="0.01"
          placeholder="Enter price"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="month">Duration (Please enter month/Year full)</Label>
        <Input
          id="month"
          name="month"
          type="text"
          value={formData.month}
          onChange={handleChange}
          required
          placeholder="Enter duration in months"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="devices">Number of Devices</Label>
        <Input
          id="devices"
          name="devices"
          type="number"
          value={formData.devices}
          onChange={handleChange}
          required
          min="1"
          placeholder="Enter number of devices"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          placeholder="Enter plan description"
          className="min-h-[100px]"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="hover:bg-red-500"
        >
          Cancel
        </Button>
        <Button type="submit" className="bg-primary hover:bg-primary/90">
          {plan ? "Update" : "Add"} Plan
        </Button>
      </div>
    </form>
  );
};

export default PlanForm;
