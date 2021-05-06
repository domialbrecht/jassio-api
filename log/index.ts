import { createLogger, format, transports } from "winston";

var tp = [];
tp.push(
  new transports.File({ filename: "./storage/api-error.log", level: "error" })
);
tp.push(
  new transports.File({
    filename: "./storage/api-info.log",
  })
);

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: "morro-api" },
  transports: tp,
});

//
// If we're not in production then **ALSO** log to the `console`
// with the colorized simple format.
//
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    })
  );
}

export default logger;


