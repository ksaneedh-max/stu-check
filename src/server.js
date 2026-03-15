const app = require("./app");
const { startBrowser, getContext } = require("./browser/browserManager");
const { PORT } = require("./config/env");

const port = PORT || process.env.PORT || 3000;

const server = app.listen(port, async () => {
  console.log("Server running on port", port);

  try {
    await startBrowser();
    console.log("Browser started successfully");
  } catch (err) {
    console.error("Browser launch failed:", err);
  }
});

async function shutdown() {
  console.log("Shutting down server...");

  try {
    const context = getContext();
    if (context) {
      await context.browser()?.close();
    }
  } catch (err) {
    console.log("Error closing browser:", err.message);
  }

  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

module.exports = server;
