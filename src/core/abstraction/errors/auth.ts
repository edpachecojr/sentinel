export class AuthenticationError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}

export class UnauthenticatedError extends Error {
  constructor(message: string = "Usuário não autenticado", options?: ErrorOptions) {
    super(message, options);
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}

export class InactiveUserError extends Error {
  constructor(message: string = "Usuário inativo", options?: ErrorOptions) {
    super(message, options);
  }
}
