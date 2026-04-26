import { Metadata } from "next";
import GroceryClient from "./GroceryClient";

// Next.js dynamic metadata for SEO
export const metadata: Metadata = {
    title: "Grocery List - Budget Buddy",
    description: "Browse products and track your shopping budget in real-time.",
};

export default async function Page({ params }: { params: Promise<{ location: string }> }) {
    const { location } = await params;
    return <GroceryClient locationId={location} />;
}
