"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { getSession, canAccessDemands, canDo } from "@/lib/auth";
import {
  addBedke,
  updateBedke,
  deleteBedke,
  getAllBedke,
  getBedkeForVillage,
} from "@/lib/bedkeStore";
import { getGpLabel, getVillageLabel } from "@/data/gramPanchayats";
import GpVillageFilters from "@/components/development/GpVillageFilters";
import QuickLinks from "@/components/development/QuickLinks";
import BedkeTabs from "@/components/bedke/BedkeTabs";
import BedkeList from "@/components/bedke/BedkeList";
import BedkeFormModal from "@/components/bedke/BedkeFormModal";
import BedkeSearchModal from "@/components/bedke/BedkeSearchModal";
import BedkeDownloadModal from "@/components/bedke/BedkeDownloadModal";

export default function DemandsPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [allowed, setAllowed] = useState(false);
  const [session, setSessionState] = useState(null);
  const [gramPanchayat, setGramPanchayat] = useState("");
  const [village, setVillage] = useState("");
  const [approachTab, setApproachTab] = useState("civil");
  const [rows, setRows] = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s || !canAccessDemands(s)) {
      router.replace("/login");
      return;
    }
    setSessionState(s);
    setAllowed(true);
  }, [router]);

  const refresh = useCallback(async () => {
    const all = await getAllBedke();
    setAllRows(all);
    if (!gramPanchayat || !village) {
      setRows([]);
      return;
    }
    setRows(
      all.filter(
        (d) => d.gramPanchayat === gramPanchayat && d.village === village
      )
    );
  }, [gramPanchayat, village]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const civilRows = useMemo(
    () => rows.filter((r) => r.approach === "civil"),
    [rows]
  );
  const personalRows = useMemo(
    () => rows.filter((r) => r.approach === "personal"),
    [rows]
  );
  const displayRows = approachTab === "personal" ? personalRows : civilRows;

  const handleGpChange = (gp) => {
    setGramPanchayat(gp);
    setVillage("");
  };

  const handleClear = () => {
    setGramPanchayat("");
    setVillage("");
    setApproachTab("civil");
  };

  const handleSave = async (payload) => {
    if (payload.id) {
      await updateBedke(payload.id, {
        gramPanchayat: payload.gramPanchayat,
        village: payload.village,
        name: payload.name,
        approach: payload.approach,
        subject: payload.subject,
        status: payload.status,
      });
    } else {
      await addBedke(payload);
    }
    setFormOpen(false);
    setEditingRow(null);
    setApproachTab(payload.approach === "personal" ? "personal" : "civil");
    setGramPanchayat(payload.gramPanchayat);
    setVillage(payload.village);
    const all = await getAllBedke();
    setAllRows(all);
    setRows(
      all.filter(
        (d) =>
          d.gramPanchayat === payload.gramPanchayat &&
          d.village === payload.village
      )
    );
  };

  const handleSearchSelect = async (row) => {
    setSearchOpen(false);
    setGramPanchayat(row.gramPanchayat);
    setVillage(row.village);
    setApproachTab(row.approach === "personal" ? "personal" : "civil");
    const villageRows = await getBedkeForVillage(
      row.gramPanchayat,
      row.village
    );
    setRows(villageRows);
  };

  if (!allowed) {
    return (
      <div className="text-[var(--dash-text-50)] text-sm py-8 text-center">Loading…</div>
    );
  }

  const filtersReady = Boolean(gramPanchayat && village);
  const canAdd = canDo(session, "demands", "add");
  const canEdit = canDo(session, "demands", "edit");
  const canArchive = canDo(session, "demands", "delete");
  const canDownload = canDo(session, "demands", "download");

  const handleArchive = async (row) => {
    if (!window.confirm(t.archiveConfirm || "Archive this demand? It will be hidden, not deleted.")) {
      return;
    }
    await deleteBedke(row.id);
    await refresh();
  };

  return (
    <div>
      <div className="mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-[var(--dash-text)] tracking-wide">
            {t.navDemands}
          </h1>
          <p className="text-sm text-[var(--dash-text-50)] mt-1">{t.bedkePageDesc}</p>
          {filtersReady && (
            <p className="text-sm text-[#CCBCA5] mt-1">
              {getGpLabel(gramPanchayat, lang)} ·{" "}
              {getVillageLabel(gramPanchayat, village, lang)}
              {rows.length > 0 ? ` · ${rows.length}` : ""}
            </p>
          )}
        </div>
        <QuickLinks
          onSearch={() => setSearchOpen(true)}
          onAdd={() => {
            setEditingRow(null);
            setFormOpen(true);
          }}
          onDownload={() => setDownloadOpen(true)}
          canAdd={canAdd && filtersReady}
          canDownload={canDownload}
          addLabel={t.bedkeAdd}
        />
      </div>

      <div className="mb-5 rounded-2xl bg-[var(--dash-panel-soft)] backdrop-blur-sm border border-[#CCBCA5]/25 p-4 sm:p-5 shadow-lg">
        <GpVillageFilters
          gramPanchayat={gramPanchayat}
          village={village}
          onGpChange={handleGpChange}
          onVillageChange={setVillage}
          onClear={handleClear}
          showExtraFilters={false}
        />
      </div>

      {gramPanchayat && !village ? (
        <div className="rounded-2xl border border-dashed border-[#CCBCA5]/35 bg-[var(--dash-panel-soft)] backdrop-blur-sm px-6 py-12 text-center text-[var(--dash-text-55)] text-sm">
          {t.pickVillageHint}
        </div>
      ) : null}

      {filtersReady ? (
        <div className="space-y-4">
          <BedkeTabs
            value={approachTab}
            onChange={setApproachTab}
            civilCount={civilRows.length}
            personalCount={personalRows.length}
          />
          <BedkeList
            rows={displayRows}
            canAdd={canAdd}
            canEdit={canEdit}
            canArchive={canArchive}
            onAdd={() => {
              setEditingRow(null);
              setFormOpen(true);
            }}
            onEdit={(row) => {
              setEditingRow(row);
              setFormOpen(true);
            }}
            onArchive={handleArchive}
          />
        </div>
      ) : null}

      {!gramPanchayat && !village ? (
        <div className="rounded-2xl border border-dashed border-[#CCBCA5]/30 bg-[var(--dash-panel-soft)] px-6 py-14 text-center text-[var(--dash-text-45)] text-sm">
          {t.bedkePickGpHint}
        </div>
      ) : null}

      <BedkeFormModal
        open={formOpen}
        gramPanchayat={gramPanchayat}
        village={village}
        defaultApproach={approachTab}
        initial={editingRow}
        onClose={() => {
          setFormOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleSave}
      />

      <BedkeSearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        records={allRows}
        onSelect={handleSearchSelect}
      />

      <BedkeDownloadModal
        open={downloadOpen}
        onClose={() => setDownloadOpen(false)}
        currentGp={gramPanchayat}
        currentVillage={village}
      />
    </div>
  );
}
