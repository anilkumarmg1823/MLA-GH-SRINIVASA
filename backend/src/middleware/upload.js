import multer from "multer";
import { AppError } from "./error.js";

const memory = multer.memoryStorage();

function mimeAllowed(mimetype, mimePrefix) {
  if (!mimePrefix || mimePrefix === "*") return true;
  if (Array.isArray(mimePrefix)) {
    return mimePrefix.some(
      (p) => mimetype === p || mimetype.startsWith(p)
    );
  }
  return mimetype === mimePrefix || mimetype.startsWith(mimePrefix);
}

function makeUploader(maxBytes, mimePrefix) {
  return multer({
    storage: memory,
    limits: { fileSize: maxBytes },
    fileFilter(_req, file, cb) {
      if (!mimeAllowed(file.mimetype, mimePrefix)) {
        return cb(
          new AppError(400, "INVALID_FILE_TYPE", "File type not allowed")
        );
      }
      cb(null, true);
    },
  });
}

export const uploadDoc = makeUploader(2.5 * 1024 * 1024, [
  "application/pdf",
  "image/",
  "application/msword",
  "application/vnd.",
  "text/",
]);
export const uploadLanding = makeUploader(4 * 1024 * 1024, ["image/", "video/"]);
export const uploadDevMedia = makeUploader(50 * 1024 * 1024, ["image/", "video/"]);
export const uploadGeneral = makeUploader(5 * 1024 * 1024, "*");

export function handleMulterError(err, _req, _res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(
        new AppError(
          400,
          "FILE_TOO_LARGE",
          "File too large. Maximum allowed size is 50 MB for development media."
        )
      );
    }
    return next(new AppError(400, "UPLOAD_ERROR", err.message));
  }
  if (err instanceof AppError) {
    return next(err);
  }
  next(err);
}
