import { createHash } from "node:crypto";
import sharp from "sharp";
import { createSecretClient } from "@/lib/supabase/secret";

// An error whose message is safe to show to the admin.
export class UserError extends Error {}

const MAX_INPUT_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);

export type ImageSpec = {
  bucket: "banners" | "thumbnails";
  /** Folder inside the bucket, "" for the root. */
  folder: string;
  /** File name starts with this, so old files of the same kind can be recognised. */
  namePrefix: string;
  width: number;
  height: number;
  quality: number;
  /** "cover" crops to exactly width x height. "inside" keeps the whole image, scaled down to fit. */
  fit: "cover" | "inside";
};

export const BANNER_IMAGE: ImageSpec = {
  bucket: "banners",
  folder: "",
  namePrefix: "",
  width: 1600,
  height: 800,
  quality: 80,
  fit: "cover",
};

export function thumbnailImage(gameId: string): ImageSpec {
  // The card is portrait (4:5), the home slider is wide, the game page is 16:9. So the image is not
  // cropped here: it keeps its shape and is only scaled down to 1200 px. The site crops it when showing.
  return {
    bucket: "thumbnails",
    folder: `games/${gameId}`,
    namePrefix: "manual-",
    width: 1200,
    height: 1200,
    quality: 85,
    fit: "inside",
  };
}

export function isRealFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0;
}

// Resizes (cover crop) to WebP and uploads. Returns the public URL.
export async function processAndUpload(file: File, spec: ImageSpec): Promise<string> {
  if (file.size > MAX_INPUT_BYTES) throw new UserError("The image must be smaller than 5 MB.");
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new UserError("Use a JPG, PNG, WebP, GIF or AVIF image.");
  }

  let output: Buffer;
  try {
    output = await sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 50_000_000 })
      .rotate()
      .resize(spec.width, spec.height, { fit: spec.fit, withoutEnlargement: true })
      .webp({ quality: spec.quality })
      .toBuffer();
  } catch {
    throw new UserError("That file could not be read as an image.");
  }

  const hash = createHash("sha256").update(output).digest("hex").slice(0, 12);
  const name = `${spec.namePrefix}${hash}-${spec.width}x${spec.height}.webp`;
  const path = spec.folder ? `${spec.folder}/${name}` : name;

  const storage = createSecretClient().storage.from(spec.bucket);
  const { error } = await storage.upload(path, output, {
    contentType: "image/webp",
    // The name contains a hash of the content, so a file never changes.
    cacheControl: "31536000",
    upsert: true,
  });
  if (error) {
    console.error("image upload failed:", error.message);
    throw new UserError("Could not upload the image. Try again.");
  }

  return storage.getPublicUrl(path).data.publicUrl;
}

// Best effort: deletes a file that THIS admin tool uploaded earlier. Anything else is left alone.
export async function removeUploadedImage(spec: ImageSpec, url: string | null | undefined) {
  if (!url) return;

  const marker = `/storage/v1/object/public/${spec.bucket}/`;
  const at = url.indexOf(marker);
  if (at === -1) return;

  const path = decodeURIComponent(url.slice(at + marker.length));
  const name = path.split("/").pop() ?? "";
  if (spec.namePrefix && !name.startsWith(spec.namePrefix)) return;

  const { error } = await createSecretClient().storage.from(spec.bucket).remove([path]);
  if (error) console.warn("could not remove old image:", error.message);
}
