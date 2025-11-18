  const jwt = require('jsonwebtoken');

  module.exports = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', ''); // Extracts token
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verifies token
      req.user = decoded; // Adds user data to request
      next(); // Proceeds to controller
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };
  