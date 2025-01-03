import axios from "axios";

const CHUNK_SIZE = 2 * 1024 * 1024; // Reduced to 2MB chunks for better memory management

export const uploadMovieChunk = async (
  chunk,
  fileName,
  chunkIndex,
  totalChunks,
  movieId,
  title
) => {
  const chunkFormData = new FormData();
  chunkFormData.append("chunk", chunk);
  chunkFormData.append("fileName", fileName);
  chunkFormData.append("chunkIndex", String(chunkIndex));
  chunkFormData.append("totalChunks", String(totalChunks));
  chunkFormData.append("movieId", movieId);
  chunkFormData.append("title", title);

  await axios.post("http://localhost:8081/api/upload-chunk", chunkFormData, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  });
};

export const uploadPosterAndMetadata = async (formData) => {
  const response = await axios.post(
    "http://localhost:8081/api/upload-metadata",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    }
  );

  if (response.status !== 200) {
    throw new Error("Failed to upload poster and metadata.");
  }

  return {
    movieId: response.data.movieId,
    movieTitle: response.data.movietitle,
  };
};

export const calculateChunks = (fileSize) => {
  return Math.ceil(fileSize / CHUNK_SIZE);
};

export const getChunk = (file, chunkIndex) => {
  const start = chunkIndex * CHUNK_SIZE;
  const end = Math.min(start + CHUNK_SIZE, file.size);
  return file.slice(start, end);
};
