const cron = require("node-cron");
const UserDevice = require("../models/Device");
const otpSchema = require("../models/Otp");
const payHistorySchema = require("../models/payhistory");
dotenv = require("dotenv");

const BATCH_SIZE = 2; // Define a batch size for all operations

async function cleanupExpiredOtps() {
  try {
    const now = new Date();
    let skip = 0;
    let hasMore = true;

    while (hasMore) {
      const expiredOtps = await otpSchema
        .find({
          isVerified: "false",
          expiresAt: { $lt: now },
        })
        .skip(skip)
        .limit(BATCH_SIZE);

      if (expiredOtps.length === 0) {
        hasMore = false;
        break;
      }

      const idsToDelete = expiredOtps.map((otp) => otp._id);
      const result = await otpSchema.deleteMany({ _id: { $in: idsToDelete } });

      console.log(
        `[${new Date().toISOString()}] Deleted ${
          result.deletedCount
        } expired OTPs.`
      );

      skip += BATCH_SIZE;
    }
  } catch (err) {
    console.error(
      `[${new Date().toISOString()}] Error during cleanupExpiredOtps:`,
      err
    );
  }
}

async function updateInactiveDevices() {
  try {
    const inactivityPeriod = process.env.INACTIVITY_PERIOD || 60 * 60 * 1000; // 10 minutes
    const now = new Date();
    let skip = 0;
    let hasMore = true;

    while (hasMore) {
      const inactiveDevices = await UserDevice.find({
        isActive: true,
        lastAccessed: { $lt: new Date(now - inactivityPeriod) },
      })
        .skip(skip)
        .limit(BATCH_SIZE);

      if (inactiveDevices.length === 0) {
        hasMore = false;
        break;
      }

      const idsToUpdate = inactiveDevices.map((device) => device._id);
      const result = await UserDevice.updateMany(
        { _id: { $in: idsToUpdate } },
        { $set: { isActive: false } }
      );

      console.log(
        `[${new Date().toISOString()}] Marked ${
          result.modifiedCount
        } devices as inactive.`
      );

      skip += BATCH_SIZE;
    }
  } catch (err) {
    console.error(
      `[${new Date().toISOString()}] Error during updateInactiveDevices:`,
      err
    );
  }
}

async function updateFailedPayments() {
  try {
    const now = new Date();
    let skip = 0;
    let hasMore = true;

    while (hasMore) {
      const pendingPayments = await payHistorySchema
        .find({
          status: "pending",
          updatedAt: { $lt: now },
        })
        .skip(skip)
        .limit(BATCH_SIZE);

      if (pendingPayments.length === 0) {
        hasMore = false;
        break;
      }

      const idsToUpdate = pendingPayments.map((payment) => payment._id);
      const result = await payHistorySchema.updateMany(
        { _id: { $in: idsToUpdate } },
        { $set: { status: "failed" } }
      );

      console.log(
        `[${new Date().toISOString()}] Marked ${
          result.modifiedCount
        } pending payments as failed.`
      );

      skip += BATCH_SIZE;
    }
  } catch (err) {
    console.error(
      `[${new Date().toISOString()}] Error during updateFailedPayments:`,
      err
    );
  }
}

function cronJobs() {
  let isRunning = false;

  const task = cron.schedule("*/10 * * * *", async () => {
    if (isRunning) {
      console.log(
        `[${new Date().toISOString()}] Previous task still running, skipping...`
      );
      return;
    }

    isRunning = true;
    try {
      console.log(`[${new Date().toISOString()}] Starting cron job...`);
      await updateFailedPayments();
      await cleanupExpiredOtps();
      await updateInactiveDevices();
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Error in cron jobs:`, err);
    } finally {
      isRunning = false;
      console.log(`[${new Date().toISOString()}] Cron job completed.`);
    }
  });

  process.on("SIGINT", () => {
    console.log("Shutting down cron job...");
    task.stop();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("Shutting down cron job...");
    task.stop();
    process.exit(0);
  });
}

module.exports = cronJobs;
