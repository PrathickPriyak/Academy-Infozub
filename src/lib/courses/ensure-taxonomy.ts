import catalog from "@/data/infozub-catalog.json";
import { db, hasDatabaseUrl } from "@/lib/db";

/**
 * When Neon is empty, upsert catalog categories + instructor so the create form
 * posts real foreign keys instead of `catalog-*` placeholder ids.
 */
export async function ensureAdminTaxonomy(): Promise<void> {
  if (!hasDatabaseUrl()) {
    return;
  }

  try {
    const [categoryCount, instructorCount] = await Promise.all([
      db.category.count(),
      db.instructor.count(),
    ]);

    if (categoryCount === 0) {
      for (const category of catalog.categories) {
        await db.category.upsert({
          where: { slug: category.slug },
          create: {
            name: category.name,
            slug: category.slug,
            description: category.description,
          },
          update: {
            name: category.name,
            description: category.description,
          },
        });
      }
    }

    if (instructorCount === 0) {
      const existing = await db.instructor.findFirst({
        where: { name: catalog.instructor.name },
      });
      if (!existing) {
        await db.instructor.create({
          data: {
            name: catalog.instructor.name,
            title: catalog.instructor.title,
            bio: catalog.instructor.bio,
          },
        });
      }
    }
  } catch (error) {
    console.error("ensureAdminTaxonomy failed.", error);
  }
}
