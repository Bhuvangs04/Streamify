import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image } from "lucide-react";

const MoviePosterUpload = ({
  onPosterSelect,
  posterPreview,
  selectedPoster,
}) => {
  const handlePosterSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onPosterSelect(file, reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="bg-[#222222] border-[#403E43]">
      <CardHeader>
        <CardTitle className="text-white">Movie Poster</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed border-[#403E43] rounded-lg p-8 text-center">
          <input
            type="file"
            accept="image/jpeg,image/jpg"
            onChange={handlePosterSelect}
            className="hidden"
            id="poster-upload"
          />
          <label
            htmlFor="poster-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            {posterPreview ? (
              <div className="relative w-full aspect-[2/3] bg-black rounded-lg overflow-hidden">
                <img
                  src={posterPreview}
                  alt="Movie poster preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <>
                <Image className="h-16 w-16 text-[#0FA0CE] mb-4" />
                <p className="text-lg mb-2">Upload movie poster (JPG)</p>
                <p className="text-sm text-gray-400">
                  or click to browse files
                </p>
              </>
            )}
          </label>
          {selectedPoster && (
            <p className="mt-4 text-sm text-gray-400">
              Selected: {selectedPoster.name}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MoviePosterUpload;
