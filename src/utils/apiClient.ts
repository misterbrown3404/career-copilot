/**
 * Performs a fetch and safely parses the JSON response.
 *
 * If the server returns a non-JSON body (e.g. a serverless error page such as
 * "An error occurred in the Serverless Function"), the raw SyntaxError is
 * converted into a friendly Error instead of bubbling up an
 * "Unexpected token ... is not valid JSON" crash.
 */
export async function fetchJson<T = any>(
  input: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(input, init);

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const errBody = await response.json();
      if (errBody && typeof errBody.error === 'string') {
        message = errBody.error;
      }
    } catch {
      // response was not JSON; keep the default status-based message
    }
    throw new Error(message);
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new Error('The server returned an unexpected response. Please try again later.');
  }
}
