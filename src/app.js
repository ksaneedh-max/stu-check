const express = require("express");
const session = require("express-session");
const FileStore = require("session-file-store")(session);

const loginRoutes = require("./modules/login/login.route");
const logoutRoutes = require("./modules/logout/logout.route");
const profileRoutes = require("./modules/profile/profile.route");
const attendanceRoutes = require("./modules/attendance/attendance.route");
const marksRoutes = require("./modules/marks/marks.route");
const timetableRoutes = require("./modules/timetable/timetable.route");
const calendarRoutes = require("./modules/calendar/calendar.route");

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
    store: new FileStore({
      path: "./sessions"
    }),
    secret: "srm-dashboard-secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // set true if HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
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

  try {

    const sessionId = req.session?.id;

    if (!sessionId) {
      return res.json({ logged_in: false });
    }

    let page = getPage(sessionId);

    /* If server restarted, there will be no page in memory */
    if (!page) {

      console.log("Restoring browser session for:", sessionId);

      const session = await createSession(sessionId);

      page = session.page;

    }

    /* Now check login using restored session */
    const logged = await isLoggedIn(sessionId);

    return res.json({
      logged_in: logged
    });

  } catch (err) {

    console.error("Status check failed:", err);

    return res.json({
      logged_in: false
    });

  }

});

/* ---------- ROUTES ---------- */

app.use("/login", loginRoutes);
app.use("/logout", logoutRoutes);
app.use("/profile", profileRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/marks", marksRoutes);
app.use("/timetable", timetableRoutes);
app.use("/calendar", calendarRoutes);

/* ---------- EXPORT ---------- */

module.exports = app;