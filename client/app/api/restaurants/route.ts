import { NextResponse } from 'next/server';
import { pool } from '@/db/pool';
import { handleError } from '@/lib/errors';
import { toRestaurant } from '@/lib/types';


//this function below checks json restaurant data
// checks if restaurant data is valid
function isValidRestaurantBody(body: unknown): boolean {

   // first request data starts as "unknown" because we should not trust anything
  // a restaurant body must first be an object and cannot be null.
  if (typeof body !== 'object' || body === null) {
    return false;
  }

  const data = body as Record<string, unknown>;

    // name is required.
  // i must be a string and cannot just be an empty string/spaces
  if (typeof data.name !== 'string' || data.name.trim() === '') {
    return false;
  }

  //cuisine optional so null and undefined are allowed
  //but if there must be a string
  if ( data.cuisine !== null && data.cuisine !== undefined && typeof data.cuisine !== 'string') {
    return false;
  }

   // rating is optional but if provided --> it must be a number and
   //  it must be between 0 and 5
  if ( data.address !== null && data.address !== undefined && typeof data.address !== 'string') {
    return false;
  }

  if (data.rating !== null && data.rating !== undefined && (typeof data.rating !== 'number' ||  data.rating < 0 || data.rating > 5)) {
    return false;
  }
 
   // if none of the checks failed the restaurant data is valid
  return true;
}

/**
 * GET /api/restaurants
 * Returns all restaurants.
 */
export async function GET() {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, cuisine, address, rating,
              created_at AS "createdAt"
       FROM restaurants
       ORDER BY created_at DESC`
      //A1 ERROR -> the error here --> migration doesn't match the query of 
      // createdAt to created_at so fixed created_at here
    );
    // Map every row - raw rows don't match the contract (NUMERIC comes back
    // as a string, timestamps as Date objects). See lib/types.ts.
    return NextResponse.json(rows.map(toRestaurant));
  } catch (err) {
    return handleError(err);
  }
  
}

/**
 * POST /api/restaurants
 * Create a new restaurant.
 *
 * TODO (A2): implement. Read the restaurant fields from the request body,
 * insert a row, and return the created restaurant with a 201 status.
 *
 * TODO (A3): validate before you insert. Nothing validates anything today, so
 * `rating` happily accepts 6. Decide what valid means for each field and reject
 * bad bodies with a 400 rather than letting them reach the database.
 */
export async function POST(req: Request) {

    // step one
    try {
    const body = await req.json();
  
      //uses above functiont to check A3
    if (!isValidRestaurantBody(body)) {
      return NextResponse.json(
        { error: 'Invalid restaurant data' },
        { status: 400 }
      );
    }
    const { name, cuisine, address, rating } = body;

    const { rows } = await pool.query(
      `INSERT INTO restaurants (name, cuisine, address, rating)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, cuisine, address, rating,
                 created_at AS "createdAt"`,
      [name, cuisine, address, rating]
    );

    return NextResponse.json(
      toRestaurant(rows[0]),
      { status: 201 }
    );
  } catch (err) {
    return handleError(err);
  }
}
