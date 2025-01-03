const autocannon = require("autocannon");

const url = "http://localhost:8081/api/user/profile";
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzY3ZmVmNTUyZDViYjVjYmE2NjJhYmIiLCJ1c2VybmFtZSI6IkJodXZhbiIsImVtYWlsIjoiYmh1dmk0NjYyQGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzM1MzYxNjgyLCJleHAiOjE3MzUzNzk2ODJ9.9ZnH8qGBLiBb_bX-4QMiFg5Nf2ueOH-613aR1QjfYTM";

const instance = autocannon(
  {
    url,
    connections: 100, // Reduced for local testing
    duration: 60, // Test duration in seconds
    headers: {
      Cookie: `token=${token}`, // Pass token as a Cookie
    },
    requests: [
      {
        method: "GET",
        headers: {
          Cookie: `token=${token}`, // Pass token as a Cookie
        },
      },
    ],
  },
  (err, result) => {
    if (err) {
      console.error("Error during load test:", err);
    } else {
      console.log("Load test completed successfully:");
      console.log(JSON.stringify(result, null, 2)); // Pretty-print results
    }
  }
);

autocannon.track(instance, {
  renderProgressBar: true,
  renderResultsTable: true,
  renderLatencyTable: true,
});

instance.on("done", () => {
  console.log("Load test finished.");
});

instance.on("response", (client, statusCode, resBytes, responseTime) => {
  console.log(
    `Response: statusCode=${statusCode}, responseTime=${responseTime}ms`
  );
});

instance.on("error", (err) => {
  console.error("Error during load test:", err);
});

process.on("SIGINT", () => {
  console.log("Stopping the load test...");
  instance.stop();
});
