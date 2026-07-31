/**
 * Full website API flow test (public smoke + catalog CRUD for every module).
 *
 * ADD NEW APIs: edit tests/apiModules.js (CRUD_MODULES). This script runs that catalog.
 * Usage: npm run test:flow  (or npm run test:all)
 * Requires API running (default http://localhost:4000).
 */
import "dotenv/config";
import { CRUD_MODULES, runModuleCrud } from "../tests/apiModules.js";
import {
  adminLogin,
  apiBase,
  assertApiUp,
  req,
} from "../tests/helpers/http.js";

const DEMO_OTP = process.env.DEMO_OTP || "123456";

let passed = 0;
let failed = 0;

async function step(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`PASS  ${name}`);
  } catch (err) {
    failed += 1;
    console.error(`FAIL  ${name}`);
    console.error(`      ${err.message}`);
    throw err;
  }
}

async function main() {
  const BASE = apiBase();
  console.log(`Full flow test against ${BASE}\n`);
  console.log(
    `Catalog modules: ${CRUD_MODULES.map((m) => m.name).join(", ")}\n`
  );

  await step("GET /health", async () => {
    await assertApiUp();
  });

  let landing;
  await step("GET /landing has hero/schedules/leaders", async () => {
    const { res, json } = await req("/landing");
    if (!res.ok) throw new Error(`status ${res.status}`);
    landing = json.data;
    if (!landing?.media) throw new Error("missing media");
    const schedules = landing.media.tourSchedules || [];
    if (!Array.isArray(schedules) || schedules.length < 1) {
      throw new Error("tourSchedules empty");
    }
    if (!landing.leaders?.items?.length && !landing.site?.nameEn) {
      throw new Error("landing content too sparse");
    }
  });

  await step("GET /developments/public non-empty", async () => {
    const { res, json } = await req("/developments/public");
    if (!res.ok) throw new Error(`status ${res.status}`);
    if (!Array.isArray(json.data) || json.data.length < 1) {
      throw new Error("no public developments");
    }
  });

  await step("POST /complaints invalid -> 400", async () => {
    const { res } = await req("/complaints", {
      method: "POST",
      body: { name: "", phone: "1", village: "", message: "" },
    });
    if (res.status !== 400) throw new Error(`expected 400 got ${res.status}`);
  });

  let adminToken;
  await step("POST /auth/admin/login", async () => {
    adminToken = await adminLogin();
  });

  // ——— Every registered module: GET / POST / update / ARCHIVE / RESTORE ———
  for (const module of CRUD_MODULES) {
    await step(
      `${module.name} GET+POST+update+archive+restore`,
      async () => {
        await runModuleCrud(module, adminToken);
      }
    );
  }

  // Extra demand personal create (civil covered by catalog)
  await step("Demands POST personal (extra)", async () => {
    const { res, json } = await req("/demands", {
      method: "POST",
      token: adminToken,
      body: {
        gramPanchayat: "Kottur",
        village: "Kottur",
        name: "Flow Personal",
        approach: "personal",
        subject: "Flow personal demand",
      },
    });
    if (res.status !== 201) throw new Error(`status ${res.status}`);
    if (json.data?.approach !== "personal") {
      throw new Error("approach not personal");
    }
  });

  await step("PUT /landing patch tourSchedules", async () => {
    const next = {
      ...landing,
      media: {
        ...(landing.media || {}),
        tourSchedules: [...(landing.media?.tourSchedules || [])].slice(0, 6),
      },
    };
    const { res, json } = await req("/landing", {
      method: "PUT",
      token: adminToken,
      body: next,
    });
    if (!res.ok) throw new Error(`status ${res.status}: ${json?.error?.message}`);
  });

  await step("Staff OTP request+verify", async () => {
    const phone = "9876543210";
    const reqOtp = await req("/auth/staff/request-otp", {
      method: "POST",
      body: { phone },
    });
    if (!reqOtp.res.ok) {
      throw new Error(`request-otp ${reqOtp.res.status}`);
    }
    const verify = await req("/auth/staff/verify-otp", {
      method: "POST",
      body: { phone, otp: DEMO_OTP },
    });
    if (!verify.res.ok) {
      throw new Error(
        `verify-otp ${verify.res.status}: ${verify.json?.error?.message}`
      );
    }
    if (!verify.json?.data?.token) throw new Error("missing staff token");
  });

  console.log(`\nDone: ${passed} passed, ${failed} failed`);
  console.log(
    `\nTip: add new APIs to tests/apiModules.js (CRUD_MODULES) — flow + integration both use it.`
  );
}

main().catch(() => {
  console.error(`\nDone: ${passed} passed, ${failed} failed`);
  process.exit(1);
});
