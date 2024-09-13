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

function toPlainText(blocks = []) {
  return blocks

    .map((block) => {
      if (block._type !== "block" || !block.children) {
        return "";
      }

      return block.children.map((child) => child.text).join("");
    })

    .join("\n\n");
}

async function fetchArticles() {
  try {
    const articles = await client.fetch(`
      *[_type == "article" && locale == "fr-FR" && isInternal == false]{title, resolution, slug}
    `);
    // console.log("articles", articles);
    console.log(toPlainText(articles[0]?.resolution));
  } catch (err) {
    console.error("Error fetching articles:", err);
  }
}

fetchArticles();
