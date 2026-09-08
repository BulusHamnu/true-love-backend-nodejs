import Profile from "../models/profile.model.js";
import Env from "../config/index.js";
import AppError, { ErrorCodes } from "../errors/appError.js";

function validateApiKey(apiKey) {
  const storedAccessKey = Env.ADMIN_ACCESS_KEY;
  const isValid = apiKey === storedAccessKey;

  if (!apiKey || !isValid)
    throw new AppError(ErrorCodes.UNAUTHORIZED, "Unauthorized.", 401, true);
}

const getAppStats = async (req, res, next) => {
  try {
    const apiKey = req.headers["x-api-key"] || null;
    validateApiKey(apiKey);

    const totalUsers = await Profile.find(); //.countDocuments();
    const date = new Date();

    const newUsersToday = totalUsers.filter((user) => {
      const created = new Date(user.createdAt);
      return (
        date.getDate() === created.getDate() &&
        date.getMonth() === created.getMonth() &&
        date.getFullYear() === created.getFullYear()
      );
    });

    const dayOfWeek = date.getDay();
    const startOfWeek = new Date(
      date.getTime() - dayOfWeek * 60 * 60 * 24 * 1000,
    );
    const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);

    const newUsersThisWeek = totalUsers.filter(
      (user) =>
        new Date(user.createdAt) >= startOfWeek &&
        new Date(user.createdAt) <= endOfWeek,
    );

    const stats = {
      totalUsers: totalUsers.length,
      newUsersToday: newUsersToday.length,
      newUsersThisWeek: newUsersThisWeek.length,
      timestamp: date,
    };

    res.status(200).json({
      status: true,
      message: "App stats retrieved successfully.",
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export default getAppStats;
