# -*- coding: utf-8 -*-
"""Import Gram Panchayat → Villages from backend/BACKEND DATA.xlsx (first sheet)."""
from __future__ import annotations

import collections
import json
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parents[2]
XLSX = ROOT / "backend" / "BACKEND DATA.xlsx"
OUT_JS = ROOT / "frontend" / "src" / "data" / "gramPanchayats.js"
OUT_CSV = ROOT / "docs" / "send-to-client" / "1-Gram-Panchayat-Villages.csv"

# Sheet typos / bad English GP labels → canonical EN key
GP_FIX = {
    "Shoot": "Gundumunugu",
    "ujjini": "Ujjini",
    "Germany": "Jarmali",  # sheet EN is wrong; KN/village = Jarmali
}


def js_str(s: str) -> str:
    return json.dumps(s or "", ensure_ascii=False)


def esc_csv(x: str) -> str:
    x = str(x or "")
    if "," in x or '"' in x or "\n" in x:
        return '"' + x.replace('"', '""') + '"'
    return x


def main() -> None:
    wb = openpyxl.load_workbook(XLSX, read_only=True, data_only=True)
    ws = wb["GramPanchayat-Villages"]
    rows = list(ws.iter_rows(values_only=True))

    gps: collections.OrderedDict[str, dict] = collections.OrderedDict()
    fixes: list[str] = []

    for r in rows[1:]:
        if not r or not r[0]:
            continue
        gp_en = str(r[0]).strip()
        gp_kn = str(r[1] or "").strip()
        v_en = str(r[2] or "").strip() if r[2] else ""
        v_kn = str(r[3] or "").strip() if r[3] else ""
        if not v_en:
            continue

        if gp_en in GP_FIX:
            fixed = GP_FIX[gp_en]
            fixes.append(f"{gp_en}->{fixed} :: {v_en}")
            gp_en = fixed

        if gp_en not in gps:
            gps[gp_en] = {"name": gp_en, "nameKn": gp_kn, "villages": []}
        elif not gps[gp_en]["nameKn"] and gp_kn:
            gps[gp_en]["nameKn"] = gp_kn

        if any(v["name"] == v_en for v in gps[gp_en]["villages"]):
            continue
        gps[gp_en]["villages"].append({"name": v_en, "nameKn": v_kn})

    items = sorted(gps.values(), key=lambda g: g["name"].lower())

    lines = [
        "/** Kudligi constituency — Gram Panchayat → Villages",
        " * Source: backend/BACKEND DATA.xlsx sheet GramPanchayat-Villages",
        " * name = stable EN key used in filters / development records",
        " */",
        "export const gramPanchayats = [",
    ]
    for g in items:
        lines.append("  {")
        lines.append(f"    name: {js_str(g['name'])},")
        lines.append(f"    nameKn: {js_str(g['nameKn'])},")
        lines.append("    villages: [")
        for v in g["villages"]:
            lines.append(
                f"      {{ name: {js_str(v['name'])}, nameKn: {js_str(v['nameKn'])} }},"
            )
        lines.append("    ],")
        lines.append("  },")
    lines.extend(
        [
            "];",
            "",
            "/** Kudligi constituency overview figures for admin dashboard */",
            "export const CONSTITUENCY_POPULATION = 268420;",
            "",
            "export function getGramPanchayatCount() {",
            "  return gramPanchayats.length;",
            "}",
            "",
            "export function getVillageCount() {",
            "  return gramPanchayats.reduce((sum, gp) => sum + (gp.villages?.length || 0), 0);",
            "}",
            "",
            "export function getVillagesForGp(gpName) {",
            "  const gp = gramPanchayats.find((g) => g.name === gpName);",
            "  return gp ? gp.villages : [];",
            "}",
            "",
            "export function getGpLabel(gpName, lang) {",
            "  const gp = gramPanchayats.find((g) => g.name === gpName);",
            "  if (!gp) return gpName;",
            '  return lang === "kn" ? gp.nameKn : gp.name;',
            "}",
            "",
            "export function getVillageLabel(gpName, villageName, lang) {",
            "  const villages = getVillagesForGp(gpName);",
            "  const v = villages.find((x) => x.name === villageName);",
            "  if (!v) return villageName;",
            '  return lang === "kn" ? v.nameKn : v.name;',
            "}",
            "",
        ]
    )
    OUT_JS.write_text("\n".join(lines), encoding="utf-8")

    csv_lines = ["gp_en,gp_kn,village_en,village_kn,correct_yn,notes"]
    for g in items:
        for v in g["villages"]:
            csv_lines.append(
                ",".join(
                    [
                        esc_csv(g["name"]),
                        esc_csv(g["nameKn"]),
                        esc_csv(v["name"]),
                        esc_csv(v["nameKn"]),
                        "",
                        "",
                    ]
                )
            )
    OUT_CSV.write_text("\n".join(csv_lines) + "\n", encoding="utf-8")

    meta = {
        "gpCount": len(items),
        "villageCount": sum(len(g["villages"]) for g in items),
        "gps": [g["name"] for g in items],
        "fixes": fixes,
    }
    print(json.dumps(meta, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
