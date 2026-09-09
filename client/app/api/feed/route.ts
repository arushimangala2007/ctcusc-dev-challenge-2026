import { NextResponse } from 'next/server';
import { pool } from '@/db/pool';
import { handleError } from '@/lib/errors';

export async function GET() {
  try {
    //like the app name this is a funny feature that will feed brennen
    //recomment random places restaurants
    // prefer restaurants Brennen has never visited
    // iff every restaurant has been visited, this still picks from all of them
    const { rows } = await pool.query(`
      SELECT
        r.id,
        r.name,
        r.cuisine,
        r.rating,
        COUNT(v.id)::int AS "visitCount"
      FROM restaurants r
      LEFT JOIN visits v ON v."restaurantId" = r.id
      GROUP BY r.id, r.name, r.cuisine, r.rating
      ORDER BY
        CASE WHEN COUNT(v.id) = 0 THEN 0 ELSE 1 END,
        RANDOM()
      LIMIT 1
    `);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'No restaurants available' },
        { status: 404 }
      );
    }

    const restaurant = rows[0];

    return NextResponse.json({
      id: restaurant.id,
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      rating: Number(restaurant.rating),
      visitCount: restaurant.visitCount,
      reason:
        restaurant.visitCount === 0
          ? "Try this one!"
          : 'Time for a repeat 🔁',
    });
  } catch (err) {
    return handleError(err);
  }
}