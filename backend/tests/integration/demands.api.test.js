/**
 * Integration: frontend-shaped payloads hit live Demands API (POST/PUT/GET)
 * Requires API running: npm run start (or API_BASE for remote)
 */
import { beforeAll, describe, expect, it } from "vitest";
import { adminLogin, assertApiUp, req } from "../helpers/http.js";

describe("Demands API integration (civil + personal)", () => {
  let token;
  let civilId;
  let personalId;

  beforeAll(async () => {
    await assertApiUp();
    token = await adminLogin();
  }, 120_000);

  it("POST creates civil demand", async () => {
    const { res, json } = await req("/demands", {
      method: "POST",
      token,
      body: {
        gramPanchayat: "Kudligi Town",
        village: "Kudligi",
        name: "Vitest Civil User",
        approach: "civil",
        subject: "Integration civil demand",
        status: "Pending",
      },
    });
    expect(res.status).toBe(201);
    expect(json.data.approach).toBe("civil");
    civilId = json.data.id;
  });

  it("POST creates personal demand", async () => {
    const { res, json } = await req("/demands", {
      method: "POST",
      token,
      body: {
        gramPanchayat: "Kottur",
        village: "Kottur",
        name: "Vitest Personal User",
        approach: "personal",
        subject: "Integration personal demand",
        status: "Pending",
      },
    });
    expect(res.status).toBe(201);
    expect(json.data.approach).toBe("personal");
    personalId = json.data.id;
  });

  it("GET filters by approach", async () => {
    const civil = await req("/demands?approach=civil", { token });
    const personal = await req("/demands?approach=personal", { token });
    expect(civil.res.ok).toBe(true);
    expect(personal.res.ok).toBe(true);
    expect((civil.json.data || []).some((d) => d.id === civilId)).toBe(true);
    expect((personal.json.data || []).some((d) => d.id === personalId)).toBe(
      true
    );
  });

  it("PUT edits civil demand status/subject", async () => {
    const { res, json } = await req(`/demands/${civilId}`, {
      method: "PUT",
      token,
      body: {
        subject: "Updated civil subject",
        status: "InProgress",
        approach: "civil",
      },
    });
    expect(res.ok).toBe(true);
    expect(json.data.subject).toBe("Updated civil subject");
    expect(json.data.status).toBe("InProgress");
  });

  it("PUT edits personal demand and can switch fields", async () => {
    const { res, json } = await req(`/demands/${personalId}`, {
      method: "PUT",
      token,
      body: {
        name: "Vitest Personal Updated",
        subject: "Updated personal subject",
        status: "Completed",
        approach: "personal",
      },
    });
    expect(res.ok).toBe(true);
    expect(json.data.name).toBe("Vitest Personal Updated");
    expect(json.data.status).toBe("Completed");
    expect(json.data.approach).toBe("personal");
  });

  it("POST rejects invalid payload (frontend+backend contract)", async () => {
    const { res } = await req("/demands", {
      method: "POST",
      token,
      body: {
        gramPanchayat: "Kudligi Town",
        village: "Kudligi",
        name: "",
        approach: "civil",
        subject: "",
      },
    });
    expect(res.status).toBe(400);
  });
});
