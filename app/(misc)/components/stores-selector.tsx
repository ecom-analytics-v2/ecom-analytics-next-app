"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Store } from "@/types/store";

interface StoresSelectorProps {
  stores: Store[];
  onSelect: (store: Store) => void;
}

export function StoresSelector({ stores, onSelect }: StoresSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedStore ? (
            <div className="flex items-center">
              <Image
                src={selectedStore.icon || "/placeholder.svg"}
                alt={selectedStore.name}
                width={20}
                height={20}
                className="mr-2 rounded-sm"
              />
              {selectedStore.name}
            </div>
          ) : (
            "Select store..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search store..." />
          <CommandEmpty>No store found.</CommandEmpty>
          <CommandGroup>
            {stores.map((store) => (
              <CommandItem
                key={store.id}
                onSelect={() => {
                  setSelectedStore(store);
                  setOpen(false);
                  onSelect(store);
                }}
              >
                <div className="flex items-center">
                  <Image
                    src={store.icon || "/placeholder.svg"}
                    alt={store.name}
                    width={20}
                    height={20}
                    className="mr-2 rounded-sm"
                  />
                  <span>{store.name}</span>
                </div>
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    selectedStore?.id === store.id ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
