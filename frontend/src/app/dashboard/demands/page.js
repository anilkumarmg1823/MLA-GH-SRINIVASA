"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import PageLoader from "@/components/ui/PageLoader";
import KudligiLoader from "@/components/ui/KudligiLoader";
import { useGlobalLoader } from "@/components/ui/GlobalLoaderProvider";

export default function DemandsPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const { withLoader } = useGlobalLoader();
  const [allowed, setAllowed] = useState(false);
  const [session, setSessionState] = useState(null);
  const [gramPanchayat, setGramPanchayat] = useState("");
  const [village, setVillage] = useState("");
  const [approachTab, setApproachTab] = useState("civil");
  const [rows, setRows] = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const allRowsCache = useRef([]);

  useEffect(() => {
    const s = getSession();
    if (!s || !canAccessDemands(s)) {
      router.replace("/login");
      return;
    }
    setSessionState(s);
    setAllowed(true);
  }, [router]);

  const ensureAllRows = useCallback(async () => {
    if (allRowsCache.current.length) return allRowsCache.current;
    const all = await getAllBedke();
    allRowsCache.current = all;
    setAllRows(all);
    return all;
  }, []);

  const refresh = useCallback(async () => {
    if (!gramPanchayat && !village) {
      setRows([]);
      setListLoading(true);
      try {
        await withLoader(() => ensureAllRows());
      } finally {
        setListLoading(false);
      }
      return;
    }
    if (!gramPanchayat || !village) {
      setRows([]);
      return;
    }

    setListLoading(true);
    try {
      await withLoader(async () => {
        const villageRows = await getBedkeForVillage(gramPanchayat, village);
        setRows(villageRows);
        // keep search / extra village options warm in background cache
        if (!allRowsCache.current.length) {
          const all = await getAllBedke();
          allRowsCache.current = all;
          setAllRows(all);
        }
      });
    } finally {
      setListLoading(false);
    }
  }, [gramPanchayat, village, withLoader, ensureAllRows]);

  useEffect(() => {
    if (!allowed) return;
    refresh();
  }, [allowed, refresh]);

  const extraVillages = useMemo(() => {
    if (!gramPanchayat) return [];
    const set = new Set();
    for (const d of allRows) {
      if (d.gramPanchayat === gramPanchayat && d.village) set.add(d.village);
    }
    return [...set];
  }, [allRows, gramPanchayat]);

  const civilRows = useMemo(
    () => rows.filter((r) => r.approach === "civil"),
    [rows]
  );
  const personalRows = useMemo(
    () => rows.filter((r) => r.approach === "personal"),
    [rows]
  );

  const tabRows = approachTab === "personal" ? personalRows : civilRows;

  const displayRows = useMemo(() => {
    let list = [...tabRows];
    if (statusFilter !== "all") {
      list = list.filter((r) => r.status === statusFilter);
    }
    list.sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      if (sortBy === "name") {
        return String(a.name || "").localeCompare(String(b.name || ""), lang === "kn" ? "kn" : "en");
      }
      // newest
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
    return list;
  }, [tabRows, statusFilter, sortBy, lang]);

  const handleGpChange = (gp) => {
    setGramPanchayat(gp);
    setVillage("");
    setRows([]);
    setStatusFilter("all");
  };

  const handleClear = () => {
    setGramPanchayat("");
    setVillage("");
    setApproachTab("civil");
    setStatusFilter("all");
    setSortBy("newest");
    setRows([]);
  };

  const handleSave = async (payload) => {
    await withLoader(async () => {
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
      allRowsCache.current = [];
      setAllRows([]);
      setFormOpen(false);
      setEditingRow(null);
      setApproachTab(payload.approach === "personal" ? "personal" : "civil");
      setGramPanchayat(payload.gramPanchayat);
      setVillage(payload.village);
      const villageRows = await getBedkeForVillage(
        payload.gramPanchayat,
        payload.village
      );
      setRows(villageRows);
      await ensureAllRows();
    });
  };

  const handleSearchSelect = async (row) => {
    setSearchOpen(false);
    setGramPanchayat(row.gramPanchayat);
    setVillage(row.village);
    setApproachTab(row.approach === "personal" ? "personal" : "civil");
    setListLoading(true);
    try {
      await withLoader(async () => {
        const villageRows = await getBedkeForVillage(
          row.gramPanchayat,
          row.village
        );
        setRows(villageRows);
      });
    } finally {
      setListLoading(false);
    }
  };

  if (!allowed) {
    return <PageLoader />;
  }

  const filtersReady = Boolean(gramPanchayat && village);
  const canAdd = canDo(session, "demands", "add");
  const canEdit = canDo(session, "demands", "edit");
  const canArchive = canDo(session, "demands", "delete");
  const canDownload = canDo(session, "demands", "download");

  const handleArchive = async (row) => {
    if (
      !window.confirm(
        t.archiveConfirm ||
          "Archive this demand? It will be hidden, not deleted."
      )
    ) {
      return;
    }
    await withLoader(async () => {
      await deleteBedke(row.id);
      allRowsCache.current = [];
      setAllRows([]);
      await refresh();
    });
  };

  return (
    <div>
      <div className="mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-[var(--dash-text)] tracking-wide">
            {t.navDemands}
          </h1>
          <p className="text-sm text-[var(--dash-text-50)] mt-1">
            {t.bedkePageDesc}
          </p>
          {filtersReady && (
            <p className="text-sm text-[#CCBCA5] mt-1">
              {getGpLabel(gramPanchayat, lang)} ·{" "}
              {getVillageLabel(gramPanchayat, village, lang)}
              {rows.length > 0 ? ` · ${rows.length}` : ""}
            </p>
          )}
        </div>
        <QuickLinks
          onSearch={async () => {
            await withLoader(() => ensureAllRows());
            setSearchOpen(true);
          }}
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
          showExtraFilters
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          statusOptions={[
            { value: "all", label: t.filterStatusAll },
            { value: "Pending", label: t.bedkePending },
            {
              value: "InProgress",
              label: t.bedkeInProgress || (lang === "kn" ? "ಪ್ರಗತಿಯಲ್ಲಿ" : "In progress"),
            },
            {
              value: "Completed",
              label: t.bedkeCompleted || (lang === "kn" ? "ಪೂರ್ಣ" : "Completed"),
            },
            {
              value: "Rejected",
              label: t.bedkeRejected || (lang === "kn" ? "ತಿರಸ್ಕೃತ" : "Rejected"),
            },
          ]}
          sortOptions={[
            { value: "newest", label: t.sortNewest },
            { value: "oldest", label: t.sortOldest },
            { value: "name", label: t.sortName },
          ]}
          extraVillages={extraVillages}
        />
      </div>

      {gramPanchayat && !village ? (
        <div className="rounded-2xl border border-dashed border-[#CCBCA5]/35 bg-[var(--dash-panel-soft)] backdrop-blur-sm px-6 py-12 text-center text-[var(--dash-text-55)] text-sm">
          {t.pickVillageHint}
        </div>
      ) : null}

      {filtersReady && listLoading ? (
        <KudligiLoader
          variant="block"
          subKn="ಬೇಡಿಕೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ…"
          subEn="Loading demands…"
        />
      ) : null}

      {filtersReady && !listLoading ? (
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
