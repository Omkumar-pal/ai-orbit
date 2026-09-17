import { notFound } from "next/navigation";
import { companyBySlug } from "@/lib/directory";
import CompanyDetail from "@/components/companies/CompanyDetail";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const company = await companyBySlug(slug);
  if (!company) return { title: "Company Not Found | AI Orbit" };
  return {
    title: `${company.name} — AI Company Profile & Overview | AI Orbit`,
    description: company.description?.slice(0, 160) ?? `Profile, tools, models and team details for ${company.name}.`,
  };
}

export default async function Detail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const company = await companyBySlug(slug);
  if (!company) notFound();

  return (
    <CompanyDetail
      company={{
        id: company.id,
        slug: company.slug,
        name: company.name,
        logoUrl: company.logoUrl,
        description: company.description,
        website: company.website,
        country: company.country,
        city: company.city,
        foundedYear: company.foundedYear,
        type: company.type,
        sector: company.sector,
        verified: company.verified,
        featured: company.featured,
        valuation: company.valuation,
        fundingRaised: company.fundingRaised,
        latestFundingRound: company.latestFundingRound,
        employeeCount: company.employeeCount,
        linkedinUrl: company.linkedinUrl,
        twitterUrl: company.twitterUrl,
        createdAt: company.createdAt ? company.createdAt.toISOString() : null,
        toolsCount: company.toolsCount,
        aiModelsCount: company.aiModelsCount,
      }}
    />
  );
}
