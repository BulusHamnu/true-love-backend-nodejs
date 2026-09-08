import Env from "../config/index.js";
import { ErrorCodes } from "../errors/appError.js";
import Logger from "../utils/logger.js";

// Return a maintenance response when user try to creation/update routes
const MAINTENANCE_MODE = Env.MAINTENANCE_MODE === "true";
export default function enableMaintenanceMode(req, res, next) {
  if (MAINTENANCE_MODE) {
    Logger.warn("Application in maintenance.");
    
    return res.status(503).json({
      status: false,
      message: "Maintenance going on, please try again later.",
      error: { code: ErrorCodes.MAINTENANCE_MODE, details: null },
    });
  }

  next();
}
