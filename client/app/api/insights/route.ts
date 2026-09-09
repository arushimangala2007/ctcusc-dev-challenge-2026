import { NextResponse } from 'next/server';
import { pool } from '@/db/pool';
import { handleError } from '@/lib/errors';

export async function GET() {
  try {
    //get overall spending statistics for brennen wrapped
    const { rows: summaryRows } = await pool.query(`
      SELECT
        COUNT(*)::int AS "totalVisits",
        COALESCE(SUM("amountSpent"), 0)::float AS "totalSpent",
        COALESCE(AVG("amountSpent"), 0)::float AS "averageSpent",
        COALESCE(MAX("amountSpent"), 0)::float AS "mostExpensiveVisit"
      FROM visits
    `);

    //find the restaurant Brennen has visited the most
    const { rows: favoriteRows } = await pool.query(`
      SELECT
        r.name,
        COUNT(v.id)::int AS "visitCount"
      FROM restaurants r
      JOIN visits v ON v."restaurantId" = r.id
      GROUP BY r.id, r.name
      ORDER BY "visitCount" DESC
      LIMIT 1
    `);

    //find the restaurant where Brennen has spent the most money
    const { rows: moneyRows } = await pool.query(`
      SELECT
        r.name,
        SUM(v."amountSpent")::float AS "totalSpent"
      FROM restaurants r
      JOIN visits v ON v."restaurantId" = r.id
      GROUP BY r.id, r.name
      ORDER BY "totalSpent" DESC
      LIMIT 1
    `);

    const summary = summaryRows[0];

    return NextResponse.json({
      totalVisits: summary.totalVisits,
      totalSpent: summary.totalSpent,
      averageSpent: summary.averageSpent,
      mostExpensiveVisit: summary.mostExpensiveVisit,
      comfortPick: favoriteRows[0] ?? null,
      moneyPit: moneyRows[0] ?? null,
    });
  } catch (err) {
    return handleError(err);
  }
}