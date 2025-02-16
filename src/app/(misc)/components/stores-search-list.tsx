"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { Store } from "@//types/store";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface StoresSearchListProps {
  stores: Store[];
  onSelect: (store: Store) => void;
}

export function StoresSearchList({ stores, onSelect }: StoresSearchListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStores, setFilteredStores] = useState<Store[]>(stores);

  const filterStores = useCallback(() => {
    const filtered = stores.filter(
      (store) =>
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStores(filtered);
  }, [stores, searchTerm]);

  useEffect(() => {
    filterStores();
  }, [filterStores, searchTerm]);

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search stores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
      <ScrollArea className="h-[400px] w-full rounded-xl border">
        <div className="p-4">
          {filteredStores.map((store) => (
            <button
              key={store.id}
              className={cn(
                "flex w-full flex-col rounded-xl p-2 hover:bg-accent",
                "transition-colors duration-150 ease-in-out"
              )}
              onClick={() => onSelect(store)}
            >
              <div className="flex w-full items-start space-x-2">
                <Image
                  src={store.icon || "/placeholder.svg"}
                  alt={store.name}
                  width={24}
                  height={24}
                  className="rounded-sm"
                />
                <span className="flex-grow text-left font-medium">{store.name}</span>
              </div>
              <p className="w-full text-sm text-muted-foreground">{store.description}</p>
              <p className="w-full text-xs text-blue-500 hover:underline">{store.url}</p>
            </button>
          ))}
          {filteredStores.length === 0 && (
            <p className="text-center text-muted-foreground">No stores found.</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
