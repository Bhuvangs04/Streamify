import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function EditProfileSection({
  success,
  error,
  formData,
  setFormData,
  handleUpdate,
}) {
  return (
    <form onSubmit={handleUpdate} className="space-y-4">
      {success && (
        <div className="p-3 rounded-lg bg-green-500/10 text-green-500">
          {success}
        </div>
      )}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 text-red-500">{error}</div>
      )}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-200">Username</label>
        <Input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="bg-gray-800/50 border-gray-700"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-200">Email</label>
        <Input
          type="email"
          disabled="true"
          value={formData.email}
          className="bg-gray-800/50 border-gray-700"
        />
        <h6 className="text-muted" style={{ color: "red" }}>
          Email cannot be changed.
        </h6>{" "}
        <h9 className="text-muted" style={{ color: "red" }}>
          It only can be transferred to another account.
        </h9>
      </div>
      <Button type="submit" className="w-full">
        Update Profile
      </Button>
    </form>
  );
}
