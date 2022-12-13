export default class DuplicateResourceError extends Error {
  constructor(resource, fieldName, resourceValue) {
    super();
    this.name = this.constructor.name;
    this.statusCode = 409;
    this.error = "Duplicated values";
    this.message = `${resource} with ${fieldName}: '${resourceValue}' already exists`;
  }
}
