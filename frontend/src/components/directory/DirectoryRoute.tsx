import DirectoryExperience from "@/components/directory/DirectoryExperience";
import { itemsFor } from "@/lib/directory"; // for companies: raw Company → mapped DirectoryItem live from DB
import { itemsFor as mockItemsFor, type DirectoryItem } from "@/lib/mock-data";

export default async function DirectoryRoute({ resource, title, intro, searchParams }: { resource: string; title: string; intro: string; searchParams?: { q?: string; category?: string } }) {
  let items: DirectoryItem[];
  try {
    const dbItems = await itemsFor(resource); // companies = Company table verbatim → mapped
    if (dbItems.length) {
      items = dbItems as unknown as DirectoryItem[];
    } else {
      items = mockItemsFor(resource);
    }
  } catch {
    items = mockItemsFor(resource);
  }
  return <DirectoryExperience resource={resource} title={title} intro={intro} items={items} initialQuery={searchParams?.q ?? ""} initialCategory={searchParams?.category ?? "All"} />;
}
