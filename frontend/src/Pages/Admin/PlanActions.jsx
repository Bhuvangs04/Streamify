import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, User } from "lucide-react";
import UserDetailsModal from "./Details";

const PlanActions = ({ plan, onEdit, onDelete }) => {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  return (
    <>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onEdit(plan)}
          className="hover:bg-primary/10 hover:text-primary"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => onDelete(plan.id)}
          className="hover:bg-destructive/90"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsUserModalOpen(true)}
          className="hover:bg-primary/10 hover:text-primary"
        >
          <User className="h-4 w-4" />
        </Button>
      </div>

      <UserDetailsModal
        planId={plan.id}
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
      />
    </>
  );
};

export default PlanActions;
