import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function LogsTable({ logs }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Old Email</TableHead>
            <TableHead>New Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Changed At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs?.map((log) => (
            <TableRow key={log._id}>
              <TableCell className="font-medium">
                {log.userId.username}
              </TableCell>
              <TableCell>{log.oldEmail}</TableCell>
              <TableCell>{log.newEmail}</TableCell>
              <TableCell>
                <Badge
                  variant={log.userId.userBlocked ? "success" : "destructive"}
                  className="capitalize"
                >
                  {log.userId.userBlocked === "unBlocked"
                    ? "Active"
                    : "Blocked"}
                </Badge>
              </TableCell>
              <TableCell>
                {format(new Date(log.userId.userTransfer), "PPpp")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
