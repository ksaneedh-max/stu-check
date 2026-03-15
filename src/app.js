const express = require("express");
const session = require("express-session");

const loginRoutes = require("./modules/login/login.route");
const logoutRoutes = require("./modules/logout/logout.route");
const attendanceRoutes = require("./modules/attendance/attendance.route");
const marksRoutes = require("./modules/marks/marks.route");

const { isLoggedIn } = require("./modules/login/login.service");

const {
  createSession,
  getPage,
  touchSession
} = require("./browser/browserManager");

const app = express();

/* ---------- MIDDLEWARE ---------- */

app.use(express.json());
app.use(express.static("public"));

/* ---------- SESSION SETUP ---------- */

app.use(
  session({
    secret: "srm-dashboard-secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // change to true if using HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
  })
);

/* ---------- REQUEST LOGGER ---------- */

app.use((req, res, next) => {

  const sessionId = req.session?.id;

  console.log(
    new Date().toISOString(),
    req.method,
    req.url,
    "session:",
    sessionId
  );

  next();

});

/* ---------- ACTIVITY TRACKING ---------- */
/* updates lastActivity so browser session won't expire */

app.use((req, res, next) => {

  if (req.session && req.session.id) {
    touchSession(req.session.id);
  }

  next();

});

/* ---------- HEALTH CHECK ---------- */

app.get("/", (req, res) => {
  res.send("SRM Dashboard API is running");
});

/* ---------- LOGIN STATUS CHECK ---------- */

app.get("/status", async (req, res) => {

  const sessionId = req.session?.id;

  if (!sessionId) {
    return res.json({ logged_in: false });
  }

  try {

    /* ---------- CREATE SESSION IF NOT EXISTS ---------- */

    let page = getPage(sessionId);

    if (!page) {

      console.log("Creating browser session for:", sessionId);

      const session = await createSession(sessionId);

      page = session.page;

    }

    /* ---------- CHECK LOGIN STATUS ---------- */

    const logged = await isLoggedIn(sessionId);

    res.json({
      logged_in: logged
    });

  } catch (err) {

    console.error("Status check failed:", err);

    res.json({
      logged_in: false
    });

  }

});

/* ---------- ROUTES ---------- */

app.use("/login", loginRoutes);
app.use("/logout", logoutRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/marks", marksRoutes);

/* ---------- EXPORT ---------- */

module.exports = app;
