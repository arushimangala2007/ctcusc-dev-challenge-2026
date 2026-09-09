import { NextResponse } from 'next/server';

/**
 * Central error -> HTTP response mapper for the API route handlers. Call it
 * from a route's `catch` block so error handling lives in one place:
 *
 *   try {
 *     ...
 *   } catch (err) {
 *     return handleError(err);
 *   }
 *
 * This is a STUB. Right now it always returns a generic 500. A real
 * implementation would inspect the error (validation vs. not-found vs.
 * conflict vs. unexpected) and choose an appropriate status code and shape.
 *
 * This is task A3. The write endpoints from A2 can't return sensible 400s and
 * 404s while every failure funnels into a 500.
 *
 * TODO (A3): map known error types to proper status codes (400, 404, 409, ...)
 * TODO (A3): avoid leaking internal error details in responses
 */
export function handleError(err: unknown): NextResponse {

  //so this method now is fixed for A3 to be able to
  //distinguish the known/expected errors from true unexpected server failures
  console.error('Unhandled API error:', err);

   //malformed JSON from req.json()
  if (err instanceof SyntaxError) {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  //postgreSQL errors have a string error code
  if (
    typeof err === 'object' &&
    err !== null &&
    'code' in err
  ) {
    const code = String(
      (err as { code?: unknown }).code
    );

    //unique constraint violation / duplicate
    if (code === '23505') {
      return NextResponse.json(
        { error: 'Conflict' },
        { status: 409 }
      );
    }
  }

  //anything not expected is a real server error
  //do not  show  the raw database error
  return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });

  
}
