import { describe, expect, it } from "vitest";
import { filterDevelopmentsByVillage, mapDevToProject } from "./publicDevelopments";

describe("publicDevelopments unit", () => {
  it("maps API row with images", () => {
    const p = mapDevToProject({
      id: "1",
      gramPanchayat: "Kudligi Town",
      village: "Kudligi",
      name: "Road",
      amountSanctioned: 100000,
      status: "Completed",
      images: ["/a.png"],
      description: "Desc",
    });
    expect(p.gp).toBe("Kudligi Town");
    expect(p.images[0]).toBe("/a.png");
    expect(p.budget).toContain("1.00");
  });

  it("filters by GP without falling back to all", () => {
    const rows = [
      { id: 1, gp: "Kottur", destGp: "Kottur", name: "A" },
      { id: 2, gp: "Hosahalli", destGp: "Hosahalli", name: "B" },
    ];
    const filtered = filterDevelopmentsByVillage(rows, { gp: "Kottur" });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe(1);
    expect(filterDevelopmentsByVillage(rows, { gp: "Missing" })).toHaveLength(0);
  });
});
