import { getInsights, getRestaurants } from '@/lib/apiClient';
import FeedBrennen from './components/FeedBrennen';

// Server component. Fetches restaurants on each request and renders a plain
// list. There is no loading state, no empty state, and no error handling: if
// the API is down or returns something unexpected, this throws.
export default async function HomePage() {
  const restaurants = await getRestaurants();
  const insights = await getInsights();

  return (
    <div className="space-y-10">

     
      {/* 
        Dining Wrapped summarizes Brennen's visit history kind of like spotify wrapped :)
        the values here are calculated by the /api/insights endpoint
      */}
      <section className="rounded-3xl bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 p-7 text-white shadow-xl">
        <div className="mb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
            Eating out, summarized
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Brennen&apos;s Dining Wrapped 🍴
          </h2>

          <p className="mt-2 text-sm text-gray-300">
            A look at where the money went
          </p>
        </div>

        {/* Main spending statistics returned from /api/insights */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
            <p className="text-3xl font-bold">
              ${insights.totalSpent.toFixed(2)}
            </p>
            <p className="mt-1 text-sm text-gray-300">Total spent</p>
          </div>

          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
            <p className="text-3xl font-bold">
              ${insights.averageSpent.toFixed(2)}
            </p>
            <p className="mt-1 text-sm text-gray-300">Average meal</p>
          </div>

          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
            <p className="text-3xl font-bold">{insights.totalVisits}</p>
            <p className="mt-1 text-sm text-gray-300">Meals out</p>
          </div>
        </div>

        {/* More personalized insights based on Brennen's spending */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              🏆 Most Expensive Taste
            </p>
            
        {/*moneyPit can be null if there are no visits yet,
        so show a fallback instead of causing an error*/}
            <p className="mt-2 text-xl font-semibold">
              {insights.moneyPit?.name ?? 'No data yet'}
            </p>

            {insights.moneyPit && (
              <p className="mt-1 text-sm text-gray-300">
                ${insights.moneyPit.totalSpent.toFixed(2)} spent here
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              💸 Most Expensive Meal
            </p>

            <p className="mt-2 text-xl font-semibold">
              ${insights.mostExpensiveVisit.toFixed(2)}
            </p>

            <p className="mt-1 text-sm text-gray-300">
              Most expensive single visit
            </p>
          </div>
        </div>
      </section>
 {/* Interactive restaurant picker */}
        <FeedBrennen />
      {/* Existing restaurant list */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Restaurants</h2>
          <p className="mt-1 text-sm text-gray-500">
            Brennen&apos;s current lineup
          </p>
        </div>
      
       {/* create one card for every restaurant returned by the API */}
        <ul className="grid gap-4 sm:grid-cols-2">
          {restaurants.map((restaurant) => (
            <li
              key={restaurant.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="font-semibold text-gray-900">
                    {restaurant.name}
                  </span>

                  <div className="mt-1 text-sm text-gray-500">
                    {restaurant.cuisine}
                  </div>
                </div>

                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-sm font-medium text-gray-700">
                  {restaurant.rating}★
                </span>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                {restaurant.address}
              </div>
            </li>
          ))}
        </ul>
        
      </section>
    </div>
  );
}
