import { notFound } from "next/navigation";
import { deviceBySlug, relatedDevices } from "@/lib/directory";
import DeviceDetail from "@/components/devices/DeviceDetail";

const strArr = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d: any = await deviceBySlug(slug);
  if (!d) return { title: "Device Not Found | AI Orbit" };
  return { title: `${d.name} — AI Device | AI Orbit`, description: d.description?.slice(0, 160) };
}

export default async function Detail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d: any = await deviceBySlug(slug);
  if (!d) notFound();
  const related: any[] = await relatedDevices(d.slug, d.manufacturer, d.category);
  return (
    <DeviceDetail
      device={{
        slug: d.slug,
        name: d.name,
        description: d.description ?? null,
        imageUrl: d.imageUrl ?? null,
        images: strArr(d.images),
        manufacturer: d.manufacturer ?? null,
        manufacturerSlug: d.manufacturerSlug ?? null,
        manufacturerLogo: d.manufacturerLogo ?? null,
        category: d.category ?? null,
        availability: d.availability ?? null,
        price: d.price ?? null,
        year: d.year ?? null,
        month: d.month ?? null,
        mainTask: d.mainTask ?? null,
        formFactor: d.formFactor ?? null,
        country: d.country ?? null,
        aiFeatures: strArr(d.aiFeatures),
        primaryUseCases: strArr(d.primaryUseCases),
        buyUrl: d.buyUrl ?? null,
        related: related.map((r: any) => ({
          slug: r.slug,
          name: r.name,
          imageUrl: r.imageUrl ?? null,
          manufacturer: r.manufacturer ?? null,
        })),
      }}
    />
  );
}
