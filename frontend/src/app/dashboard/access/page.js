"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FaPlus, FaTrashAlt, FaTimes, FaUserPlus, FaEdit } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import { getSession } from "@/lib/auth";
import { toKannadaName } from "@/lib/transliterateName";
import {
  ACCESS_ACTIONS,
  MANAGEABLE_MODULES,
  getAllStaffAccess,
  upsertStaffAccess,
  deleteStaffAccess,
} from "@/lib/permissionsStore";

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
            className="w-3 h-3 text-[#1e2223]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
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
  const [allowed, setAllowed] = useState(false);
  const [staff, setStaff] = useState([]);
  const [tab, setTab] = useState(MANAGEABLE_MODULES[0]?.id || "development");
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState({ phone: "", name: "", nameKn: "" });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    phone: "",
    name: "",
    nameKn: "",
    perms: emptyPerms(),
  });
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

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
    refresh();
  }, [router, refresh]);

  const activeModule = MANAGEABLE_MODULES.find((m) => m.id === tab);

  const usersOnTab = useMemo(
    () =>
      staff
        .filter((s) => hasAnyAccess(s.modules?.[tab]))
        .sort((a, b) => (a.name || "").localeCompare(b.name || "")),
    [staff, tab]
  );

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

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ phone: "", name: "", nameKn: "", perms: emptyPerms() });
    setError("");
  };

  const startEdit = (user) => {
    setAdding(false);
    setError("");
    setEditingId(user.id);
    setEditForm({
      phone: user.phone || "",
      name: user.name || "",
      nameKn: staffKannadaName(user),
      perms: { ...emptyPerms(), ...(user.modules?.[tab] || {}) },
    });
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

  const saveEdit = async (user) => {
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

    if (!hasAnyAccess(editForm.perms)) {
      setError(t.accessNeedOnePerm);
      return;
    }

    const modules = { ...blankModules(), ...(user.modules || {}) };
    modules[tab] = { ...emptyPerms(), ...editForm.perms };

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
  };

  const removeFromPortal = async (user) => {
    if (!window.confirm(t.accessRemoveFromPortal)) return;
    const modules = { ...blankModules(), ...(user.modules || {}) };
    modules[tab] = emptyPerms();

    const stillHasOther = MANAGEABLE_MODULES.some(
      (m) => m.id !== tab && hasAnyAccess(modules[m.id])
    );

    if (!stillHasOther) {
      await deleteStaffAccess(user.id);
      await refresh();
    } else {
      await persist({ ...user, modules });
    }
    if (editingId === user.id) cancelEdit();
    setToast(t.accessRemovedFromPortal);
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

    const existing = staff.find((s) => s.phone === digits);
    const modules = existing
      ? { ...blankModules(), ...existing.modules }
      : blankModules();

    modules[tab] = {
      ...emptyPerms(),
      ...(modules[tab] || {}),
      view: true,
    };

    const result = await persist({
      id: existing?.id,
      phone: digits,
      name,
      nameKn: (addForm.nameKn || "").trim(),
      modules,
    });

    if (!result) return;
    setAddForm({ phone: "", name: "", nameKn: "" });
    setAdding(false);
    setToast(t.accessStaffAdded);
  };

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  if (!allowed) {
    return (
      <div className="text-[var(--dash-text-50)] text-sm py-8 text-center">Loading…</div>
    );
  }

  return (
    <div className="max-w-5xl">
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
                setAdding(false);
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

      <div className="rounded-2xl border border-[#CCBCA5]/25 bg-[var(--dash-panel)] overflow-hidden">
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
            onClick={() => {
              cancelEdit();
              setAdding((v) => !v);
              setError("");
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#CCBCA5] text-[#1e2223] text-sm font-black hover:bg-[#d9cbb8]"
          >
            {adding ? (
              <FaTimes className="text-xs" />
            ) : (
              <FaUserPlus className="text-xs" />
            )}
            {adding ? t.cancel : t.accessAddStaff}
          </button>
        </div>

        {adding ? (
          <form
            onSubmit={handleAddStaff}
            className="px-4 sm:px-5 py-4 border-b border-[#CCBCA5]/15 bg-[var(--dash-bg)]/40 space-y-3"
          >
            <p className="text-xs text-[#CCBCA5] font-bold">
              {t.accessAddToPortalHint}
            </p>
            <p className="text-[11px] text-[var(--dash-text-40)]">{t.accessNameLangHint}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                value={addForm.phone}
                onChange={(e) =>
                  setAddForm((p) => ({ ...p, phone: e.target.value }))
                }
                maxLength={10}
                placeholder={t.phone}
                className="rounded-xl border border-[#CCBCA5]/30 bg-[var(--dash-bg)] px-3 py-2.5 text-sm text-[var(--dash-text)] outline-none focus:border-[#CCBCA5]"
                required
              />
              <input
                value={addForm.name}
                onChange={(e) =>
                  setAddForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder={t.accessNameMain}
                className="rounded-xl border border-[#CCBCA5]/30 bg-[var(--dash-bg)] px-3 py-2.5 text-sm text-[var(--dash-text)] outline-none focus:border-[#CCBCA5]"
                required
              />
              <input
                value={addForm.nameKn}
                onChange={(e) =>
                  setAddForm((p) => ({ ...p, nameKn: e.target.value }))
                }
                placeholder={t.accessNameKnOptional}
                className="rounded-xl border border-[#CCBCA5]/30 bg-[var(--dash-bg)] px-3 py-2.5 text-sm text-[var(--dash-text)] outline-none focus:border-[#CCBCA5]"
              />
            </div>
            <div className="flex flex-wrap justify-between gap-2">
              <button
                type="button"
                onClick={() =>
                  setAddForm((p) => ({
                    ...p,
                    nameKn: toKannadaName(p.name),
                  }))
                }
                disabled={!addForm.name.trim()}
                className="text-xs font-black text-[#CCBCA5] border border-[#CCBCA5]/35 px-3 py-2 rounded-full hover:bg-[#CCBCA5]/10 disabled:opacity-40"
              >
                {t.accessFillKannada}
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#CCBCA5] text-[#1e2223] text-sm font-black hover:bg-[#d9cbb8]"
              >
                <FaPlus className="text-xs" />
                {t.accessAddToPortal}
              </button>
            </div>
          </form>
        ) : null}

        {error ? (
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
                {usersOnTab.map((user) => {
                  const isEditing = editingId === user.id;
                  const perms = isEditing
                    ? editForm.perms
                    : { ...emptyPerms(), ...(user.modules?.[tab] || {}) };
                  const knExtra = staffKannadaName(user);

                  return (
                    <tr
                      key={user.id}
                      className={`border-b border-[#CCBCA5]/10 ${
                        isEditing ? "bg-[#CCBCA5]/08" : "hover:bg-[var(--dash-hover)]"
                      }`}
                    >
                      <td className="px-4 sm:px-5 py-3.5 align-top">
                        {isEditing ? (
                          <div className="space-y-2 min-w-[230px]">
                            <input
                              value={editForm.phone}
                              onChange={(e) =>
                                setEditForm((p) => ({
                                  ...p,
                                  phone: e.target.value,
                                }))
                              }
                              maxLength={10}
                              placeholder={t.phone}
                              className="w-full rounded-lg border border-[#CCBCA5]/35 bg-[var(--dash-bg)] px-2.5 py-1.5 text-sm text-[var(--dash-text)] outline-none focus:border-[#CCBCA5]"
                            />
                            <input
                              value={editForm.name}
                              onChange={(e) =>
                                setEditForm((p) => ({
                                  ...p,
                                  name: e.target.value,
                                }))
                              }
                              placeholder={t.accessNameMain}
                              className="w-full rounded-lg border border-[#CCBCA5]/35 bg-[var(--dash-bg)] px-2.5 py-1.5 text-sm text-[var(--dash-text)] outline-none focus:border-[#CCBCA5]"
                            />
                            <input
                              value={editForm.nameKn}
                              onChange={(e) =>
                                setEditForm((p) => ({
                                  ...p,
                                  nameKn: e.target.value,
                                }))
                              }
                              placeholder={t.accessNameKnOptional}
                              className="w-full rounded-lg border border-[#CCBCA5]/35 bg-[var(--dash-bg)] px-2.5 py-1.5 text-sm text-[var(--dash-text)] outline-none focus:border-[#CCBCA5]"
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
                              className="text-[10px] font-black text-[#CCBCA5] border border-[#CCBCA5]/35 px-2.5 py-1 rounded-full hover:bg-[#CCBCA5]/10 disabled:opacity-40"
                            >
                              {t.accessFillKannada}
                            </button>
                            <p className="text-[10px] text-[var(--dash-text-30)] leading-snug">
                              {t.accessNameLangHint}
                            </p>
                          </div>
                        ) : (
                          <>
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
                          </>
                        )}
                      </td>
                      {ACCESS_ACTIONS.map((a) => (
                        <td key={a.id} className="px-2 py-3.5 text-center align-middle">
                          <Checkbox
                            checked={Boolean(perms[a.id])}
                            label={lang === "kn" ? a.labelKn : a.labelEn}
                            disabled={!isEditing}
                            onChange={() => {
                              if (isEditing) toggleDraftPerm(a.id);
                            }}
                          />
                        </td>
                      ))}
                      <td className="px-3 py-3.5 align-middle">
                        {isEditing ? (
                          <div className="flex flex-col items-stretch gap-1.5 min-w-[120px]">
                            <button
                              type="button"
                              onClick={() => saveEdit(user)}
                              className="px-3 py-1.5 rounded-full bg-[#CCBCA5] text-[#1e2223] text-xs font-black hover:bg-[#d9cbb8]"
                            >
                              {t.save}
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="px-3 py-1.5 rounded-full border border-[var(--dash-border-soft)] text-[var(--dash-text-70)] text-xs font-black hover:bg-[var(--dash-hover)]"
                            >
                              {t.cancel}
                            </button>
                          </div>
                        ) : (
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
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
