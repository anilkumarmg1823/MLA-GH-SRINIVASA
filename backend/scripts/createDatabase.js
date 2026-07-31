import "dotenv/config";
import pg from "pg";

const adminUrl =
  process.env.ADMIN_DATABASE_URL ||
  process.env.DATABASE_URL?.replace(/\/[^/?]+(\?|$)/, "/postgres$1");

if (!adminUrl) {
  console.error("ADMIN_DATABASE_URL or DATABASE_URL required");
  process.exit(1);
}

const DB_NAME = "kudligi_mla";

async function main() {
  const client = new pg.Client({
    connectionString: adminUrl,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  const exists = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [DB_NAME]
  );
  if (exists.rowCount > 0) {
    console.log(`Database "${DB_NAME}" already exists`);
  } else {
    await client.query(`CREATE DATABASE "${DB_NAME}"`);
    console.log(`Created database "${DB_NAME}"`);
  }
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
