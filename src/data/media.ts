import catalogJson from "@/data/infozub-catalog.json";
import { isLocalImageSrc, localImageSrc } from "@/data/course-thumbnails";

const media = catalogJson.media;

/** Local marketing media from `/public` (bundled catalog). No remote academy fetches. */
export const academyMedia = {
  ...media,
  logoBlack: localImageSrc(media.logoBlack),
  brandMark: localImageSrc(media.brandMark),
  instructorPortrait: localImageSrc(media.instructorPortrait),
  team: isLocalImageSrc(media.team) ? media.team.trim() : "",
  hero: localImageSrc(media.hero),
  press: media.press.filter(isLocalImageSrc),
  highlights: media.highlights.filter(isLocalImageSrc),
  audiences: media.audiences
    .filter((item) => isLocalImageSrc(item.src))
    .map((item) => ({ ...item, src: localImageSrc(item.src) })),
  testimonials: Object.fromEntries(
    Object.entries(media.testimonials as Record<string, string>).filter(([, src]) => isLocalImageSrc(src)),
  ),
};

export function testimonialPhoto(name: string): string | undefined {
  return academyMedia.testimonials[name];
}

export function audienceImage(title: string): string | undefined {
  return academyMedia.audiences.find((item) => item.title === title)?.src;
}
