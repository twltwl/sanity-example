import { createClient } from "@sanity/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.projectId,
  dataset: process.env.dataset,
  apiVersion: "2023-09-13",
  useCdn: true,
  token: process.env.token,
});

/**
 *
 * Will score each match by the following:
 * - If the article title contains the query string
 * - If the title contains part of the query string (weighted by 0.5)
 * - If the article issue contains the query string (weighted by 0.75)
 */

const SCORING = `
  | score(
      title match $q
      || boost(title match $q + "*", 0.5)
      || boost(pt::text(issue) match $q, 0.75)
  )
`;

function constructQuery(page, pageSize) {
  return `
    {
      "total": count(*[_type == "article" && locale == $locale && $brand in brands}]
          ${SCORING}
          { _score }
          [_score > 0]),
      "articles": *[_type == "article" && locale == $locale && $brand in brands}]
          ${SCORING}
          | order(score desc)
          {
            _id,
            slug,
            title,
            category->{
              _id,
              title,
              slug
            },
            _score,
            'issue': pt::text(issue),
            isInternal
          }[_score > 0][${page * pageSize}..${(page + 1) * pageSize - 1}]
    }
  `;
}

let page = 1;

const query = constructQuery(Math.max(page - 1, 0), 10);

// perform search
const search = async () => {
  const result = await client.fetch(query, {
    locale: "sv-SE",
    brand: "electrolux",
    q: "Dishwasher",
  });
};
