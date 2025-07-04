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
  constructor(response: Response) {
    super(response.statusText, { cause: response });
  }
}

export function assertResponse(
  response: Response,
): asserts response is Response & { ok: true } {
  if (!response.ok) {
    throw new UnprocessableEntityError(response);
  }
}
