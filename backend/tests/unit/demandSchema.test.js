import { describe, expect, it } from "vitest";
import {
  demandCreateSchema,
  demandUpdateSchema,
  normalizeDemandBody,
} from "../../src/lib/demandSchema.js";

describe("demandCreateSchema (unit)", () => {
  it("accepts civil demand", () => {
    const parsed = demandCreateSchema.parse({
      gramPanchayat: "Kudligi Town",
      village: "Kudligi",
      name: "Ramesh",
      approach: "civil",
      subject: "Street light",
    });
    expect(parsed.approach).toBe("civil");
  });

  it("accepts personal demand", () => {
    const parsed = demandCreateSchema.parse({
      gramPanchayat: "Kottur",
      village: "Kottur",
      name: "Lakshmi",
      approach: "personal",
      subject: "Pension help",
      status: "InProgress",
    });
    expect(parsed.approach).toBe("personal");
    expect(parsed.status).toBe("InProgress");
  });

  it("rejects invalid approach", () => {
    expect(() =>
      demandCreateSchema.parse({
        gramPanchayat: "Kudligi Town",
        village: "Kudligi",
        name: "X",
        approach: "other",
        subject: "Y",
      })
    ).toThrow();
  });

  it("rejects empty required fields", () => {
    expect(() =>
      demandCreateSchema.parse({
        gramPanchayat: "",
        village: "Kudligi",
        name: "X",
        approach: "civil",
        subject: "Y",
      })
    ).toThrow();
  });
});

describe("normalizeDemandBody (unit)", () => {
  it("defaults status to Pending", () => {
    const row = normalizeDemandBody({
      gramPanchayat: "Hosahalli",
      village: "Hosahalli",
      name: "Basavaraj",
      approach: "civil",
      subject: "Road",
    });
    expect(row.status).toBe("Pending");
  });
});

describe("demandUpdateSchema (unit)", () => {
  it("allows partial update for both approaches", () => {
    expect(
      demandUpdateSchema.parse({ approach: "personal", status: "Completed" })
    ).toEqual({ approach: "personal", status: "Completed" });
    expect(demandUpdateSchema.parse({ subject: "Updated subject" })).toEqual({
      subject: "Updated subject",
    });
  });
});
