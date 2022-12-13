export default class UnauthenticatedError extends Error {
  constructor() {
    super();
    this.name = this.constructor.name;
    this.statusCode = 401;
    this.error = "User unauthenticated";
    this.message = "You are not logged in";
  }
}
