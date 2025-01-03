import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";

const MovieDetailsForm = ({ formData, onChange, onSubmit, uploading }) => {
  return (
    <Card className="bg-[#222222] border-[#403E43]">
      <CardHeader>
        <CardTitle className="text-white">Movie Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Title</label>
            <Input
              name="title"
              value={formData.title}
              onChange={onChange}
              className="bg-[#1A1F2C] border-[#403E43] text-white"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              Description
            </label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={onChange}
              className="bg-[#1A1F2C] border-[#403E43] text-white"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Director</label>
            <Input
              name="director"
              value={formData.director}
              onChange={onChange}
              className="bg-[#1A1F2C] border-[#403E43] text-white"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Release Year
              </label>
              <Input
                name="releaseYear"
                type="number"
                value={formData.releaseYear}
                onChange={onChange}
                className="bg-[#1A1F2C] border-[#403E43] text-white"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Genre</label>
              <Input
                name="genre"
                value={formData.genre}
                onChange={onChange}
                className="bg-[#1A1F2C] border-[#403E43] text-white"
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-[#0FA0CE] hover:bg-[#0FA0CE]/90 text-white"
            disabled={uploading}
          >
            {uploading ? (
              <div className="flex items-center">
                <Upload className="animate-spin mr-2 h-4 w-4" />
                Uploading...
              </div>
            ) : (
              "Upload Movie"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MovieDetailsForm;
