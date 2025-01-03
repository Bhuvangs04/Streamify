import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const PlansSkeleton = () => {
  return Array(5)
    .fill(null)
    .map((_, index) => (
      <tr key={index} className="animate-pulse">
        <td className="p-4">
          <Skeleton className="h-6 w-32" />
        </td>
        <td className="p-4">
          <Skeleton className="h-6 w-20" />
        </td>
        <td className="p-4">
          <Skeleton className="h-6 w-24" />
        </td>
        <td className="p-4">
          <Skeleton className="h-6 w-16" />
        </td>
        <td className="p-4">
          <Skeleton className="h-6 w-12" />
        </td>
        <td className="p-4">
          <div className="flex space-x-2">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </td>
      </tr>
    ));
};

export default PlansSkeleton;
