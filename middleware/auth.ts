/*import jwt from "express-jwt";
import jwks from "jwks-rsa";
import * as config from "../config";

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

export default jwtCheck;*/
