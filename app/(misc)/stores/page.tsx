"use client";

import { useState } from "react";
import { StoresSearchList } from "@/components/stores-search-list";
import { Store } from "@/types/store";

const stores: Store[] = [
  {
    id: "1",
    name: "Amazon",
    icon: "/placeholder.svg?height=24&width=24",
    url: "https://www.amazon.com",
    description: "Online retail giant offering a wide variety of products.",
  },
  {
    id: "2",
    name: "eBay",
    icon: "/placeholder.svg?height=24&width=24",
    url: "https://www.ebay.com",
    description: "E-commerce platform for buying and selling various items.",
  },
  {
    id: "3",
    name: "Etsy",
    icon: "/placeholder.svg?height=24&width=24",
    url: "https://www.etsy.com",
    description: "Global marketplace for unique and creative goods.",
  },
  {
    id: "4",
    name: "Walmart",
    icon: "/placeholder.svg?height=24&width=24",
    url: "https://www.walmart.com",
    description: "Multinational retail corporation with a wide range of products.",
  },
  {
    id: "5",
    name: "Target",
    icon: "/placeholder.svg?height=24&width=24",
    url: "https://www.target.com",
    description: "General merchandise retailer offering a variety of products.",
  },
  {
    id: "6",
    name: "Best Buy",
    icon: "/placeholder.svg?height=24&width=24",
    url: "https://www.bestbuy.com",
    description: "Consumer electronics retailer offering a wide range of tech products.",
  },
  {
    id: "7",
    name: "Newegg",
    icon: "/placeholder.svg?height=24&width=24",
    url: "https://www.newegg.com",
    description: "Online retailer specializing in computer hardware and consumer electronics.",
  },
  {
    id: "8",
    name: "Wayfair",
    icon: "/placeholder.svg?height=24&width=24",
    url: "https://www.wayfair.com",
    description: "E-commerce company specializing in home goods and furniture.",
  },
  {
    id: "9",
    name: "Home Depot",
    icon: "/placeholder.svg?height=24&width=24",
    url: "https://www.homedepot.com",
    description: "Home improvement retailer offering tools, construction products, and services.",
  },
  {
    id: "10",
    name: "Lowe's",
    icon: "/placeholder.svg?height=24&width=24",
    url: "https://www.lowes.com",
    description: "Home improvement and appliance store offering a variety of products.",
  },
];

export default function Home() {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">Store Search</h1>
        <StoresSearchList stores={stores} onSelect={(store) => setSelectedStore(store)} />
        {selectedStore && (
          <div className="mt-4 p-4 border rounded-md">
            <h2 className="text-lg font-semibold">Selected Store:</h2>
            <p>Name: {selectedStore.name}</p>
            <p>Description: {selectedStore.description}</p>
            <p>
              URL:{" "}
              <a
                href={selectedStore.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {selectedStore.url}
              </a>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
