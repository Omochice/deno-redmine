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

export class RedmineResponseError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly body: string;

  constructor(status: number, statusText: string, body: string) {
    // HTTP/2 drops the reason phrase, leaving statusText empty; fall back to
    // the status code so the message is never blank.
    super(statusText || `HTTP ${status}`);
    this.name = "RedmineResponseError";
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }

  /**
   * Build an error from a non-ok response, eagerly draining its body.
   *
   * The body is read here rather than kept as a live `Response` so callers
   * get a settled string and the connection is not left dangling. Reading
   * can fail (e.g. the body was already consumed); in that case the body is
   * left empty so surfacing the original status is never masked by a
   * secondary failure.
   *
   * @param response A non-ok response to describe
   * @returns The error carrying the response status, statusText and body
   */
  static async fromResponse(response: Response): Promise<RedmineResponseError> {
    const body = await response.text().catch(() => "");
    return new RedmineResponseError(response.status, response.statusText, body);
  }
}

/**
 * Assert that a Redmine REST response is ok.
 *
 * @throws {RedmineResponseError} When the response is not ok
 */
export async function assertResponse(response: Response): Promise<void> {
  if (!response.ok) {
    throw await RedmineResponseError.fromResponse(response);
  }
}
