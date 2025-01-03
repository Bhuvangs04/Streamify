import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function UpdatePasswordSection({
  success,
  error,
  OldPassword,
  setOldPassword,
  NewPassword,
  handleChange,
  passwordCriteria,
  isPasswordValid,
  updatePassword,
}) {
  return (
    <div className="space-y-4">
      {success && (
        <div className="p-3 rounded-lg bg-green-500/10 text-green-500">
          {success}
        </div>
      )}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 text-red-500">{error}</div>
      )}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-200">
          Current Password
        </label>
        <Input
          type="password"
          value={OldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="bg-gray-800/50 border-gray-700"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-200">
          New Password
        </label>
        <Input
          type="password"
          name="NewPassword"
          value={NewPassword}
          onChange={handleChange}
          className="bg-gray-800/50 border-gray-700"
        />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-200">
          Password Requirements:
        </p>
        <ul className="space-y-1 text-sm">
          <li
            className={
              passwordCriteria.length ? "text-green-500" : "text-gray-400"
            }
          >
            • At least 8 characters
          </li>
          <li
            className={
              passwordCriteria.uppercase ? "text-green-500" : "text-gray-400"
            }
          >
            • At least one uppercase letter
          </li>
          <li
            className={
              passwordCriteria.number ? "text-green-500" : "text-gray-400"
            }
          >
            • At least one number
          </li>
          <li
            className={
              passwordCriteria.specialChar ? "text-green-500" : "text-gray-400"
            }
          >
            • At least one special character
          </li>
        </ul>
      </div>
      <Button
        onClick={updatePassword}
        disabled={!isPasswordValid}
        className="w-full"
      >
        Update Password
      </Button>
    </div>
  );
}
