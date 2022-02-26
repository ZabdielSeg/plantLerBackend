module.exports = (req, res, next) => {
  if(req.isAuthenticated() && req.user.isSeller !== true) {
    res.status(403).json({message: "Only plant sellers can do this"});
  } else {
    return next();
  }
};