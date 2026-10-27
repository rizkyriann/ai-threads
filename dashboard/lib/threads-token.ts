import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";

function encryptionKey() {
  const configured = process.env.THREADS_TOKEN_ENCRYPTION_KEY;
  if (!configured) throw new Error("THREADS_TOKEN_ENCRYPTION_KEY is not configured.");
  const key = Buffer.from(configured, "base64");
  if (key.length !== 32)
    throw new Error("THREADS_TOKEN_ENCRYPTION_KEY must be a base64-encoded 32-byte key.");
  return key;
}

export function encryptThreadsToken(token: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    "v1",
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

export function decryptThreadsToken(value: string) {
  const [version, ivValue, tagValue, encryptedValue] = value.split(".");
  if (version !== "v1" || !ivValue || !tagValue || !encryptedValue)
    throw new Error("Stored Threads token has an invalid format.");
  const decipher = createDecipheriv(ALGORITHM, encryptionKey(), Buffer.from(ivValue, "base64url"));
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
