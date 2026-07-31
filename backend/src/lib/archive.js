/** Soft-archive helpers — never hard-delete module records */

export function activeWhere(extra = {}) {
  return { archivedAt: null, ...extra };
}

export async function archiveById(model, id) {
  return model.update({
    where: { id },
    data: { archivedAt: new Date() },
  });
}

export async function restoreById(model, id) {
  return model.update({
    where: { id },
    data: { archivedAt: null },
  });
}
