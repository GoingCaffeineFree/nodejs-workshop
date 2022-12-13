import jwt from "jsonwebtoken";

const SECRET = process.env.jwtSecret;

if (!SECRET) {
  console.error("jwtSecret does not exist as a environment variable");
  process.exit(1);
}

export default class JwtHelper {
  static sign(payload) {
    return jwt.sign(payload, SECRET);
  }

  static verify(token) {
    return jwt.verify(token, SECRET);
  }
}
