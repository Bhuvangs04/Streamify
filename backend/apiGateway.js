const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const cluster = require("cluster");
const os = require("os");
const cronJobs = require("./services/Clean");

// Route Handlers
const user = require("./routes/User");
const admin = require("./routes/admin");
const create = require("./routes/Create");
const login = require("./routes/Login");
const payRoute = require("./routes/PayRoute");
const report = require("./routes/Report");
const movie = require("./routes/movies");

const PORT = process.env.PORT || 8081;

// Database Connection with Retry Logic
async function connectToDatabase(retries = 5) {
  while (retries) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
      });
      console.log("MongoDB connected successfully");
      break;
    } catch (error) {
      console.error("MongoDB connection error:", error.message);
      retries -= 1;
      console.log(`Retries left: ${retries}`);
      if (retries === 0) throw new Error("MongoDB connection failed");
      await new Promise((res) => setTimeout(res, 15000));
    }
  }
}

// Middleware and App Configuration
const app = express();

// Middleware for Security and Logging
app.use(express.json({ limit: "5gb" }));
app.use(express.urlencoded({ limit: "5gb", extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
    },
  })
);
app.use(morgan("dev"));

// CORS Configuration
const corsOptions = {
  origin: ["http://localhost:5173"],
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

// Serve Static Files with Headers
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));


// Define Routes
app.use("/api/netflix", login);
app.use("/api/admin", admin);
app.use("/api/user", user);
app.use("/api/payment", payRoute);
app.use("/api", movie);
app.use("/api/netflix/new", create);
app.use("/api/admin/reports", report);

// Global Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "An unexpected error occurred" });
});

// Cluster Setup
// if (cluster.isMaster) {
//   const numCPUs = Math.max(1, os.cpus().length );
//   console.log(`Master process started. Forking ${numCPUs} workers.`);

//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork();
//   }

//   cluster.on("exit", (worker, code, signal) => {
//     console.log(
//       `Worker ${worker.process.pid} exited. Code: ${code}, Signal: ${signal}`
//     );
//     console.log("Starting a new worker...");
//     cluster.fork();
//   });
//}
  cronJobs();
  connectToDatabase().then(() => {
      app.listen(PORT,() => {
        console.log(`Workeris running on http://localhost:${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Failed to start server:", error.message);
      process.exit(1);
    })
