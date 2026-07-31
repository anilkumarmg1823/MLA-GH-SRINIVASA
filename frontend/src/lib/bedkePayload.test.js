import { describe, expect, it } from "vitest";
import {
  buildBedkeCreatePayload,
  buildBedkeUpdatePayload,
  normalizeApproach,
} from "./bedkePayload";

describe("bedkePayload unit", () => {
  it("builds civil create payload", () => {
    const body = buildBedkeCreatePayload({
      gramPanchayat: "Kudligi Town",
      village: "Kudligi",
      name: "  Ramesh  ",
      approach: "civil",
      subject: "  Street light  ",
    });
    expect(body).toEqual({
      gramPanchayat: "Kudligi Town",
      village: "Kudligi",
      name: "Ramesh",
      approach: "civil",
      subject: "Street light",
      status: "Pending",
    });
  });

  it("builds personal create payload", () => {
    const body = buildBedkeCreatePayload({
      gramPanchayat: "Kottur",
      village: "Kottur",
      name: "Lakshmi",
      approach: "personal",
      subject: "Pension",
      status: "InProgress",
    });
    expect(body.approach).toBe("personal");
    expect(body.status).toBe("InProgress");
  });

  it("normalizes unknown approach to civil", () => {
    expect(normalizeApproach("weird")).toBe("civil");
    expect(normalizeApproach("personal")).toBe("personal");
  });

  it("builds update payload for edit", () => {
    const body = buildBedkeUpdatePayload({
      subject: "Updated",
      status: "Completed",
      approach: "personal",
    });
    expect(body).toEqual({
      subject: "Updated",
      status: "Completed",
      approach: "personal",
    });
  });

  it("throws when create missing required fields", () => {
    expect(() =>
      buildBedkeCreatePayload({
        gramPanchayat: "X",
        village: "Y",
        name: "",
        approach: "civil",
        subject: "Z",
      })
    ).toThrow(/name/);
  });
});
