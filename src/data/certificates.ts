/** Local sample certificates shown on course detail pages. */

const certificateBySlug: Record<string, string> = {
  "ai-website-builder-mastery": "/certificates/ai-website-builder-mastery.webp",
  "adobe-premiere-pro": "/certificates/adobe-premiere-pro.webp",
  "business-success-formula": "/certificates/business-success-formula.jpg",
  "canva-master-course": "/certificates/canva-master-course.webp",
  "adobe-photoshop": "/certificates/adobe-photoshop.webp",
  "google-ads": "/certificates/google-ads.jpg",
  "interview-success-formula": "/certificates/interview-success-formula.jpg",
  "mobile-app-video-editing": "/certificates/mobile-app-video-editing.webp",
  "social-media-marketing": "/certificates/social-media-marketing.webp",
  "web-design": "/certificates/web-design.jpg",
};

export function getCourseCertificate(slug: string): string | null {
  return certificateBySlug[slug] ?? null;
}

export function listCourseCertificates(): Array<{ slug: string; src: string }> {
  return Object.entries(certificateBySlug).map(([slug, src]) => ({ slug, src }));
}
