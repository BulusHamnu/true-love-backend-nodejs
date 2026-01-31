import Profile from "../models/profile.model.js";
import Logger from "../utils/logger.js";

const getAppStats = async (req, res) => {
  try {
    const totalUsers = await Profile.find(); //.countDocuments();
    const date = new Date();

    // users created today
    const newUsersToday = totalUsers.filter((user) => {
      const created = new Date(user.createdAt);
      return (
        date.getDate() === created.getDate() &&
        date.getMonth() === created.getMonth() &&
        date.getFullYear() === created.getFullYear()
      );
    });

    // get start of current week
    const dayOfWeek = date.getDay();
    const startOfWeek = new Date(
      date.getTime() - dayOfWeek * 60 * 60 * 24 * 1000,
    );
    const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);

    // users created this week
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
    Logger.info("App stats retrive sucessfully.");
    res.status(200).json(stats);
  } catch (error) {
    Logger.error("An error ocurred while retriving app stats.", error);
    res.status(500).json({
      status: false,
      message: "An error occur, please try again later.",
    });
  }
};

export default getAppStats;
