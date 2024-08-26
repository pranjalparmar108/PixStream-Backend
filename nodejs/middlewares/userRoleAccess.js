module.exports.checkUserRole = (requiredRoles) => {
  return (req, res, next) => {
    try {
      if (!requiredRoles.includes(req.userData?.role)) {
        return res.status(403).json({ error: 'Access denied' });
      }
      next();
    } catch (error) {
      console.log(error)
      return res.status(403).json({ "message": "Error occurred while checking user role." });
    }
  };
};