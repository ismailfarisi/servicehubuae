/** Lower-case, hyphen-separated, [a-z0-9-] only. "Al Ain (Abu Dhabi)" -> "al-ain-abu-dhabi". */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
