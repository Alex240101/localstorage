import type { Metadata } from "next"
import { BusinessDetails } from "@/components/business-details"

interface PageProps {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const businessName = (searchParams.name as string) || "Negocio Local"
  const businessDescription =
    (searchParams.description as string) || "Descubre este increíble negocio local en Lima, Perú"
  const businessImage = (searchParams.image as string) || "/apple-touch-icon-180x180.png"
  const businessRating = (searchParams.rating as string) || "4.0"
  const businessAddress = (searchParams.address as string) || "Lima, Perú"

  return {
    title: `${businessName} - BuscaLocal`,
    description: businessDescription,
    openGraph: {
      title: `${businessName} - BuscaLocal`,
      description: businessDescription,
      images: [
        {
          url: businessImage,
          width: 512,
          height: 512,
          alt: businessName,
        },
      ],
      type: "website",
      siteName: "BuscaLocal",
      locale: "es_PE",
    },
    twitter: {
      card: "summary_large_image",
      title: `${businessName} - BuscaLocal`,
      description: businessDescription,
      images: [businessImage],
    },
    other: {
      "business:contact_data:street_address": businessAddress,
      "business:contact_data:locality": "Lima",
      "business:contact_data:region": "Lima",
      "business:contact_data:country_name": "Perú",
      "place:rating:value": businessRating,
      "place:rating:scale": "5",
    },
  }
}

export default function BusinessPage({ params, searchParams }: PageProps) {
  // Convert searchParams to business object
  const business = {
    id: params.id,
    name: (searchParams.name as string) || "Negocio Local",
    category: (searchParams.category as string) || "Restaurante",
    rating: Number.parseFloat((searchParams.rating as string) || "4.0"),
    reviewCount: Number.parseInt((searchParams.reviewCount as string) || "0"),
    distance: (searchParams.distance as string) || "0km",
    address: (searchParams.address as string) || "Lima, Perú",
    phone: (searchParams.phone as string) || "",
    hours: (searchParams.hours as string) || "Abierto ahora",
    description: (searchParams.description as string) || "Descubre este increíble negocio local",
    image: (searchParams.image as string) || "/cozy-italian-restaurant.png",
    priceRange: (searchParams.priceRange as string) || "S/",
    isOpen: searchParams.isOpen === "true",
    coordinates: searchParams.coordinates ? JSON.parse(searchParams.coordinates as string) : null,
  }

  return (
    <div className="min-h-screen bg-background">
      <BusinessDetails business={business} onBack={() => window.history.back()} isStandalone={true} />
    </div>
  )
}
