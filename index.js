require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const favicon = require("serve-favicon");
const cors = require("cors");
const logger = require("./log");
const config = require("./config");
const { handleError } = require("./util/error");

const isProduction = config.ENV === "production";

const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: ["http://localhost:8080", "https://sirfilior.com"],
    methods: ["GET", "POST"],
  },
});

const registerSockets = require("./sockets");
const onConnection = (socket) => {
  console.log("A user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
  registerSockets(io, socket);
};

io.on("connection", onConnection);

app.use(favicon(__dirname + "/public/images/favicon.ico"));
app.use(express.static("public"));

//---------------------------------------------
//Start CORS Setup
//---------------------------------------------
var allowedOrigins = ["http://localhost:8080", "https://sirfilior.com/"];
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin
      // (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);
//End CORS Setup
//---------------------------------------------

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//---------------------------------------------
//Setup all routes
//---------------------------------------------
app.use(require("./routes"));
//---------------------------------------------

// development error handler
// will print stacktrace
if (!isProduction) {
  app.use(function (err, req, res, next) {
    console.log(err.stack);
    handleError(err, res);
  });
}

//---------------------------------------------
// production error handler
// no stacktraces leaked to user
//---------------------------------------------
app.use(function (err, req, res, next) {
  handleError(err, res);
});
//---------------------------------------------

// Start APP
logger.log("info", `${new Date()} - Running, Listening on ${config.PORT}`);
server.listen(config.PORT, () => console.log(`Listening on ${config.PORT}`));
