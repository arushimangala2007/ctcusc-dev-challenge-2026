# Write-up

## 1. What did you build for Part B, and why that?

For Part B, I built a "Dining Wrapped" section that gives Brennen a quick summary of his eating-out habits, including total spending, average spending per meal, number of visits, his most expensive restaurant, and his most expensive single meal. I liked the idea of making the app feel more personalized. A lot of apps now use personalized recaps, with Spotify Wrapped probably being the most recognizable example, so I thought it would be fun to apply that idea to someone's dining history.

I also added a small "Feed Brennen" feature for when the user is indecisive about where to eat. Instead of choosing completely randomly, it prioritizes restaurants Brennen hasn't visited yet. I wanted both features to make the existing data more fun and useful without making the app overly complicated.

## 2. What did you decide, and what did you rule out?

I kept the existing database structure and put the new logic behind two GET routes: `/api/insights` and `/api/feed`. `/api/insights` handles the calculations for the Wrapped section instead of calculating them in the frontend. `/api/feed` looks at Brennen's visit history and picks a restaurant, prioritizing places with no visits.

I considered adding more detailed tracking, charts, and more complicated recommendations, but I ruled those out because I wanted to finish a smaller feature end to end. One tradeoff I'm not completely sure about is how simple the recommendation logic is. An unvisited restaurant isn't necessarily the restaurant Brennen would actually want, but I thought it was more interesting than a completely random choice and doesn't pretend to know preferences that aren't in the data.

## 3. Where did you cut corners?

The biggest limitation is that the app still isn't much of a tracker from the user's perspective. The Wrapped section can summarize visits already in the database, but there isn't a convenient UI for Brennen to log a new meal and its cost. With another day, that would be the first thing I'd add. I would create a simple visit form where the user selects a restaurant, enters how much they spent, the date, and optional notes. Then Dining Wrapped could update as the user actually uses the app.

I would also improve the organization of the page as more data gets added and add better empty and error states.

---

## Part B: routes

| Method and path | What it does | Success | Errors |
| --- | --- | --- | --- |
| `GET /api/insights` | Calculates summary statistics from Brennen's visit and spending history | `200` + insights object | `500` on an unexpected server/database failure |
| `GET /api/feed` | Picks a restaurant, prioritizing restaurants Brennen has not visited | `200` + restaurant recommendation | `404` if there are no restaurants; `500` on an unexpected server/database failure |

**`GET /api/insights`**

```json
{
  "totalVisits": 3,
  "totalSpent": 162.25,
  "averageSpent": 54.083333333333336,
  "mostExpensiveVisit": 88,
  "comfortPick": {
    "name": "El Fuego",
    "visitCount": 1
  },
  "moneyPit": {
    "name": "Sakura House",
    "totalSpent": 88
  }
}
```

**`GET /api/feed`**

```json
{
  "id": 5,
  "name": "Green Bowl",
  "cuisine": "Vegetarian",
  "rating": 3.9,
  "visitCount": 0,
  "reason": "You haven't tried this one yet"
}
```

## Schema changes

None. I used the existing restaurants and visits tables, so there are no additional migrations or setup steps.

## How I verified this

I manually tested the API using `curl` and also tested the Part B features through the browser.

**Part A** - the contract table in CHALLENGE.md, including error cases:

```bash
# Get all restaurants - 200
curl -i http://localhost:3000/api/restaurants

# Get an existing restaurant - 200
curl -i http://localhost:3000/api/restaurants/1

# Missing restaurant - 404
curl -i http://localhost:3000/api/restaurants/99999

# Invalid IDs - 404
curl -i http://localhost:3000/api/restaurants/abc
curl -i http://localhost:3000/api/restaurants/-1
curl -i http://localhost:3000/api/restaurants/1.5

# Invalid POST: missing name - 400
curl -i -X POST http://localhost:3000/api/restaurants \
  -H 'Content-Type: application/json' \
  -d '{"cuisine":"Italian","rating":4.5}'

# Invalid POST: wrong type - 400
curl -i -X POST http://localhost:3000/api/restaurants \
  -H 'Content-Type: application/json' \
  -d '{"name":123,"rating":4}'

# Invalid POST: rating outside 0-5 - 400
curl -i -X POST http://localhost:3000/api/restaurants \
  -H 'Content-Type: application/json' \
  -d '{"name":"Out Of Range","rating":6}'

# Malformed JSON - 400
curl -i -X POST http://localhost:3000/api/restaurants \
  -H 'Content-Type: application/json' \
  -d '{"name":"Broken"'

# Invalid PUT body - 400
curl -i -X PUT http://localhost:3000/api/restaurants/1 \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test","rating":9}'

# PUT missing restaurant - 404
curl -i -X PUT http://localhost:3000/api/restaurants/99999 \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test","cuisine":"Thai","address":"Test St","rating":4}'

# DELETE missing restaurant - 404
curl -i -X DELETE http://localhost:3000/api/restaurants/99999
```

**Part B** - the equivalent cases for what I built:

```bash
# Dining Wrapped insights - 200
curl -i http://localhost:3000/api/insights

# Feed Brennen recommendation - 200
curl -i http://localhost:3000/api/feed
```

## Known issues / what I'd do next

The main limitation is that visits are currently much easier to read than to create. My next step would be adding a visit form so Brennen can actually log a restaurant, date, amount spent, and notes from the UI. That would make the spending insights useful as an ongoing tracker instead of mostly summarizing seeded/existing data.
