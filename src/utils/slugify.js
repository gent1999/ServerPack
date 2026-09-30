export function slugify(title) {
  return title
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function generateUniqueSlug(prisma, title, excludeId = null) {
  const base = slugify(title) || 'article';
  let slug = base;
  let suffix = 2;

  while (true) {
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) {
      return slug;
    }
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
}
