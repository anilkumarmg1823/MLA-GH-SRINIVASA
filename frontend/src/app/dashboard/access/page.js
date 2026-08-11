"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaPlus,
  FaTrashAlt,
  FaTimes,
  FaUserPlus,
  FaEdit,
  FaQrcode,
  FaKey,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import { getSession } from "@/lib/auth";
import { toKannadaName, confirmEnglishSaveIfNeeded, looksLikeEnglish } from "@/lib/transliterateName";
import {
  ACCESS_ACTIONS,
  MANAGEABLE_MODULES,
  getAllStaffAccess,
  upsertStaffAccess,
  deleteStaffAccess,
  enrollStaffTotp,
  resetStaffTotp,
} from "@/lib/permissionsStore";
import PageLoader from "@/components/ui/PageLoader";
import KudligiLoader from "@/components/ui/KudligiLoader";
import { useGlobalLoader } from "@/components/ui/GlobalLoaderProvider";
import { useEscapeKey } from "@/hooks/useEscapeKey";

const PAGE_SIZE = 10;
function emptyPerms() {
  return {
    view: false,
    add: false,
    edit: false,
    delete: false,
    download: false,
  };
}

function blankModules() {
  const modules = {};
  MANAGEABLE_MODULES.forEach((m) => {
    modules[m.id] = emptyPerms();
  });
  return modules;
}

function hasAnyAccess(perms) {
  return ACCESS_ACTIONS.some((a) => perms?.[a.id]);
}

/** Main name always; Kannada only if a separate KN name was set */
function staffDisplayName(user) {
  return (user?.name || "").trim() || "Staff";
}

function staffKannadaName(user) {
  const en = (user?.name || "").trim();
  const kn = (user?.nameKn || "").trim();
  if (!kn || kn === en) return "";
  return kn;
}

function Checkbox({ checked, onChange, label, disabled }) {
  return (
    <label
      className={`inline-flex items-center justify-center ${
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only peer"
        aria-label={label}
      />
      <span
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          checked
            ? "bg-[#CCBCA5] border-[#CCBCA5]"
            : "border-[var(--dash-border-soft)] bg-transparent hover:border-[#CCBCA5]/60"
        }`}
      >
        {checked ? (
          <svg
            viewBox="0 0 12 12"
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 6l3 3 5-5" />
          </svg>
        ) : null}
      </span>
    </label>
  );
}

export default function AccessManagementPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const { withLoader } = useGlobalLoader();
  const [allowed, setAllowed] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [staff, setStaff] = useState([]);
  const [tab, setTab] = useState(MANAGEABLE_MODULES[0]?.id || "development");
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState({ phone: "", name: "", nameKn: "" });
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    phone: "",
    name: "",
    nameKn: "",
    perms: emptyPerms(),
  });
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [totpModal, setTotpModal] = useState(null); // { phone, name, secret, qrDataUrl }
  const [totpBusyId, setTotpBusyId] = useState(null);

  const refresh = useCallback(async () => {
    const list = await getAllStaffAccess();
    setStaff(list);
    return list;
  }, []);

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "admin") {
      router.replace("/login");
      return;
    }
    setAllowed(true);
    setListLoading(true);
    refresh()
      .catch(() => setStaff([]))
      .finally(() => setListLoading(false));
  }, [router, refresh]);

  const activeModule = MANAGEABLE_MODULES.find((m) => m.id === tab);

  const usersOnTab = useMemo(
    () =>
      staff
        .filter((s) => hasAnyAccess(s.modules?.[tab]))
        .sort((a, b) => (a.name || "").localeCompare(b.name || "")),
    [staff, tab]
  );

  const totalPages = Math.max(1, Math.ceil(usersOnTab.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageUsers = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return usersOnTab.slice(start, start + PAGE_SIZE);
  }, [usersOnTab, safePage]);

  useEffect(() => {
    setPage(1);
  }, [tab]);

  const persist = async (record) => {
    const result = await upsertStaffAccess(record);
    if (!result.ok) {
      if (result.error === "PHONE_TAKEN") setError(t.accessPhoneTaken);
      else setError(t.accessInvalidPhone);
      return null;
    }
    await refresh();
    return result.item;
  };

  const cancelEdit = useCallback(() => {
    setEditingUser(null);
    setEditForm({ phone: "", name: "", nameKn: "", perms: emptyPerms() });
    setError("");
  }, []);

  const cancelAdd = useCallback(() => {
    setAdding(false);
    setAddForm({ phone: "", name: "", nameKn: "" });
    setError("");
  }, []);

  useEscapeKey(Boolean(editingUser), cancelEdit);
  useEscapeKey(Boolean(adding), cancelAdd);
  useEscapeKey(Boolean(totpModal), () => setTotpModal(null));

  const startEdit = (user) => {
    cancelAdd();
    setError("");
    setEditingUser(user);
    setEditForm({
      phone: user.phone || "",
      name: user.name || "",
      nameKn: staffKannadaName(user),
      perms: { ...emptyPerms(), ...(user.modules?.[tab] || {}) },
    });
  };

  const openAdd = () => {
    cancelEdit();
    setError("");
    setAddForm({ phone: "", name: "", nameKn: "" });
    setAdding(true);
  };

  const toggleDraftPerm = (actionId) => {
    setEditForm((prev) => {
      const next = { ...prev.perms, [actionId]: !prev.perms[actionId] };
      if (actionId !== "view" && next[actionId]) next.view = true;
      if (actionId === "view" && !next.view) {
        next.add = false;
        next.edit = false;
        next.delete = false;
        next.download = false;
      }
      return { ...prev, perms: next };
    });
  };

  const saveEdit = async () => {
    const user = editingUser;
    if (!user) return;
    setError("");
    const digits = String(editForm.phone || "").replace(/\D/g, "");
    if (digits.length !== 10) {
      setError(t.accessInvalidPhone);
      return;
    }
    const name = (editForm.name || "").trim();
    if (!name) {
      setError(t.accessNameRequired);
      return;
    }

    // Kannada is optional. Blank = use English name in Kannada mode too.
    const nameKn = (editForm.nameKn || "").trim();

    if (
      lang === "kn" &&
      looksLikeEnglish(name) &&
      !nameKn &&
      !confirmEnglishSaveIfNeeded(lang, [name], t.confirmEnglishSave)
    ) {
      return;
    }

    if (!hasAnyAccess(editForm.perms)) {
      setError(t.accessNeedOnePerm);
      return;
    }

    const modules = { ...blankModules(), ...(user.modules || {}) };
    modules[tab] = { ...emptyPerms(), ...editForm.perms };

    await withLoader(async () => {
      const result = await persist({
        id: user.id,
        phone: digits,
        name,
        nameKn,
        modules,
      });
      if (!result) return;
      cancelEdit();
      setToast(t.accessSaved);
    });
  };

  const removeFromPortal = async (user) => {
    if (!window.confirm(t.accessRemoveFromPortal)) return;
    const modules = { ...blankModules(), ...(user.modules || {}) };
    modules[tab] = emptyPerms();

    const stillHasOther = MANAGEABLE_MODULES.some(
      (m) => m.id !== tab && hasAnyAccess(modules[m.id])
    );

    await withLoader(async () => {
      if (!stillHasOther) {
        await deleteStaffAccess(user.id);
        await refresh();
      } else {
        await persist({ ...user, modules });
      }
      if (editingUser?.id === user.id) cancelEdit();
      setToast(t.accessRemovedFromPortal);
    });
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setError("");
    const digits = String(addForm.phone || "").replace(/\D/g, "");
    if (digits.length !== 10) {
      setError(t.accessInvalidPhone);
      return;
    }
    const name = (addForm.name || "").trim();
    if (!name) {
      setError(t.accessNameRequired);
      return;
    }

    const nameKn = (addForm.nameKn || "").trim();
    if (
      lang === "kn" &&
      looksLikeEnglish(name) &&
      !nameKn &&
      !confirmEnglishSaveIfNeeded(lang, [name], t.confirmEnglishSave)
    ) {
      return;
    }

    const existing = staff.find((s) => s.phone === digits);
    const modules = existing
      ? { ...blankModules(), ...existing.modules }
      : blankModules();

    modules[tab] = {
      ...emptyPerms(),
      ...(modules[tab] || {}),
      view: true,
    };

    await withLoader(async () => {
      const item = await persist({
        id: existing?.id,
        phone: digits,
        name,
        nameKn,
        modules,
      });

      if (!item) return;
      cancelAdd();
      if (item.totpReused || item.revived) {
        setToast(t.accessTotpReused || t.accessStaffAdded);
      } else {
        setToast(t.accessStaffAdded);
      }
    });
  };

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  const openTotpEnroll = async (user, { reset = false } = {}) => {
    setError("");
    // Rehydrate Authorization token from session before admin TOTP calls
    getSession();
    if (reset) {
      const ok = window.confirm(
        t.accessTotpResetWarn ||
          "Reset creates a NEW Authenticator entry. Delete the old Kudligi entry in the app first, then scan the new QR."
      );
      if (!ok) return;
    }
    setTotpBusyId(user.id);
    try {
      await withLoader(async () => {
        const data = reset
          ? await resetStaffTotp(user.id)
          : await enrollStaffTotp(user.id);

        if (!reset && data?.alreadyEnrolled) {
          setTotpModal({
            phone: data.phone || user.phone,
            name: data.name || user.name,
            alreadyEnrolled: true,
            secret: null,
            qrDataUrl: null,
            reset: false,
          });
          setToast(t.accessTotpAlreadyEnrolled);
          await refresh();
          return;
        }

        setTotpModal({
          phone: data.phone || user.phone,
          name: data.name || user.name,
          secret: data.secret,
          qrDataUrl: data.qrDataUrl,
          reset,
          alreadyEnrolled: false,
        });
        await refresh();
        setToast(reset ? t.accessTotpResetDone : t.accessTotpReady);
      });
    } catch (err) {
      setError(err?.message || "Could not enroll Authenticator");
    } finally {
      setTotpBusyId(null);
    }
  };


  if (!allowed) {
    return <PageLoader />;
  }

  if (listLoading) {
    return (
      <KudligiLoader
        variant="block"
        subKn="ಪ್ರವೇಶ ಪಟ್ಟಿ ಲೋಡ್ ಆಗುತ್ತಿದೆ…"
        subEn="Loading access list…"
      />
    );
  }

  return (
    <div className="w-full">
      <div className="mb-5">
        <h1 className="text-2xl font-black text-[var(--dash-text)] tracking-wide">
          {t.manageAccess}
        </h1>
        <p className="text-sm text-[#CCBCA5] mt-1">{t.manageAccessDesc}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-5 border-b border-[#CCBCA5]/20 pb-3">
        {MANAGEABLE_MODULES.map((mod) => {
          const count = staff.filter((s) =>
            hasAnyAccess(s.modules?.[mod.id])
          ).length;
          const on = tab === mod.id;
          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => {
                setTab(mod.id);
                cancelAdd();
                cancelEdit();
                setError("");
              }}
              className={`px-4 py-2 rounded-full text-sm font-black transition-colors ${
                on
                  ? "bg-[#CCBCA5] text-[#1e2223]"
                  : "border border-[#CCBCA5]/35 text-[#CCBCA5] hover:bg-[#CCBCA5]/10"
              }`}
            >
              {lang === "kn" ? mod.labelKn : mod.labelEn}
              <span
                className={`ml-2 text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  on
                    ? "bg-black/15 text-[#1e2223]"
                    : "bg-[var(--dash-hover-strong)] text-[var(--dash-text-60)]"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-[#CCBCA5]/25 bg-[var(--dash-panel)] overflow-hidden w-full">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-[#CCBCA5]/15">
          <div>
            <p className="text-sm font-black text-[var(--dash-text)]">
              {lang === "kn" ? activeModule?.labelKn : activeModule?.labelEn}
            </p>
            <p className="text-xs text-[var(--dash-text-45)] mt-0.5">
              {t.accessUsersOnPortal} · {usersOnTab.length}
            </p>
          </div>
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#CCBCA5] text-[#1e2223] text-sm font-black hover:bg-[#d9cbb8]"
          >
            <FaUserPlus className="text-xs" />
            {t.accessAddStaff}
          </button>
        </div>

        {error && !editingUser && !adding ? (
          <p className="mx-4 sm:mx-5 mt-3 text-sm text-red-300 bg-red-400/10 border border-red-400/25 rounded-xl px-3 py-2">
            {error}
          </p>
        ) : null}

        {toast ? (
          <p className="mx-4 sm:mx-5 mt-3 text-sm text-[#CCBCA5] bg-[#CCBCA5]/10 border border-[#CCBCA5]/25 rounded-xl px-3 py-2">
            {toast}
          </p>
        ) : null}

        {usersOnTab.length === 0 ? (
          <div className="px-4 sm:px-5 py-14 text-center text-sm text-[var(--dash-text-40)]">
            {t.accessNoUsersOnPortal}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead>
                  <tr className="border-b border-[#CCBCA5]/15 text-[10px] font-black uppercase tracking-widest text-[#CCBCA5]/80">
                    <th className="px-4 sm:px-5 py-3 font-black">
                      {t.accessStaffCol}
                    </th>
                    {ACCESS_ACTIONS.map((a) => (
                      <th
                        key={a.id}
                        className="px-2 py-3 text-center font-black whitespace-nowrap"
                      >
                        {lang === "kn" ? a.labelKn : a.labelEn}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center font-black min-w-[140px]" />
                  </tr>
                </thead>
                <tbody>
                  {pageUsers.map((user) => {
                    const perms = {
                      ...emptyPerms(),
                      ...(user.modules?.[tab] || {}),
                    };
                    const knExtra = staffKannadaName(user);

                    return (
                      <tr
                        key={user.id}
                        className="border-b border-[#CCBCA5]/10 hover:bg-[var(--dash-hover)]"
                      >
                        <td className="px-4 sm:px-5 py-3.5 align-top">
                          <p className="text-sm font-black text-[var(--dash-text)]">
                            {staffDisplayName(user)}
                          </p>
                          {knExtra ? (
                            <p className="text-[11px] text-[#CCBCA5]/80 mt-0.5">
                              {knExtra}
                            </p>
                          ) : null}
                          <p className="text-[11px] text-[var(--dash-text-45)] mt-0.5">
                            {user.phone}
                          </p>
                          <p
                            className={`text-[10px] font-black mt-1 ${
                              user.totpEnabled
                                ? "text-emerald-600"
                                : "text-amber-600"
                            }`}
                          >
                            {user.totpEnabled
                              ? "Authenticator ON"
                              : lang === "kn"
                                ? "Authenticator needed"
                                : "Authenticator needed"}
                          </p>
                        </td>
                        {ACCESS_ACTIONS.map((a) => (
                          <td
                            key={a.id}
                            className="px-2 py-3.5 text-center align-middle"
                          >
                            <Checkbox
                              checked={Boolean(perms[a.id])}
                              label={lang === "kn" ? a.labelKn : a.labelEn}
                              disabled
                              onChange={() => {}}
                            />
                          </td>
                        ))}
                        <td className="px-3 py-3.5 align-middle">
                          <div className="flex flex-col items-stretch gap-1.5 min-w-[130px]">
                            <button
                              type="button"
                              onClick={() =>
                                openTotpEnroll(user, {
                                  reset: Boolean(user.totpEnabled),
                                })
                              }
                              disabled={totpBusyId === user.id}
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/40 text-emerald-700 dark:text-emerald-400 text-xs font-black hover:bg-emerald-500/10 disabled:opacity-50"
                              title={
                                user.totpEnabled
                                  ? "Reset Authenticator QR"
                                  : "Show Authenticator QR"
                              }
                            >
                              {user.totpEnabled ? (
                                <FaKey className="text-[10px]" />
                              ) : (
                                <FaQrcode className="text-[10px]" />
                              )}
                              {totpBusyId === user.id
                                ? "…"
                                : user.totpEnabled
                                  ? "Reset TOTP"
                                  : "Enroll TOTP"}
                            </button>
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => startEdit(user)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#CCBCA5]/40 text-[#CCBCA5] text-xs font-black hover:bg-[#CCBCA5]/10"
                              >
                                <FaEdit className="text-[10px]" />
                                {t.edit}
                              </button>
                              <button
                                type="button"
                                onClick={() => removeFromPortal(user)}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-300/70 hover:text-red-300 hover:bg-red-400/10"
                                title={t.accessRemoveFromPortal}
                                aria-label={t.accessRemoveFromPortal}
                              >
                                <FaTrashAlt className="text-xs" />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {usersOnTab.length > PAGE_SIZE ? (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 sm:px-5 py-3 border-t border-[#CCBCA5]/15">
                <p className="text-xs text-[var(--dash-text-50)] font-medium">
                  {lang === "kn"
                    ? `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(
                        safePage * PAGE_SIZE,
                        usersOnTab.length
                      )} / ${usersOnTab.length}`
                    : `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(
                        safePage * PAGE_SIZE,
                        usersOnTab.length
                      )} of ${usersOnTab.length}`}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#CCBCA5]/35 text-xs font-black text-[var(--dash-text)] disabled:opacity-35 hover:bg-[#CCBCA5]/12"
                  >
                    <FaChevronLeft className="text-[10px]" />
                    {lang === "kn" ? "ಹಿಂದೆ" : "Prev"}
                  </button>
                  <span className="text-xs font-bold text-[var(--dash-text-60)] tabular-nums">
                    {safePage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#CCBCA5]/35 text-xs font-black text-[var(--dash-text)] disabled:opacity-35 hover:bg-[#CCBCA5]/12"
                  >
                    {lang === "kn" ? "ಮುಂದೆ" : "Next"}
                    <FaChevronRight className="text-[10px]" />
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>

      {adding ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div
            className="absolute inset-0"
            onClick={cancelAdd}
            aria-hidden="true"
          />
          <form
            onSubmit={handleAddStaff}
            className="relative w-full max-w-lg rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-panel)] p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-[var(--dash-heading)]">
                  {t.accessAddStaff}
                </h2>
                <p className="text-xs text-[var(--dash-text-60)] mt-1">
                  {lang === "kn" ? activeModule?.labelKn : activeModule?.labelEn}{" "}
                  · {t.accessAddToPortalHint}
                </p>
              </div>
              <button
                type="button"
                onClick={cancelAdd}
                className="p-2 rounded-full hover:bg-[var(--dash-hover)] text-[var(--dash-text-60)]"
                aria-label={t.close || "Close"}
              >
                <FaTimes />
              </button>
            </div>

            {error ? (
              <p className="text-sm text-red-300 bg-red-400/10 border border-red-400/25 rounded-xl px-3 py-2">
                {error}
              </p>
            ) : null}

            <p className="text-[11px] text-[var(--dash-text-40)]">
              {t.accessNameLangHint}
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-[#CCBCA5] mb-1">
                  {t.phone}
                </label>
                <input
                  value={addForm.phone}
                  onChange={(e) =>
                    setAddForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  maxLength={10}
                  placeholder={t.phone}
                  className="w-full rounded-xl border border-[#CCBCA5]/30 bg-[var(--dash-bg)] px-3 py-2.5 text-sm text-[var(--dash-text)] outline-none focus:border-[#CCBCA5]"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-[#CCBCA5] mb-1">
                  {t.accessNameMain}
                </label>
                <input
                  value={addForm.name}
                  onChange={(e) =>
                    setAddForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder={t.accessNameMain}
                  className="w-full rounded-xl border border-[#CCBCA5]/30 bg-[var(--dash-bg)] px-3 py-2.5 text-sm text-[var(--dash-text)] outline-none focus:border-[#CCBCA5]"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-[#CCBCA5] mb-1">
                  {t.accessNameKnOptional}
                </label>
                <input
                  value={addForm.nameKn}
                  onChange={(e) =>
                    setAddForm((p) => ({ ...p, nameKn: e.target.value }))
                  }
                  placeholder={t.accessNameKnOptional}
                  className="w-full rounded-xl border border-[#CCBCA5]/30 bg-[var(--dash-bg)] px-3 py-2.5 text-sm text-[var(--dash-text)] outline-none focus:border-[#CCBCA5]"
                />
                <button
                  type="button"
                  onClick={() =>
                    setAddForm((p) => ({
                      ...p,
                      nameKn: toKannadaName(p.name),
                    }))
                  }
                  disabled={!addForm.name.trim()}
                  className="mt-2 text-[10px] font-black text-[#CCBCA5] border border-[#CCBCA5]/35 px-2.5 py-1 rounded-full hover:bg-[#CCBCA5]/10 disabled:opacity-40"
                >
                  {t.accessFillKannada}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-[var(--dash-text-45)]">
              {lang === "kn"
                ? "ಸೇರಿಸಿದ ನಂತರ View ಮಾತ್ರ ಆನ್. ಇತರ ಅನುಮತಿಗಳಿಗೆ Edit ಒತ್ತಿ."
                : "Adds with View only. Use Edit later for other permissions."}
            </p>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={cancelAdd}
                className="flex-1 py-2.5 rounded-full border border-[var(--dash-border-soft)] text-[var(--dash-text-70)] text-sm font-black hover:bg-[var(--dash-hover)]"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#CCBCA5] text-[#1e2223] text-sm font-black hover:bg-[#d9cbb8]"
              >
                <FaPlus className="text-xs" />
                {t.accessAddToPortal}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {editingUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div
            className="absolute inset-0"
            onClick={cancelEdit}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-panel)] p-5 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-[var(--dash-heading)]">
                  {t.edit} ·{" "}
                  {lang === "kn" ? activeModule?.labelKn : activeModule?.labelEn}
                </h2>
                <p className="text-xs text-[var(--dash-text-60)] mt-1">
                  {staffDisplayName(editingUser)} · {editingUser.phone}
                </p>
              </div>
              <button
                type="button"
                onClick={cancelEdit}
                className="p-2 rounded-full hover:bg-[var(--dash-hover)] text-[var(--dash-text-60)]"
                aria-label={t.close || "Close"}
              >
                <FaTimes />
              </button>
            </div>

            {error ? (
              <p className="text-sm text-red-300 bg-red-400/10 border border-red-400/25 rounded-xl px-3 py-2">
                {error}
              </p>
            ) : null}

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-[#CCBCA5] mb-1">
                  {t.phone}
                </label>
                <input
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  maxLength={10}
                  className="w-full rounded-xl border border-[#CCBCA5]/35 bg-[var(--dash-bg)] px-3 py-2.5 text-sm text-[var(--dash-text)] outline-none focus:border-[#CCBCA5]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-[#CCBCA5] mb-1">
                  {t.accessNameMain}
                </label>
                <input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, name: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[#CCBCA5]/35 bg-[var(--dash-bg)] px-3 py-2.5 text-sm text-[var(--dash-text)] outline-none focus:border-[#CCBCA5]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-[#CCBCA5] mb-1">
                  {t.accessNameKnOptional}
                </label>
                <input
                  value={editForm.nameKn}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, nameKn: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[#CCBCA5]/35 bg-[var(--dash-bg)] px-3 py-2.5 text-sm text-[var(--dash-text)] outline-none focus:border-[#CCBCA5]"
                />
                <button
                  type="button"
                  onClick={() =>
                    setEditForm((p) => ({
                      ...p,
                      nameKn: toKannadaName(p.name),
                    }))
                  }
                  disabled={!editForm.name.trim()}
                  className="mt-2 text-[10px] font-black text-[#CCBCA5] border border-[#CCBCA5]/35 px-2.5 py-1 rounded-full hover:bg-[#CCBCA5]/10 disabled:opacity-40"
                >
                  {t.accessFillKannada}
                </button>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-[#CCBCA5] mb-2">
                {lang === "kn" ? "ಅನುಮತಿಗಳು" : "Permissions"}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ACCESS_ACTIONS.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-2 rounded-xl border border-[#CCBCA5]/25 px-3 py-2.5 hover:bg-[var(--dash-hover)]"
                  >
                    <Checkbox
                      checked={Boolean(editForm.perms[a.id])}
                      label={lang === "kn" ? a.labelKn : a.labelEn}
                      onChange={() => toggleDraftPerm(a.id)}
                    />
                    <span className="text-xs font-bold text-[var(--dash-text)]">
                      {lang === "kn" ? a.labelKn : a.labelEn}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={cancelEdit}
                className="flex-1 py-2.5 rounded-full border border-[var(--dash-border-soft)] text-[var(--dash-text-70)] text-sm font-black hover:bg-[var(--dash-hover)]"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={saveEdit}
                className="flex-1 py-2.5 rounded-full bg-[#CCBCA5] text-[#1e2223] text-sm font-black hover:bg-[#d9cbb8]"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {totpModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-panel)] p-5 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-[var(--dash-heading)]">
                  {totpModal.alreadyEnrolled
                    ? lang === "kn"
                      ? "ಈಗಾಗಲೇ Authenticator ಇದೆ"
                      : "Already enrolled"
                    : "Authenticator QR"}
                </h2>
                <p className="text-xs text-[var(--dash-text-60)] mt-1">
                  {totpModal.name} · {totpModal.phone}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTotpModal(null)}
                className="p-2 rounded-full hover:bg-[var(--dash-hover)] text-[var(--dash-text-60)]"
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>
            {totpModal.alreadyEnrolled ? (
              <p className="text-sm text-[var(--dash-text-70)]">
                {(
                  t.accessTotpReuseModal ||
                  "This phone is already enrolled. Use the existing Kudligi MLA Office · staff-{phone} entry — do not add a second one."
                ).replace("{phone}", totpModal.phone || "")}
              </p>
            ) : (
              <>
                <p className="text-sm text-[var(--dash-text-70)]">
                  {totpModal.reset
                    ? t.accessTotpResetWarn ||
                      "New QR created. Staff can scan here now, or the same QR will appear on their next login until they enter a valid code."
                    : "Staff can scan here now, or the same QR appears on their login until the first successful authenticator code."}
                </p>
                {totpModal.qrDataUrl ? (
                  <div className="flex justify-center bg-white rounded-xl p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={totpModal.qrDataUrl}
                      alt="Authenticator QR code"
                      className="w-56 h-56"
                    />
                  </div>
                ) : null}
                {totpModal.secret ? (
                  <div className="rounded-xl border border-[var(--dash-border-soft)] bg-[var(--dash-bg)] px-3 py-2">
                    <p className="text-[10px] font-black uppercase tracking-wider text-[var(--dash-text-50)]">
                      Manual secret
                    </p>
                    <p className="font-mono text-xs text-[var(--dash-text)] break-all mt-1">
                      {totpModal.secret}
                    </p>
                  </div>
                ) : null}
              </>
            )}
            <button
              type="button"
              onClick={() => setTotpModal(null)}
              className="w-full py-2.5 rounded-full bg-[var(--dash-accent)] text-white text-sm font-black"
            >
              {totpModal.alreadyEnrolled
                ? lang === "kn"
                  ? "ಸರಿ"
                  : "Got it"
                : lang === "kn"
                  ? "ಮುಚ್ಚಿ — ಸಿಬ್ಬಂದಿ ಲಾಗಿನ್‌ನಲ್ಲೂ QR ನೋಡುತ್ತಾರೆ"
                  : "Close — QR also shows on staff login"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
