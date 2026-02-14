import Env from "../config/index.js";

// Return a maintenance response when user try to creation/update routes
const MAINTENANCE_MODE = Env.MAINTENANCE_MODE === "true";
export default function enableMaintenanceMode(req, res, next) {
  if (MAINTENANCE_MODE)
    return res.status(503).json({
      status: false,
      message: "Maintenance going on, please try again later.",
      data: null,
    });

  next();
}
