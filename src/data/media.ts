import catalogJson from "@/data/infozub-catalog.json";

/** Local marketing media from `/public` (bundled catalog). No remote academy fetches. */
export const academyMedia = catalogJson.media;

export function testimonialPhoto(name: string): string | undefined {
  const photos = academyMedia.testimonials as Record<string, string>;
  return photos[name];
}

export function audienceImage(title: string): string | undefined {
  return academyMedia.audiences.find((item) => item.title === title)?.src;
}
