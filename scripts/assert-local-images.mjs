#!/usr/bin/env node
/**
 * Production guard: fail if course/marketing image fields still point at remote hosts.
 * Bundled `/public` assets must ship with the deploy — never fetch academy WordPress media.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const catalogPath = join(root, "src/data/infozub-catalog.json");
const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));

const remoteImagePattern = /https?:\/\/|wp-content|academy\.infozub\.com\/wp-content/i;
const failures = [];

function checkSrc(label, src) {
  if (!src) return;
  if (remoteImagePattern.test(src) || (typeof src === "string" && !src.startsWith("/"))) {
    failures.push(`${label}: ${src}`);
  }
}

for (const course of catalog.courses ?? []) {
  checkSrc(`course:${course.slug}.thumbnail`, course.thumbnail);
  for (const [index, src] of (course.gallery ?? []).entries()) {
    checkSrc(`course:${course.slug}.gallery[${index}]`, src);
  }
}

const media = catalog.media ?? {};
for (const key of ["logoBlack", "brandMark", "instructorPortrait", "team", "hero"]) {
  if (media[key]) checkSrc(`media.${key}`, media[key]);
}
for (const [index, src] of (media.press ?? []).entries()) {
  checkSrc(`media.press[${index}]`, src);
}
for (const [index, src] of (media.highlights ?? []).entries()) {
  checkSrc(`media.highlights[${index}]`, src);
}
for (const item of media.audiences ?? []) {
  checkSrc(`media.audiences:${item.title}`, item.src);
}
for (const [name, src] of Object.entries(media.testimonials ?? {})) {
  checkSrc(`media.testimonials:${name}`, src);
}

const requiredDirs = ["public/course-thumbnails", "public/certificates"];
for (const dir of requiredDirs) {
  const abs = join(root, dir);
  if (!existsSync(abs)) {
    failures.push(`missing directory ${dir}`);
    continue;
  }
  const files = readdirSync(abs);
  if (files.length === 0) {
    failures.push(`${dir} is empty`);
  }
}

for (const course of catalog.courses ?? []) {
  const thumb = course.thumbnail;
  if (typeof thumb === "string" && thumb.startsWith("/") && !existsSync(join(root, "public", thumb.slice(1)))) {
    failures.push(`missing public file for ${course.slug}: ${thumb}`);
  }
}

if (failures.length) {
  console.error("Local image production check failed:\n" + failures.map((item) => ` - ${item}`).join("\n"));
  process.exit(1);
}

console.log(
  `Local image production check passed (${catalog.courses.length} courses, public thumbnails + certificates present).`,
);
