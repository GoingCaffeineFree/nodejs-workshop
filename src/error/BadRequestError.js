export default class BadRequestError extends Error {
  constructor(message) {
    super();
    this.name = this.constructor.name;
    this.statusCode = 400;
    this.error = "Invalid values";
    this.message = message;
  }
}
