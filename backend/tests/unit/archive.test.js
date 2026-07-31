import { describe, expect, it } from "vitest";
import { activeWhere } from "../../src/lib/archive.js";

describe("activeWhere (unit)", () => {
  it("defaults to non-archived only", () => {
    expect(activeWhere()).toEqual({ archivedAt: null });
  });

  it("merges extra filters", () => {
    expect(activeWhere({ approach: "civil", id: "x" })).toEqual({
      archivedAt: null,
      approach: "civil",
      id: "x",
    });
  });
});
