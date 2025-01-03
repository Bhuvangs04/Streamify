import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/hooks/use-toast";
import axios from "axios";

function maskEmail(email) {
  if (!email) return "";
  const [localPart, domain] = email.split("@");
  const visiblePart = localPart.slice(0, 3); // Show the first 2 or 3 letters
  const maskedPart = "*".repeat(localPart.length - visiblePart.length);
  return `${visiblePart}${maskedPart}@${domain}`;
}

const UserDetailsModal = ({ isOpen, onClose, userDetails }) => {
  const [emailContent, setEmailContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSendEmail = async () => {
    if (!emailContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email message",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      await axios.post(
        `http://localhost:8081/api/admin/reports/send-email/${userDetails._id}`,
        {
          content: emailContent,
        },
        {
          withCredentials: true,
        }
      );
      toast({
        title: "Email Sent",
        description: "Email has been sent successfully to the user.",
      });
      setEmailContent("");
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Name</h3>
            <p className="text-gray-300">{userDetails?.username}</p>
          </div>
          <div>
            <h3 className="font-medium">Email</h3>
            <p className="text-gray-300">{maskEmail(userDetails?.email)}</p>
          </div>

          <div>
            <h3 className="font-medium">User Status</h3>
            <p className="text-gray-300">
              {userDetails?.userBlocked === "unBlocked" ? "Active" : "Blocked"}
            </p>
          </div>
          <div>
            <h3 className="font-medium">Last Payment</h3>
            <p className="text-gray-300">
              {userDetails?.lastPaymentDate
                ? new Date(userDetails.lastPaymentDate).toLocaleDateString()
                : "No payment record"}
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Send Email</h3>
            <Input
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              placeholder="Type your message..."
              className="bg-gray-700 border-gray-600"
              disabled={isSending}
            />
            <Button
              onClick={handleSendEmail}
              className="w-full"
              disabled={isSending}
            >
              {isSending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Mail className="mr-2 h-4 w-4" />
              )}
              {isSending ? "Sending..." : "Send Email"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
