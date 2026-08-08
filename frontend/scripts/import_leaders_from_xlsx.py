# -*- coding: utf-8 -*-
"""Import leaders from backend/BACKEND DATA.xlsx sheet Leaders 1 -> leadersSeed.js"""
from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parents[2]
XLSX = ROOT / "backend" / "BACKEND DATA.xlsx"
GP_JS = ROOT / "frontend" / "src" / "data" / "gramPanchayats.js"
OUT = ROOT / "frontend" / "src" / "data" / "leadersSeed.js"


def u(esc: str) -> str:
    return esc.encode("utf-8").decode("unicode_escape")


def norm(s: str) -> str:
    s = unicodedata.normalize("NFC", (s or "").strip())
    return s.replace("\u200c", "").replace("\u200d", "")


def phone_str(v) -> str:
    if v is None or v == "":
        return ""
    if isinstance(v, float):
        v = int(v) if v == int(v) else v
    return re.sub(r"\D", "", str(v))


EXTRA_PLACES = [
    u("\\u0ca4\\u0cbe\\u0caf\\u0c95\\u0ccd\\u0c95\\u0ca8\\u0cb9\\u0cb3\\u0ccd\\u0cb3\\u0cbf"),
    u("\\u0cb9\\u0cc1\\u0ca3\\u0cb8\\u0cc6\\u0c95\\u0c9f\\u0ccd\\u0c9f\\u0cc6"),
    u("\\u0cae\\u0cbe\\u0ca1\\u0ccd\\u0cb2\\u0cbe\\u0ca8\\u0cbe\\u0caf\\u0c95\\u0ca8\\u0cb9\\u0cb3\\u0ccd\\u0cb3\\u0cbf"),
    u("\\u0cac\\u0cca\\u0caa\\u0ccd\\u0caa\\u0cb2\\u0cbe\\u0cab\\u0cc1\\u0cb0"),
    u("\\u0cb0\\u0cbe\\u0caf\\u0caa\\u0cc1\\u0cb0"),
    u("\\u0cac\\u0cc6\\u0cb3\\u0ccd\\u0cb3\\u0c95\\u0c9f\\u0ccd\\u0c9f\\u0cc6"),
    u("\\u0c97\\u0cc6\\u0ca6\\u0ccd\\u0ca6\\u0cb2\\u0c97\\u0c9f\\u0ccd\\u0c9f\\u0cc6"),
    u("\\u0c97\\u0cca\\u0cb5\\u0cbf\\u0c82\\u0ca6\\u0c97\\u0cbf\\u0cb0\\u0cbf \\u0c97\\u0cca\\u0cb2\\u0ccd\\u0cb2\\u0cb0\\u0c9f\\u0ccd\\u0c9f\\u0cbf"),
    u("\\u0c90\\u0c97\\u0cb3 \\u0cae\\u0cb2\\u0ccd\\u0cb2\\u0cbe\\u0caa\\u0cc1\\u0cb0"),
    u("\\u0cb9\\u0cc1\\u0cb2\\u0cbf\\u0c95\\u0cc1\\u0c82\\u0c9f\\u0cc6"),
    u("\\u0cb8\\u0cbf\\u0ca1\\u0cc7\\u0c97\\u0cb2\\u0ccd\\u0cb2\\u0cc1"),
    u("\\u0c9a\\u0cbf\\u0c95\\u0ccd\\u0c95\\u0c9c\\u0ccb\\u0c97\\u0cbf\\u0cb9\\u0cb3\\u0ccd\\u0cb3\\u0cbf"),
    u("\\u0cb2\\u0cbf\\u0c82\\u0c97\\u0ca8\\u0cb9\\u0cb3\\u0ccd\\u0cb3\\u0cbf \\u0ca4\\u0cbe\\u0c82\\u0ca1"),
    u("\\u0c9a\\u0cbf\\u0c95\\u0ccd\\u0c95\\u0c9c\\u0ccb\\u0c97\\u0cbf\\u0cb9\\u0cb3\\u0ccd\\u0cb3\\u0cbf \\u0ca4\\u0cbe\\u0c82\\u0ca1"),
    u("\\u0c85\\u0caa\\u0ccd\\u0caa\\u0cc7\\u0ca8\\u0cb9\\u0cb3\\u0ccd\\u0cb3\\u0cbf \\u0ca4\\u0cbe\\u0c82\\u0ca1"),
    u("\\u0c85\\u0caa\\u0ccd\\u0caa\\u0cc7\\u0ca8\\u0cb9\\u0cb3\\u0ccd\\u0cb3\\u0cbf \\u0ca4\\u0cbe\\u0c82\\u0ca6"),
    u("\\u0caa\\u0cc2\\u0c9c\\u0cbe\\u0cb0\\u0cb9\\u0cb3\\u0ccd\\u0cb3\\u0cbf \\u0ca4\\u0cbe\\u0c82\\u0ca1"),
    u("\\u0cae\\u0cb0\\u0cac\\u0ca8\\u0cb9\\u0cb3\\u0ccd\\u0cb3\\u0cbf"),
    u("\\u0ca8\\u0cb0\\u0cb8\\u0cbf\\u0c82\\u0cb9\\u0c97\\u0cbf\\u0cb0\\u0cbf"),
    u("\\u0c95\\u0cc2\\u0ca1\\u0ccd\\u0cb2\\u0c97\\u0cbf"),
    u("\\u0c97\\u0cc1\\u0ca3\\u0cb8\\u0cbe\\u0c97\\u0cb0"),
    u("\\u0ca4\\u0cbf\\u0caa\\u0ccd\\u0caa\\u0cc7\\u0cb9\\u0cb3\\u0ccd\\u0cb3\\u0cbf"),
    u("\\u0ca4\\u0cc1\\u0c82\\u0cac\\u0cb0\\u0c97\\u0cc1\\u0ca6\\u0ccd\\u0ca6\\u0cbf"),
    u("\\u0cb8\\u0cbf \\u0c8e\\u0cb8\\u0ccd \\u0caa\\u0cc1\\u0cb0"),
    u("\\u0cb8\\u0cbf\\u0c8e\\u0cb8\\u0ccd \\u0caa\\u0cc1\\u0cb0"),
    u("\\u0cac\\u0cca\\u0cae\\u0ccd\\u0cae\\u0ca8\\u0cb9\\u0cb3\\u0ccd\\u0cb3\\u0cbf"),
    u("\\u0caf\\u0c82\\u0cac\\u0cb3\\u0cbf\\u0cb5\\u0ca1\\u0ccd\\u0ca1\\u0cb0\\u0cb9\\u0c9f\\u0ccd\\u0c9f\\u0cbf"),
    u("\\u0cb8\\u0cbe\\u0ca3\\u0cc6\\u0cb9\\u0cb3\\u0ccd\\u0cb3\\u0cbf"),
    u("\\u0c95\\u0cb2\\u0ccd\\u0cb2\\u0cb9\\u0cb3\\u0ccd\\u0cb3\\u0cbf"),
    u("\\u0c8e\\u0c95\\u0ccd\\u0c95\\u0cc6\\u0c97\\u0cca\\u0c82\\u0ca6\\u0cbf"),
    u("\\u0cb0\\u0cbe\\u0cae\\u0cc1\\u0ca6\\u0cc1\\u0cb0\\u0ccd\\u0c97"),
    u("\\u0cb0\\u0cbe\\u0cae\\u0ca6\\u0cc1\\u0cb0\\u0ccd\\u0c97"),
    u("\\u0c97\\u0cc1\\u0ca1\\u0cc7\\u0c95\\u0cca\\u0c9f\\u0cc6"),
    u("\\u0cb8\\u0cc1\\u0cb2\\u0ccd\\u0ca4\\u0cbe\\u0ca8\\u0caa\\u0cc1\\u0cb0"),
    u("\\u0cb8\\u0cc1\\u0cb2\\u0ccd\\u0ca4\\u0cbe\\u0ca8\\u0ccd \\u0caa\\u0cc1\\u0cb0"),
    u("\\u0c95\\u0cbe\\u0cb3\\u0caa\\u0cc1\\u0cb0"),
    u("\\u0cae\\u0cca\\u0cb0\\u0cac"),
    u("\\u0c95\\u0cc2\\u0ca1\\u0ccd\\u0cb2\\u0cbf\\u0c97\\u0cbf"),
]


def load_places() -> list[str]:
    text = GP_JS.read_text(encoding="utf-8")
    places = set(re.findall(r'nameKn:\s*"([^"]+)"', text))
    places.update(EXTRA_PLACES)
    return sorted({norm(p) for p in places if p}, key=len, reverse=True)


def split_name_place(full: str, place_list: list[str]) -> tuple[str, str]:
    full = norm(full)
    for p in place_list:
        if len(p) < 3:
            continue
        if full.endswith(p) and len(full) > len(p) + 1:
            name = full[: -len(p)].strip(" -")
            if name:
                return name, p
    parts = full.split()
    if len(parts) >= 2:
        return " ".join(parts[:-1]), parts[-1]
    return full, ""


def main() -> None:
    place_list = load_places()
    wb = openpyxl.load_workbook(XLSX, data_only=True, read_only=True)
    ws = wb["Leaders 1"]
    rows = list(ws.iter_rows(values_only=True))
    wb.close()

    mla_name = u(
        "\\u0ca1\\u0cbe. \\u0cb6\\u0ccd\\u0cb0\\u0cc0\\u0ca8\\u0cbf\\u0cb5\\u0cbe\\u0cb8\\u0ccd \\u0c8e\\u0ca8\\u0ccd. \\u0c9f\\u0cbf."
    )
    mla_role = u(
        "\\u0cb6\\u0cbe\\u0cb8\\u0c95\\u0cb0\\u0cc1 - \\u0c95\\u0cc2\\u0ca1\\u0ccd\\u0cb2\\u0cbf\\u0c97\\u0cbf \\u0cb5\\u0cbf\\u0ca7\\u0cbe\\u0ca8\\u0cb8\\u0cad\\u0cbe \\u0c95\\u0ccd\\u0cb7\\u0cc7\\u0ca4\\u0ccd\\u0cb0"
    )
    mla_loc = u("\\u0c95\\u0cc2\\u0ca1\\u0ccd\\u0cb2\\u0cbf\\u0c97\\u0cbf / \\u0cb5\\u0cbf\\u0c9c\\u0caf\\u0ca8\\u0c97\\u0cb0")
    mla_bio = u(
        "\\u0c95\\u0cc2\\u0ca1\\u0ccd\\u0cb2\\u0cbf\\u0c97\\u0cbf \\u0cb6\\u0cbe\\u0cb8\\u0c95\\u0cb0\\u0cc1, \\u0c9c\\u0ca8\\u0cb8\\u0cc7\\u0cb5\\u0c95\\u0cb0\\u0cc1 \\u0cb9\\u0cbe\\u0c97\\u0cc2 \\u0ca4\\u0cbe\\u0cb2\\u0cc2\\u0c95\\u0cbf\\u0ca8 \\u0c85\\u0cad\\u0cbf\\u0cb5\\u0cc3\\u0ca6\\u0ccd\\u0ca7\\u0cbf\\u0caf \\u0cb0\\u0cc2\\u0cb5\\u0cbe\\u0cb0\\u0cbf."
    )
    role_leader = u("\\u0cae\\u0cc1\\u0c96\\u0c82\\u0ca1\\u0cb0\\u0cc1")
    cat_party_kn = u("\\u0caa\\u0c95\\u0ccd\\u0cb7\\u0ca6 \\u0cae\\u0cc1\\u0c96\\u0c82\\u0ca1\\u0cb0\\u0cc1")
    cat_taluk_kn = u("\\u0ca4\\u0cbe\\u0cb2\\u0cc2\\u0c95\\u0cc1 \\u0cae\\u0cc1\\u0c96\\u0c82\\u0ca1\\u0cb0\\u0cc1")
    cat_dist_kn = u("\\u0c9c\\u0cbf\\u0cb2\\u0ccd\\u0cb2\\u0cbe \\u0cae\\u0cc1\\u0c96\\u0c82\\u0ca1\\u0cb0\\u0cc1")
    mukhyaru = u("\\u0cae\\u0cc1\\u0c96\\u0c82\\u0ca1\\u0cb0")
    kra = u("\\u0c95\\u0ccd\\u0cb0")

    leaders = [
        {
            "id": "ldr-mla",
            "nameKn": mla_name,
            "nameEn": "Dr. Srinivas N. T.",
            "roleKn": mla_role,
            "roleEn": "MLA - Kudligi Constituency",
            "category": "district",
            "categoryKn": cat_dist_kn,
            "categoryEn": "District Leader",
            "locationKn": mla_loc,
            "phone": "9187154357",
            "whatsapp": "9187154357",
            "photo": "/Picsart_26-02-05_14-31-10-288 (1).png",
            "bioKn": mla_bio,
            "isImportant": True,
            "archivedAt": None,
        }
    ]

    seen: set[tuple[str, str]] = set()
    n = 0
    for r in rows[1:]:
        if not r or not r[1]:
            continue
        name_raw = norm(str(r[1]))
        if mukhyaru in name_raw or name_raw.startswith(kra):
            continue
        phone = phone_str(r[2] if len(r) > 2 else None)
        key = (name_raw, phone)
        if key in seen:
            continue
        seen.add(key)
        n += 1
        person, place = split_name_place(name_raw, place_list)
        leaders.append(
            {
                "id": f"ldr-{n:03d}",
                "nameKn": person or name_raw,
                "nameEn": "",
                "roleKn": role_leader,
                "roleEn": "Leader",
                "category": "party",
                "categoryKn": cat_party_kn,
                "categoryEn": "Party Leader",
                "locationKn": place,
                "phone": phone,
                "whatsapp": phone,
                "photo": "/cm_photo.png",
                "bioKn": "",
                "isImportant": False,
                "archivedAt": None,
            }
        )

    meta = {
        "party": {"categoryKn": cat_party_kn, "categoryEn": "Party Leader"},
        "taluk": {"categoryKn": cat_taluk_kn, "categoryEn": "Taluk Leader"},
        "district": {"categoryKn": cat_dist_kn, "categoryEn": "District Leader"},
    }

    content = (
        "export const LEADER_CATEGORY_META = "
        + json.dumps(meta, ensure_ascii=False, indent=2)
        + ";\n\n"
        + "/** Leaders from BACKEND DATA.xlsx sheet Leaders 1.\n"
        + " * Sheet has no district/taluk level — imported as party (MLA kept as district).\n"
        + " * Regenerated by: frontend/scripts/import_leaders_from_xlsx.py\n"
        + " */\n"
        + "export const leadersSeed = "
        + json.dumps(leaders, ensure_ascii=False, indent=2)
        + ";\n"
    )
    OUT.write_text(content, encoding="utf-8")
    print(
        json.dumps(
            {
                "total": len(leaders),
                "fromSheet": n,
                "withPhone": sum(1 for x in leaders if x["phone"]),
                "out": str(OUT.relative_to(ROOT)),
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
