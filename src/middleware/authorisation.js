import BadRequestError from "../error/BadRequestError.js";
import UnauthenticatedError from "../error/UnauthenticatedError.js";
import UnauthorisedError from "../error/UnauthorisedError.js";
import JwtHelper from "../utility/jwtHelper.js";

export default function (...roles) {
  return (req, _, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
      return next(new UnauthenticatedError());
    }

    const authHeader = authorization.split(" ");
    if (authHeader[0] !== "Bearer") {
      return next(new BadRequestError("Authorization type not supported"));
    }
    const accessToken = authHeader[1];

    let decoded = {};
    try {
      decoded = JwtHelper.verify(accessToken);
    } catch (err) {
      return next(new UnauthenticatedError());
    }

    // If role does not exists, means as long as user is authenticated,
    // they can access resource
    if (roles.length === 0) {
      return next();
    }

    const role = decoded["role"];

    if (!(role && roles.includes(role))) {
      return next(new UnauthorisedError());
    }
    next();
  };
}
