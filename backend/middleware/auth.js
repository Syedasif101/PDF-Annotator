const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token;

  // Header se token nikalo
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.id;

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid, pls login again',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token not found, access denied!',
    });
  }
};

module.exports = { protect };
