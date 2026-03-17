const app = require("./app");

const {
  startBrowser,
  shutdownBrowser,
  sessionCount
} = require("./browser/browserManager");

const { PORT } = require("./config/env");

const port = PORT || process.env.PORT || 3000;

/* ---------- START SERVER ---------- */

const server = app.listen(port, async () => {

  console.log("Server running on port", port);

  try {

    await startBrowser();

    console.log("Playwright browser started");

  } catch (err) {

    console.error("Browser launch failed:", err);

  }

});


/* ---------- GRACEFUL SHUTDOWN ---------- */

async function shutdown() {

  console.log("Shutting down server...");

  try {

    console.log("Active browser sessions:", sessionCount());

    await shutdownBrowser();

    console.log("Browser closed successfully");

  } catch (err) {

    console.log("Error closing browser:", err.message);

  }

  server.close(() => {

    console.log("HTTP server closed");

    process.exit(0);

  });

}


/* ---------- SIGNAL HANDLERS ---------- */

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);


/* ---------- UNCAUGHT ERROR HANDLING ---------- */

process.on("uncaughtException", (err) => {

  console.error("Uncaught Exception:", err);

  shutdown();

});

process.on("unhandledRejection", (reason) => {

  console.error("Unhandled Rejection:", reason);

  shutdown();

});


/* ---------- EXPORT ---------- */

module.exports = server;