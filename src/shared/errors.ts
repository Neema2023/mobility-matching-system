export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode = 500
  ) {
    super(message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not Found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}