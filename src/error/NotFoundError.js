export default class NotFoundError extends Error {
  constructor(resource, fieldName, resourceValue) {
    super();
    this.name = this.constructor.name;
    this.statusCode = 404;
    this.error = "Resource Not Found";
    this.message = `${resource} with ${fieldName}: '${resourceValue}' does not exists`;
  }
}
