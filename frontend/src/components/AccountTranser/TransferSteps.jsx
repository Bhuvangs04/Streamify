import { CheckCircle2, Mail, KeyRound, ArrowRight } from "lucide-react";
import EmailForm from "./EmailForm";
import OTPVerification from "./OTPVerification";
import TransferConfirmation from "./TransferConfirmation";
import { Stamp } from "@/components/ui/stamp";
import { cn } from "@/lib/utils";

const steps = [
  {
    id: 1,
    title: "Email Details",
    icon: Mail,
    description: "Enter email addresses",
  },
  {
    id: 2,
    title: "Verification",
    icon: KeyRound,
    description: "Enter OTP codes",
  },
  {
    id: 3,
    title: "Confirmation",
    icon: CheckCircle2,
    description: "Complete transfer",
  },
];

export default function TransferStepsPage({
  step,
  emails,
  onEmailsSubmit,
  onVerificationComplete,
  onTransferComplete,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
      {steps.map((s) => (
        <div
          key={s.id}
          className={cn(
            "relative group",
            s.id < step && "opacity-75",
            s.id > step && "opacity-50"
          )}
        >
          {s.id < step && (
            <Stamp>
              <div className="flex flex-col items-center rotate-10">
                <CheckCircle2 className="mt-2 w-6 h-3" />
                <span className="text-[10px] mt-0.5">DONE</span>
              </div>
            </Stamp>
          )}

          {s.id !== 3 && (
            <ArrowRight
              className={cn(
                "hidden md:block absolute -right-12 top-1/2 w-8 h-8 -translate-y-1/2 text-muted-foreground",
                s.id >= step && "opacity-30"
              )}
            />
          )}

          <div
            className={cn(
              "relative h-full bg-card rounded-lg border p-6 transition-all",
              s.id === step && "ring-2 ring-primary shadow-lg",
              s.id < step && "bg-muted/50"
            )}
          >
            <div className="flex items-center gap-4 mb-4">
              <div
                className={cn(
                  "p-2 rounded-full",
                  s.id === step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted-foreground/20"
                )}
              >
                <s.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.description}</p>
              </div>
            </div>

            <div
              className={cn(
                "transition-opacity",
                s.id !== step &&
                  "opacity-0 pointer-events-none absolute inset-0"
              )}
            >
              {s.id === 1 && <EmailForm onEmailsSubmit={onEmailsSubmit} />}
              {s.id === 2 && (
                <OTPVerification
                  currentEmail={emails.current}
                  newEmail={emails.new}
                  onVerificationComplete={onVerificationComplete}
                />
              )}
              {s.id === 3 && (
                <TransferConfirmation
                  currentEmail={emails.current}
                  newEmail={emails.new}
                  onTransferComplete={onTransferComplete}
                />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
