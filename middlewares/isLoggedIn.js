module.exports = (req, res, next) => {
  // checks if the user is logged in when trying to access a specific page
  if (!req.user) {
    return res
      .status(403)
      .json({ message: "You must be logged in to see this page" });
  }
  next();
};
