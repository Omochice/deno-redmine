export function convertError(
  errorMessage: string,
  errorInstance = Error,
): (e: unknown) => Error {
  return (e: unknown) => {
    if (e instanceof Error) {
      return e;
    }
    return new errorInstance(errorMessage, { cause: e });
  };
}

export class UnprocessableEntityError extends Error {
  override cause: Response;
  constructor(response: Response) {
    super(response.statusText);
    this.cause = response;
  }
}
