const jwt = require("jsonwebtoken");

// Extrait uniquement le token depuis le header
// "Authorization: Bearer <token>".
const extractBearerToken = (authorizationHeader) => {
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.split(" ")[1];
};

// Verifie que la requete contient un JWT valide.
// Si le token est correct, les informations decodees sont stockees dans req.user.
const verifyToken = (req, res, next) => {
  try {
    const token = extractBearerToken(req.headers.authorization);

    // Si aucun token n'est fourni, l'acces est refuse.
    if (!token) {
      return res.status(401).json({
        message: "Access token is required"
      });
    }

    // Verifie la signature du token avec le secret JWT
    // puis decode son contenu.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Rend les donnees du token disponibles
    // pour les middlewares et routes suivantes.
    req.user = decoded;
    next();
  } catch (error) {
    // Ici, le token est invalide, expire ou signe avec un mauvais secret.
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

// Verifie que l'utilisateur authentifie possede le role admin.
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required"
    });
  }

  next();
};

module.exports = {
  verifyToken,
  requireAdmin
};
