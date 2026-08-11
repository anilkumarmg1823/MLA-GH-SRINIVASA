import "dotenv/config";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();
const user = await p.user.findFirst({ where: { role: "admin" } });
if (!user) {
  console.log("no admin");
  process.exit(1);
}
const token = jwt.sign(
  { sub: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);
const r = await fetch("http://127.0.0.1:4000/api/v1/complaints?limit=1", {
  headers: { Authorization: "Bearer " + token },
});
const body = await r.json();
console.log("status", r.status);
const row = body?.data?.[0];
console.log(
  JSON.stringify(
    {
      name: row?.name,
      subject: row?.subject,
      source: row?.source,
      gp: row?.gramPanchayat,
      photos: row?.photos,
      keys: row ? Object.keys(row) : [],
    },
    null,
    2
  )
);
await p.$disconnect();
