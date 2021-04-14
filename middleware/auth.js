const jwt = require("express-jwt");
const jwks = require("jwks-rsa");
const config = require("../config");

const jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: "https://dev-83h5hy98.us.auth0.com/.well-known/jwks.json",
  }),
  audience: config.AUTH_AUDIENCE,
  issuer: "https://dev-83h5hy98.us.auth0.com/",
  algorithms: ["RS256"],
});

module.exports = jwtCheck;
