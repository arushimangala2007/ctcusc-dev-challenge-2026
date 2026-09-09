import { NextResponse } from 'next/server';
import { pool } from '@/db/pool';
import { handleError } from '@/lib/errors';
import { toRestaurant } from '@/lib/types';


//this function below checks json restaurant data
// checks if restaurant data is valid
//THIS FUNCTION COPIED FROM THE OTHER FILE
//if I were to avoid the copy could also create another validation
//file within client-lib and then import it to whatever file is needed
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

type Params = { params: { id: string } };

//this function for part A3
// this helps turn the id to 500 instead ofa 404
// checks if the id from the url is a valid restaurant ID
function isValidId(id: string): boolean {
  const value = Number(id);
  return Number.isInteger(value) && value > 0;
}


/**
 * GET /api/restaurants/:id
 * Returns a single restaurant, or 404 if it doesn't exist.
 */
export async function GET(_req: Request, { params }: Params) {
  try {

     //checking the URL id BEFORE sending it to the database.
    // invalid ids return 404.
    if (!isValidId(params.id)) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    const { rows } = await pool.query(
      `SELECT id, name, cuisine, address, rating,
              created_at AS "createdAt"
       FROM restaurants
       WHERE id = $1`,
      [params.id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(toRestaurant(rows[0]));
  } catch (err) {
    return handleError(err);
  }
}

/**
 * PUT /api/restaurants/:id
 * Update an existing restaurant.
 *
 * TODO (A2): implement. Update the row matching :id and return the updated
 * record (or 404 if it doesn't exist). Validate the body the same way POST does.
 */
export async function PUT(req: Request, _ctx: Params) {
   try {
    //same thing here as above
    //checking the URL id BEFORE sending it to the database.
    // invalid ids return 404.
    if (!isValidId(_ctx.params.id)) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    //read the update restaurant data sent in the request body
    const body = await req.json();

    //validate that restaurant data
    if (!isValidRestaurantBody(body)) {
      return NextResponse.json(
        { error: 'Invalid restaurant data' },
        { status: 400 }
      );
    }

    //"pull" the restaurant fields out of the JSON object
    const { name, cuisine, address, rating } = body;

    //update the restaurant whose id matches the id from the URL
    const { rows } = await pool.query(
      `UPDATE restaurants
       SET name = $1,
           cuisine = $2,
           address = $3,
           rating = $4
       WHERE id = $5
       RETURNING id, name, cuisine, address, rating,
                 created_at AS "createdAt"`,
      [name, cuisine, address, rating, _ctx.params.id]
    );

    //iff no row was returned
    // then no restaurant with that id existed
    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    // Convert the raw database row to the API Restaurant format
    // and return the updated restaurant
    return NextResponse.json(toRestaurant(rows[0]));
    } 
    catch (err) {
    return handleError(err);
   }
}

/**
 * DELETE /api/restaurants/:id
 * Delete a restaurant.
 *
 * TODO (A2): implement. Delete the row matching :id and return 204 (or 404
 * if it doesn't exist).
 *
 * Worth noticing: the migration already made a call about what happens to that
 * restaurant's visits. Go read it. If you disagree with it, say so in your
 * write-up.
 */
export async function DELETE(_req: Request, _ctx: Params) {
    try {
    //same thing here as above
    //checking the URL id BEFORE sending it to the database.
    // invalid ids return 404.
    if (!isValidId(_ctx.params.id)) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }
    // delete the restaurant whose id matches the URL parameter.
    // RETURNING id tells if a row was actually deleted.
    const { rows } = await pool.query(
      `DELETE FROM restaurants
       WHERE id = $1
       RETURNING id`,
      [_ctx.params.id]
    );

    //no returned row means 
    // that restaurant didn't exist
    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    //204 means deletion succeeded and there is no response body
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return handleError(err);
  }
}
