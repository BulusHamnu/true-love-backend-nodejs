import winston from "winston";
const { createLogger, transports, format, printf, colorize } = winston;
import chalk from "chalk";

/* Logger setup */
const myFormat = format.printf(
  ({ level, message, timestamp, stack, cause, ...meta }) => {
    if (stack)
      return `[${chalk.blueBright(timestamp)}] ${level}: ${message} ${chalk.red(stack)} ${cause ? `\nCause By: ${chalk.yellow(cause)}` : ""}`;

    return `[${chalk.blueBright(timestamp)}] ${level}: ${message} ${
      Object.keys(meta).length > 0 ? JSON.stringify(meta) : ""
    }`;
  },
);

export const Logger = createLogger({
  level: "debug",
  format: format.combine(format.errors({ stack: true })),
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.timestamp(), myFormat),
    }),
  ],
});

// logger.add(
//   new transports.File({
//     filename: "app.log",
//     format: format.combine(
//       format.timestamp(),
//       format.json(),
//       format.prettyPrint()
//     ),
//   })
// );

export default Logger;
