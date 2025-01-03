const express = require("express");
const multer = require("multer");
const path = require("path");
const movieSchema = require("../models/Movies");
const fs = require("fs");
const { pipeline } = require("stream");
const router = express.Router();
const historySchema = require("../models/History");
const paymentSchema = require("../models/Payment");
const userSchema = require("../models/User");
const { addToQueue } = require("../services/videoqueue");
const checkAdmin = require("../middleware/Admin");
const userDeviceSchema = require("../models/Device");
const {
  verifyAdmin,
  verifyToken,
  decodeDeviceToken,
} = require("../middleware/verify");

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const title = req.body.title;
      const uniqueFolder = `${title}`;

      // Define the folder path
      const folderPath = path.join(__dirname, "../uploads", uniqueFolder);

      // Create the folder if it doesn't exist
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      cb(null, folderPath); // Store the file in the folder
    } catch (err) {
      cb(err, false);
    }
  },
  filename: (req, file, cb) => {
    // Set a unique filename for each uploaded file
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
// File filter to allow only specific mime types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["video/mp4", "image/jpg", "image/jpeg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(
      new Error("Invalid file type. Only MP4 and JPEG files are allowed."),
      false
    );
  }
};
const upload = multer({
  dest: "temp/",
  limits: {
    fileSize: 5 * 1024 * 1024 * 1024, // 5GB limit
  },
}); // Temporary storage for file chunks
router.use("/uploads", express.static(path.join(__dirname, "../uploads")));



router.post(
  "/upload-metadata",
  verifyAdmin,
  verifyToken,
  checkAdmin,
  upload.single("poster"),
  async (req, res) => {
    try {
      const { title, description, genre, director, releaseYear } = req.body;
      const posterFile = req.file;

      if (!title || !posterFile) {
        return res.status(400).json({
          success: false,
          message: "Title and poster are required.",
        });
      }

      // Define folder and poster path
      const uniqueFolder = `${title}`;
      const folderPath = path.join(__dirname, "../uploads", uniqueFolder);

      // Create the folder if it doesn't exist
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      // Move the poster file to the movie's folder
      const posterPath = path.join(folderPath, `poster-${posterFile.filename}`);
      fs.renameSync(posterFile.path, posterPath);

      // Save the movie metadata in the database
      const movie = new movieSchema({
        title,
        description,
        genre,
        releaseYear,
        director,
        poster: {
          url: path.join("/uploads", uniqueFolder, path.basename(posterPath)),
        },
        resolutions: [],
        status: "waiting_for_video", // Status until video upload is complete
      });

      await movie.save();

      res.status(200).json({
        success: true,
        message: "Metadata and poster uploaded successfully.",
        movieId: movie._id,
        movietitle: movie.title,
      });
    } catch (err) {
      console.error("Error uploading metadata:", err);
      res
        .status(500)
        .json({ success: false, message: "Metadata upload failed." });
    }
  }
);

// Route for handling chunked video uploads
router.post(
  "/upload-chunk",
  verifyAdmin,
  verifyToken,
  checkAdmin,
  upload.single("chunk"),
  async (req, res) => {
    try {
      const { chunkIndex, totalChunks, fileName, movieId, title } = req.body;
      const chunkFile = req.file;

      // Validate request body and file
      if (
        !chunkFile ||
        !movieId ||
        !fileName ||
        !title ||
        !chunkIndex ||
        !totalChunks
      ) {
        return res.status(400).json({
          success: false,
          message: "Missing required parameters.",
        });
      }

      // Define folder for temporary chunk storage
      const tempFolder = path.join(__dirname, "../temp", movieId);
      if (!fs.existsSync(tempFolder)) {
        fs.mkdirSync(tempFolder, { recursive: true });
      }

      // Move chunk to temporary folder
      const chunkPath = path.join(tempFolder, `chunk-${chunkIndex}`);
      fs.renameSync(chunkFile.path, chunkPath);

      // Check if all chunks are uploaded
      const uploadedChunks = fs
        .readdirSync(tempFolder)
        .filter((file) => file.startsWith("chunk-"));

      if (uploadedChunks.length === parseInt(totalChunks)) {
        // Combine all chunks into the final video file
        const movieFolder = path.join(__dirname, "../uploads", title);
        if (!fs.existsSync(movieFolder)) {
          fs.mkdirSync(movieFolder, { recursive: true });
        }

        const finalVideoPath = path.join(movieFolder, fileName);
        const writeStream = fs.createWriteStream(finalVideoPath);

        for (let i = 0; i < totalChunks; i++) {
          const chunkPath = path.join(tempFolder, `chunk-${i}`);
          const chunkData = fs.readFileSync(chunkPath);
          writeStream.write(chunkData);
          fs.unlinkSync(chunkPath); // Delete chunk after writing
        }

        writeStream.end();

        // Cleanup temp folder
        try {
          const remainingFiles = fs.readdirSync(tempFolder);
          if (remainingFiles.length > 0) {
            console.log(
              "Remaining files in temp folder before deletion:",
              remainingFiles
            );
          }
          fs.rmSync(tempFolder, { recursive: true, force: true });
        } catch (cleanupErr) {
          console.error("Failed to clean up temp folder:", cleanupErr);
        }

        // Update movie status and add encoding job to the queue
        const movie = await movieSchema.findById(movieId);
        if (!movie) {
          return res
            .status(404)
            .json({ success: false, message: "Movie not found." });
        }

        movie.status = "queued";
        await movie.save();

        addToQueue({
          type: "video",
          title: movie.title,
          movieId: movie._id,
          inputFilePath: finalVideoPath,
          resolutions: [
            { quality: "1080p", width: 1920, height: 1080 },
            { quality: "720p", width: 1280, height: 720 },
          ],
        });

        res.status(200).json({
          success: true,
          message: "All chunks uploaded and video file created.",
          movie,
        });
      } else {
        // If not all chunks are uploaded yet
        res.status(200).json({
          success: true,
          message: "Chunk uploaded successfully.",
          uploadedChunks: uploadedChunks.length,
          totalChunks,
        });
      }
    } catch (err) {
      console.error("Error handling chunk upload:", err);
      res.status(500).json({ success: false, message: "Chunk upload failed." });
    }
  }
);

// Route to upload a movie, trailer, and poster
router.post(
  "/upload",verifyAdmin,verifyToken,checkAdmin,
  upload.fields([{ name: "video" }, { name: "poster" }]),
  async (req, res) => {
    const { title, description, genre, director, releaseYear } = req.body;

    const videoFile = req.files["video"] ? req.files["video"][0] : null;
    const posterFile = req.files["poster"] ? req.files["poster"][0] : null;

    if (!videoFile) {
      return res
        .status(400)
        .json({ success: false, message: "Video file is required" });
    }

    try {
      const movie = new movieSchema({
        title,
        description,
        genre,
        releaseYear,
        director,
        poster: posterFile
          ? { url: path.join("/uploads", `${title}`, posterFile.filename) }
          : null,
        resolutions: [],
        status: "queued",
      });

      await movie.save();

      // Here, we define a new Promise to handle the file stream
      const videoFilePath = videoFile.path;
      const destinationPath = path.join(
        __dirname,
        "../uploads",
        `${title}`,
        videoFile.filename
      );

      // This will return a promise that resolves when the file is fully written
      const streamPromise = new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(videoFilePath);
        const writeStream = fs.createWriteStream(destinationPath);

        // Use pipeline to stream the video file to the destination folder
        pipeline(readStream, writeStream, (err) => {
          if (err) {
            reject(err); // Reject the promise if there's an error in the stream
          } else {
            resolve(destinationPath); // Resolve the promise when the write is complete
          }
        });
      });

      // Wait until the video file has been fully written to disk
      const finalVideoPath = await streamPromise;

      // Once the file is successfully written, add the encoding job to the queue
      addToQueue({
        type: "video",
        title,
        movieId: movie._id,
        inputFilePath: finalVideoPath,
        resolutions: [
          { quality: "1080p", width: 1920, height: 1080 },
          { quality: "720p", width: 1280, height: 720 },
        ],
      });

      res.json({
        success: true,
        message: "Files uploaded successfully. Encoding will start shortly.",
        movie,
      });
    } catch (err) {
      console.error("Error uploading files:", err);
      res.status(500).json({ success: false, message: "File upload failed." });
    }
  }
);
router.post(
  "/publish/:input/:movieId/final",
  verifyAdmin,
  checkAdmin,
  async (req, res) => {
    try {
      const { movieId, input } = req.params;
      if (input !== "true" && input !== "false") {
        return res
          .status(400)
          .json({ message: "Invalid input value for publish status" });
      }
      const movie = await movieSchema.findById(movieId);
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }

      const updatedMovie = await movieSchema.findByIdAndUpdate(
        movieId,
        { publish: input },
        { new: true }
      );
      return res.status(200).json({
        message: `Publish status updated to ${updatedMovie.publish}`,
        publish: updatedMovie.publish,
      });
    } catch (error) {
      console.error("Error updating publish status:", error);
      return res
        .status(500)
        .json({ message: "Something went wrong, please try again later." });
    }
  }
);


router.get("/movies", verifyToken, async (req, res) => {
  try {
    const movies = await movieSchema.find({ publish :"true"});
    res.status(200).json({ success: true, movies });
  } catch (err) {
    console.error("Error fetching movies:", err);
    res.status(500).send("Error fetching movies.");
  }
});

router.get("/keys", verifyToken, decodeDeviceToken, async (req, res) => {
  const userId = req.user.userId;
  const userRole = req.user.role;
  const deviceToken = req.headers["authorization"];
  const { movieId, resolution } = req.query;

  if (!deviceToken) {
    return res.status(401).json({ status: false, message: "Unauthorized." });
  }

  try {
    // If the user's role is admin, bypass all checks and send the key path directly
    if (userRole === "admin") {
      const movie = await movieSchema.findOne({ _id: movieId });
      if (!movie) {
        return res
          .status(404)
          .json({ status: false, message: "Movie not found." });
      }

      const keyPath = path.join(
        __dirname,
        "uploads",
        movie.title,
        movieId,
        "chunks",
        resolution,
        "encryption.key"
      );

      return res.json({
        status: true,
        message: "Key access granted.",
        fileUrl: keyPath,
      });
    }

    // Check if the device token is associated with the correct user
    if (req.deviceDetails.userId !== req.user.userId) {
      return res
        .status(403)
        .json({ status: false, message: "Unauthorized device access." });
    }

    // Fetch the user's payment details
    const userPaymentDetails = await paymentSchema.findOne({ userId });

    // If no payment details are found or payment expired, respond with a message
    if (!userPaymentDetails) {
      return res
        .status(400)
        .json({ status: false, message: "Please update the payment details." });
    }

    // Check if the user's last payment date is within the allowed range
    const user = await userSchema.findById({ _id: userId });
    if (user) {
      const currentDate = new Date();
      const lastPaymentDate = new Date(user.lastPaymentDate);
      const diffInDays = Math.floor(
        (currentDate - lastPaymentDate) / (1000 * 3600 * 24)
      );
      if (diffInDays >= 35) {
        return res.status(400).json({
          status: false,
          message: "Please update the payment details.",
        });
      }
    } else {
      return res
        .status(404)
        .json({ status: false, message: "User not found." });
    }

    // Check if the user has already exceeded the allowed number of active devices
    const activeDevices = await userDeviceSchema.find({
      userId,
      isActive: true,
    });
    const userLimit = await paymentSchema.findOne({ userId });

    // Check if the user has reached their device limit
    if (userLimit && activeDevices.length > userLimit.WatchBy) {
      return res.status(400).json({
        status: false,
        message: `Your device limit ${userLimit.WatchBy} at a time.`,
      });
    }

    // Check if the device is actively streaming and authorized
    const activeDevice = await userDeviceSchema.findOne({
      userId: req.deviceDetails.userId,
      deviceId: req.deviceDetails.deviceId,
      isActive: true,
    });

    if (!activeDevice) {
      return res.status(403).json({
        status: false,
        message: "Device not authorized to access encryption key.",
      });
    }

    // Update the last accessed time for the device
    activeDevice.lastAccessed = Date.now();
    await activeDevice.save();

    // Validate the movie and resolution
    const movie = await movieSchema.findOne({ _id: movieId });
    if (!movie) {
      return res
        .status(404)
        .json({ status: false, message: "Movie not found." });
    }

    // Log the history of the user watching the movie
    const History = new historySchema({ userId, historyId: movieId });
    await History.save();

    // Construct the path to the encryption key
    const keyPath = path.join(
      __dirname,
      "uploads",
      movie.title,
      movieId,
      "chunks",
      resolution,
      "encryption.key"
    );
    // Send the encryption key file
    return res.json({
      status: true,
      message: "Key access granted.",
    });
  } catch (err) {
    console.error("Error serving encryption key:", err);
    return res.status(500).json({ status: false, message: "Server error." });
  }
});



module.exports = router;
