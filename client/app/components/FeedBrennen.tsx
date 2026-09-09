'use client';

import { useState } from 'react';

interface FeedPick {
  id: number;
  name: string;
  cuisine: string | null;
  rating: number | null;
  visitCount: number;
  reason: string;
}

export default function FeedBrennen() {
  const [pick, setPick] = useState<FeedPick | null>(null);
  const [loading, setLoading] = useState(false);

  async function chooseRestaurant() {
    setLoading(true);

    try {
      // Ask our API to choose a restaurant for Brennen
      const res = await fetch('/api/feed');

      if (!res.ok) {
        throw new Error('Could not pick a restaurant');
      }

      const data = await res.json();
      setPick(data);
    } catch {
      setPick(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            Can&apos;t decide?
          </p>

          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            🎲 Feed Brennen
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Choose somewhere Brennen hasn&apos;t been to too many times!
          </p>
        </div>

        <button
          onClick={chooseRestaurant}
          disabled={loading}
          className="rounded-full bg-gray-900 px-6 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? 'Choosing...' : 'Feed Brennen →'}
        </button>
      </div>

      {pick && (
        <div className="mt-6 rounded-2xl bg-gray-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Tonight&apos;s pick
          </p>

          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-gray-900">
                {pick.name}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {pick.cuisine} · {pick.rating}★
              </p>
            </div>
          </div>

          <p className="mt-3 text-sm font-medium text-gray-700">
            {pick.reason}
          </p>
        </div>
      )}
    </section>
  );
}