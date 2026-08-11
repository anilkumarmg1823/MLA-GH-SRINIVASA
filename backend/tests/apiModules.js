/**
 * API module catalog — ADD NEW MODULES HERE.
 *
 * When you add a new REST resource under /api/v1:
 * 1. Register the route in src/index.js
 * 2. Add an entry below with create / update / listPath
 * 3. `npm run test:integration` and `npm run test:flow` pick it up automatically
 *
 * Each module must support: GET list, POST create, update (PUT/PATCH),
 * DELETE soft-archive, POST :id/restore (unless archive:false).
 */
import { req } from "./helpers/http.js";

/**
 * @typedef {object} ModuleCtx
 * @property {string} token
 * @property {(path: string, opts?: object) => Promise<{res: Response, json: any}>} req
 */

/** @type {Array<{
 *   name: string,
 *   listPath: string,
 *   archive?: boolean,
 *   create: (ctx: ModuleCtx) => Promise<{ id: string, res: Response, json: any }>,
 *   update: (ctx: ModuleCtx & { id: string }) => Promise<{ res: Response, json: any }>,
 *   assertCreated?: (json: any) => void,
 *   assertUpdated?: (json: any) => void,
 * }>} */
export const CRUD_MODULES = [
  {
    name: "Developments",
    listPath: "/developments",
    archive: true,
    async create({ token }) {
      const { res, json } = await req("/developments", {
        method: "POST",
        token,
        body: {
          gramPanchayat: "Kudligi Town",
          village: "Kudligi",
          name: `IT Development ${Date.now()}`,
          description: "Integration test development",
          status: "Ongoing",
          amountSanctioned: 5000,
        },
      });
      return { res, json, id: json?.data?.id };
    },
    async update({ token, id }) {
      return req(`/developments/${id}`, {
        method: "PUT",
        token,
        body: {
          gramPanchayat: "Kudligi Town",
          village: "Kudligi",
          name: "IT Development Updated",
          status: "Completed",
        },
      });
    },
    assertCreated(json) {
      if (!json?.data?.id) throw new Error("missing development id");
    },
    assertUpdated(json) {
      if (json?.data?.status !== "Completed") {
        throw new Error("development status not updated");
      }
    },
  },
  {
    name: "DepartmentRecords",
    listPath: "/department-documents",
    archive: true,
    async create({ token }) {
      const form = new FormData();
      form.append("root", "department");
      form.append("category", "Integration Test");
      form.append("title", `IT Doc ${Date.now()}`);
      form.append(
        "file",
        new Blob(["integration-test-doc"], { type: "text/plain" }),
        "integration-test.txt"
      );
      const { res, json } = await req("/department-documents", {
        method: "POST",
        token,
        formData: form,
      });
      return { res, json, id: json?.data?.id };
    },
    async update({ token, id }) {
      return req(`/department-documents/${id}/status`, {
        method: "PATCH",
        token,
        body: { status: "In Progress" },
      });
    },
    assertCreated(json) {
      if (!json?.data?.id) throw new Error("missing document id");
    },
    assertUpdated(json) {
      if (json?.data?.status !== "In Progress") {
        throw new Error("document status not updated");
      }
    },
  },
  {
    name: "Demands",
    listPath: "/demands",
    archive: true,
    async create({ token }) {
      const { res, json } = await req("/demands", {
        method: "POST",
        token,
        body: {
          gramPanchayat: "Kudligi Town",
          village: "Kudligi",
          name: `IT Demand ${Date.now()}`,
          approach: "civil",
          subject: "Integration demand subject",
          status: "Pending",
        },
      });
      return { res, json, id: json?.data?.id };
    },
    async update({ token, id }) {
      return req(`/demands/${id}`, {
        method: "PUT",
        token,
        body: { subject: "Integration demand updated", status: "InProgress" },
      });
    },
    assertCreated(json) {
      if (json?.data?.approach !== "civil") throw new Error("approach not civil");
    },
    assertUpdated(json) {
      if (json?.data?.status !== "InProgress") {
        throw new Error("demand status not updated");
      }
    },
  },
  {
    name: "AssemblyQA",
    listPath: "/assembly-qa",
    archive: true,
    async create({ token }) {
      const { res, json } = await req("/assembly-qa", {
        method: "POST",
        token,
        body: {
          askedBy: "mla",
          askedByName: "Integration Tester",
          question: `IT question ${Date.now()}?`,
          answer: "",
          status: "pending",
        },
      });
      return { res, json, id: json?.data?.id };
    },
    async update({ token, id }) {
      return req(`/assembly-qa/${id}`, {
        method: "PUT",
        token,
        body: { answer: "Integration answer", status: "answered" },
      });
    },
    assertCreated(json) {
      if (!json?.data?.id) throw new Error("missing qa id");
    },
    assertUpdated(json) {
      if (json?.data?.status !== "answered") {
        throw new Error("qa status not updated");
      }
    },
  },
  {
    name: "Complaints",
    listPath: "/complaints",
    archive: true,
    /** Public create (no admin token required for POST) */
    async create() {
      const { res, json } = await req("/complaints", {
        method: "POST",
        body: {
          name: "IT Complaint User",
          phone: "9988776655",
          gramPanchayat: "Kudligi Town",
          village: "Kudligi",
          subject: "Integration complaint",
          message: `Integration complaint body ${Date.now()}`,
        },
      });
      return { res, json, id: json?.data?.id };
    },
    async update({ token, id }) {
      return req(`/complaints/${id}`, {
        method: "PATCH",
        token,
        body: { status: "read" },
      });
    },
    assertCreated(json) {
      if (!json?.data?.id) throw new Error("missing complaint id");
    },
    assertUpdated(json) {
      if (json?.data?.status !== "read") {
        throw new Error("complaint status not updated");
      }
    },
  },
];

/**
 * Shared archive cycle used by flow + integration.
 * @returns {Promise<void>}
 */
export async function runArchiveCycle(module, id, token) {
  const del = await req(`${module.listPath}/${id}`, {
    method: "DELETE",
    token,
  });
  if (!del.res.ok || !del.json?.data?.archived) {
    throw new Error(
      `${module.name} archive failed: ${del.res.status} ${del.json?.error?.message || ""}`
    );
  }

  const hidden = await req(module.listPath, { token });
  if (!hidden.res.ok) {
    throw new Error(`${module.name} list after archive: ${hidden.res.status}`);
  }
  if ((hidden.json?.data || []).some((r) => r.id === id)) {
    throw new Error(`${module.name}: archived row still listed`);
  }

  const restored = await req(`${module.listPath}/${id}/restore`, {
    method: "POST",
    token,
  });
  if (!restored.res.ok) {
    throw new Error(
      `${module.name} restore failed: ${restored.res.status} ${restored.json?.error?.message || ""}`
    );
  }

  const shown = await req(module.listPath, { token });
  if (!shown.res.ok) {
    throw new Error(`${module.name} list after restore: ${shown.res.status}`);
  }
  if (!(shown.json?.data || []).some((r) => r.id === id)) {
    throw new Error(`${module.name}: restored row missing from list`);
  }
}

/**
 * Full CRUD for one catalog module (list → create → update → archive → restore).
 */
export async function runModuleCrud(module, token) {
  const list = await req(module.listPath, { token });
  if (!list.res.ok || !Array.isArray(list.json?.data)) {
    throw new Error(`${module.name} GET list failed: ${list.res.status}`);
  }

  const created = await module.create({ token, req });
  if (created.res.status !== 201 && !(created.res.ok && created.id)) {
    throw new Error(
      `${module.name} POST failed: ${created.res.status} ${created.json?.error?.message || ""}`
    );
  }
  if (!created.id) throw new Error(`${module.name}: missing id after create`);
  module.assertCreated?.(created.json);

  const updated = await module.update({ token, id: created.id, req });
  if (!updated.res.ok) {
    throw new Error(
      `${module.name} update failed: ${updated.res.status} ${updated.json?.error?.message || ""}`
    );
  }
  module.assertUpdated?.(updated.json);

  if (module.archive !== false) {
    await runArchiveCycle(module, created.id, token);
  }

  return created.id;
}
