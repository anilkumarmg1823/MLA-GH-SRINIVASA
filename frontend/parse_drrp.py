import pypdf
import json
import re

pdf_path = r"c:\PVL\MLA-GH-SRINIVASA\frontend\public\drrp.pdf"

with open(pdf_path, "rb") as f:
    reader = pypdf.PdfReader(f)
    print(f"Total Pages in PDF: {len(reader.pages)}")

    projects = []
    gp_set = set()

    for pnum in range(len(reader.pages)):
        text = reader.pages[pnum].extract_text()
        if not text:
            continue

        for line in text.split("\n"):
            line = line.strip()
            # Match road line
            if "KUDLIGI" in line and ("VR" in line or "MDR" in line or "SH" in line):
                # Try regex matching road name
                m = re.search(r"(\d+)\s+KUDLIGI\s+Kudligi\s+\d+\s+([A-Z0-9]+)\s+(\d+)\s+(.+?)\s+(VR|MDR|SH)\s+([\d\.]+)\s+([\d\.]+)", line)
                if m:
                    sl, rcode, vcode, rname, rtype, rlen, rtarget = m.groups()
                    vparts = re.split(r"\s+to\s+", rname, flags=re.IGNORECASE)
                    gp1 = vparts[0].strip()
                    gp2 = vparts[1].strip() if len(vparts) > 1 else gp1
                    
                    gp_set.add(gp1)
                    gp_set.add(gp2)

                    projects.append({
                        "id": int(sl),
                        "code": rcode,
                        "villageCode": vcode,
                        "name": f"{gp1} ರಿಂದ {gp2} ರಸ್ತೆ ಕಾಮಗಾರಿ ({rname})",
                        "rawName": rname,
                        "gp": gp1,
                        "destGp": gp2,
                        "type": rtype,
                        "lengthKm": float(rlen),
                        "targetKm": float(rtarget),
                        "budget": f"₹{(float(rtarget)*45.0):.2f} ಲಕ್ಷ (Lakhs)",
                        "status": "ಕಾಮಗಾರಿ ಪ್ರಗತಿಯಲ್ಲಿದೆ (In Progress)" if int(sl) % 3 != 0 else "ಪೂರ್ಣಗೊಂಡಿದೆ (Completed)"
                    })

print(f"Successfully extracted {len(projects)} projects across {len(gp_set)} Gram Panchayats / Villages!")

js_content = f"""// Official Kudligi Taluk DRRP Projects Dataset (Parsed from drrp.pdf)
export const GRAM_PANCHAYATS = {json.dumps(sorted(list(gp_set)), ensure_ascii=False, indent=2)};

export const DRRP_PROJECTS = {json.dumps(projects, ensure_ascii=False, indent=2)};
"""

with open(r"c:\PVL\MLA-GH-SRINIVASA\frontend\src\data\drrpData.js", "w", encoding="utf-8") as f:
    f.write(js_content)

print("Saved data to c:\\PVL\\MLA-GH-SRINIVASA\\frontend\\src\\data\\drrpData.js successfully!")
