import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";
import { logger } from "../utils/helpers.js";

export default async function createNewUser({
  provider = "local",
  password = null,
  email,
  verficationCode = "",
  fullName,
  googleId = "",
  idToken = "",
  isVerified = false,
}) {
  try {
    // create new user
    const newUser = await User.create({
      provider,
      password,
      email,
      emailVerification: {
        code: verficationCode || null,
        expireAt: verficationCode
          ? new Date(Date.now() + 15 * 60 * 1000)
          : null,
      },
      google: {
        googleId,
        idToken,
      },
      isVerified,
    });

    // create a profile for that user
    const userProfile = await Profile.create({
      userId: newUser._id,
      fullName,
      email,
    });

    logger.info("New user created ", {
      email,
      fullName: userProfile.fullName,
    });

    return {
      error: false,
      newUser: {
        id: newUser._id,
        ...userProfile.removeUnwantedFields(),
        isVerified: newUser.isVerified,
      },
    };
  } catch (error) {
    logger.error(error);
    return { error: true };
  }
}
