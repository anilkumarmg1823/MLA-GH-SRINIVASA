export class AppError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function ok(res, data, meta, status = 200) {
  const body = { data };
  if (meta) body.meta = meta;
  return res.status(status).json(body);
}

export function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: { code: err.code, message: err.message },
    });
  }
  if (err?.name === "ZodError") {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: err.errors?.[0]?.message || "Invalid input",
        details: err.errors,
      },
    });
  }
  if (err?.code === "P2002") {
    return res.status(409).json({
      error: { code: "CONFLICT", message: "Duplicate record" },
    });
  }
  console.error(err);
  return res.status(500).json({
    error: { code: "INTERNAL", message: "Internal server error" },
  });
}

export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
