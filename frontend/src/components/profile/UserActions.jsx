import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const UserActions = ({
  user,
  processingUserId,
  onSendReminder,
  onBlockUser,
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="outline"
        className="bg-black text-white hover:bg-gray-800"
        disabled={processingUserId === user._id}
      >
        {processingUserId === user._id ? "Processing..." : "Actions"}
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem
        onClick={() => onSendReminder(user._id)}
        disabled={processingUserId === user._id}
      >
        Send Reminder
      </DropdownMenuItem>
      {user.userBlocked === "unBlocked" ? (
        <DropdownMenuItem
          onClick={() => onBlockUser("Blocked", user._id)}
          disabled={processingUserId === user._id}
          className="text-red-600 hover:text-red-700"
        >
          Block User
        </DropdownMenuItem>
      ) : (
        <DropdownMenuItem
          onClick={() => onBlockUser("unBlocked", user._id)}
          disabled={processingUserId === user._id}
          className="text-red-600 hover:text-red-700"
        >
          Activate User
        </DropdownMenuItem>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
);
