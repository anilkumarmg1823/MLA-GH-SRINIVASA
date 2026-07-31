"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { getSession, canAccessDevelopment, canDo } from "@/lib/auth";
import {
  addDevelopment,
  deleteDevelopment,
  getAllDevelopments,
  getDevelopmentsForVillage,
  updateDevelopment,
} from "@/lib/developmentsStore";
import {
  getGpLabel,
  getVillageLabel,
} from "@/data/gramPanchayats";
import GpVillageFilters from "@/components/development/GpVillageFilters";
import DevelopmentTable from "@/components/development/DevelopmentTable";
import DevelopmentFormModal from "@/components/development/DevelopmentFormModal";
import DevelopmentDetailModal from "@/components/development/DevelopmentDetailModal";
import DevelopmentCharts from "@/components/development/DevelopmentCharts";
import QuickLinks from "@/components/development/QuickLinks";
import DownloadModal from "@/components/development/DownloadModal";
import SearchModal from "@/components/development/SearchModal";

function sortRows(list, sortBy, lang) {
  const next = [...list];
  const nameOf = (r) =>
    (lang === "kn" && r.nameKn ? r.nameKn : r.name || "").toLowerCase();
  const dateOf = (r) => {
    const d = r.startDate || r.createdAt || "";
    const t = Date.parse(d);
    return Number.isNaN(t) ? 0 : t;
  };

  switch (sortBy) {
    case "oldest":
      return next.sort((a, b) => dateOf(a) - dateOf(b));
    case "amount_high":
      return next.sort(
        (a, b) => (b.amountSanctioned || 0) - (a.amountSanctioned || 0)
      );
    case "amount_low":
      return next.sort(
        (a, b) => (a.amountSanctioned || 0) - (b.amountSanctioned || 0)
      );
    case "name":
      return next.sort((a, b) => nameOf(a).localeCompare(nameOf(b)));
    case "newest":
    default:
      return next.sort((a, b) => dateOf(b) - dateOf(a));
  }
}

export default function DevelopmentPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [allowed, setAllowed] = useState(false);
  const [gramPanchayat, setGramPanchayat] = useState("");
  const [village, setVillage] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [rows, setRows] = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detailRecord, setDetailRecord] = useState(null);
  const [session, setSessionState] = useState(null);

  useEffect(() => {
    const s = getSession();
    if (!s || !canAccessDevelopment(s)) {
      router.replace("/login");
      return;
    }
    setSessionState(s);
    setAllowed(true);
  }, [router]);

  const refresh = useCallback(async () => {
    const all = await getAllDevelopments();
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

  const displayRows = useMemo(() => {
    let list = rows;
    if (statusFilter !== "all") {
      list = list.filter((r) => r.status === statusFilter);
    }
    return sortRows(list, sortBy, lang);
  }, [rows, statusFilter, sortBy, lang]);

  const handleGpChange = (gp) => {
    setGramPanchayat(gp);
    setVillage("");
    setStatusFilter("all");
  };

  const handleClearFilters = () => {
    setGramPanchayat("");
    setVillage("");
    setStatusFilter("all");
    setSortBy("newest");
  };

  const handleAdd = () => {
    setDetailRecord(null);
    setEditing(null);
    setFormOpen(true);
  };

  const handleOpenDetail = (row) => {
    setDetailRecord(row);
  };

  const handleSearchSelect = async (row) => {
    setSearchOpen(false);
    setGramPanchayat(row.gramPanchayat);
    setVillage(row.village);
    setStatusFilter("all");
    const villageRows = await getDevelopmentsForVillage(
      row.gramPanchayat,
      row.village
    );
    setRows(villageRows);
    setDetailRecord(row);
  };

  const handleEditFromDetail = (row) => {
    setDetailRecord(null);
    setEditing(row);
    setFormOpen(true);
  };

  const handleDeleteFromDetail = async (row) => {
    if (!window.confirm(t.confirmDelete)) return;
    await deleteDevelopment(row.id);
    setDetailRecord(null);
    await refresh();
  };

  const handleSave = async (payload) => {
    if (editing) {
      await updateDevelopment(editing.id, payload);
    } else {
      await addDevelopment(payload);
    }
    setFormOpen(false);
    setEditing(null);
    setGramPanchayat(payload.gramPanchayat);
    setVillage(payload.village);
    setStatusFilter("all");
    const all = await getAllDevelopments();
    setAllRows(all);
    setRows(
      all.filter(
        (d) =>
          d.gramPanchayat === payload.gramPanchayat &&
          d.village === payload.village
      )
    );
  };

  if (!allowed) {
    return (
      <div className="text-[var(--dash-text-50)] text-sm py-8 text-center">Loading…</div>
    );
  }

  const filtersReady = Boolean(gramPanchayat && village);
  const showOverview = !gramPanchayat && !village;
  const gpOnly = Boolean(gramPanchayat && !village);
  const isFilteredEmpty =
    filtersReady && rows.length > 0 && displayRows.length === 0;
  const canAdd = canDo(session, "development", "add");
  const canEdit = canDo(session, "development", "edit");
  const canDelete = canDo(session, "development", "delete");
  const canDownload = canDo(session, "development", "download");

  return (
    <div>
      <div className="mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-[var(--dash-text)] tracking-wide">
            {t.development}
          </h1>
          {filtersReady && (
            <p className="text-sm text-[#CCBCA5] mt-1">
              {getGpLabel(gramPanchayat, lang)} ·{" "}
              {getVillageLabel(gramPanchayat, village, lang)}
              {displayRows.length > 0 ? ` · ${displayRows.length}` : ""}
            </p>
          )}
        </div>
        <QuickLinks
          onSearch={() => setSearchOpen(true)}
          onAdd={handleAdd}
          onDownload={() => setDownloadOpen(true)}
          canAdd={canAdd}
          canDownload={canDownload}
        />
      </div>

      {showOverview && <DevelopmentCharts rows={allRows} />}

      <div className="mb-5 rounded-2xl bg-[var(--dash-panel-soft)] backdrop-blur-sm border border-[#CCBCA5]/25 p-4 sm:p-5 shadow-lg">
        <GpVillageFilters
          gramPanchayat={gramPanchayat}
          village={village}
          onGpChange={handleGpChange}
          onVillageChange={setVillage}
          onClear={handleClearFilters}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
        />
      </div>

      {gpOnly && (
        <div className="rounded-2xl border border-dashed border-[#CCBCA5]/35 bg-[var(--dash-panel-soft)] backdrop-blur-sm px-6 py-12 text-center text-[var(--dash-text-55)] text-sm">
          {t.pickVillageHint}
        </div>
      )}

      {filtersReady ? (
        isFilteredEmpty ? (
          <div className="rounded-2xl border border-dashed border-[#CCBCA5]/40 bg-[var(--dash-panel-soft)] backdrop-blur-sm px-6 py-14 text-center space-y-3">
            <p className="text-[var(--dash-text-50)]">{t.noRowsFiltered}</p>
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className="text-sm font-bold text-[#CCBCA5] hover:text-[var(--dash-text)]"
            >
              {t.filterStatusAll}
            </button>
          </div>
        ) : (
          <DevelopmentTable
            rows={displayRows}
            onOpen={handleOpenDetail}
            onAdd={canAdd ? handleAdd : null}
          />
        )
      ) : null}

      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        records={allRows}
        onSelect={handleSearchSelect}
      />

      <DevelopmentDetailModal
        open={Boolean(detailRecord)}
        record={detailRecord}
        onClose={() => setDetailRecord(null)}
        onEdit={canEdit ? handleEditFromDetail : null}
        onDelete={canDelete ? handleDeleteFromDetail : null}
      />

      <DevelopmentFormModal
        open={formOpen}
        initial={editing}
        gramPanchayat={gramPanchayat}
        village={village}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />

      <DownloadModal
        open={downloadOpen}
        onClose={() => setDownloadOpen(false)}
        currentGp={gramPanchayat}
        currentVillage={village}
      />
    </div>
  );
}
