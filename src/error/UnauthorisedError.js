export default class Unauthorised extends Error {
  constructor() {
    super();
    this.name = this.constructor.name;
    this.statusCode = 403;
    this.error = "User not authorised";
    this.message = "You do not have sufficient privilege to view this";
  }
}
