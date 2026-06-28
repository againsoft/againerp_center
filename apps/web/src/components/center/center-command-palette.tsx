"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search } from "lucide-react";
import {
  buildCenterCommandItems,
  CENTER_COMMAND_PALETTE_OPEN_EVENT,
} from "@/lib/navigation/center-command-palette";

const commandItems = buildCenterCommandItems();

const groupOrder = ["Quick actions", "Overview", "Fleet", "Commercial", "Technical", "Platform", "Clients"];

export function CenterCommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const grouped = useMemo(() => {
    const map = new Map<string, typeof commandItems>();
    for (const item of commandItems) {
      const list = map.get(item.group) ?? [];
      list.push(item);
      map.set(item.group, list);
    }
    return groupOrder
      .filter((group) => map.has(group))
      .map((group) => ({ group, items: map.get(group)! }));
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    const onOpen = () => setOpen(true);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener(CENTER_COMMAND_PALETTE_OPEN_EVENT, onOpen);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener(CENTER_COMMAND_PALETTE_OPEN_EVENT, onOpen);
    };
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50" onClick={() => setOpen(false)}>
      <div
        className="mx-auto mt-[12vh] w-full max-w-lg overflow-hidden rounded-lg border border-violet-200 bg-background text-sm shadow-2xl dark:border-violet-900"
        onClick={(event) => event.stopPropagation()}
      >
        <Command
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-violet-700 dark:[&_[cmdk-group-heading]]:text-violet-300"
          filter={(value, search) => {
            if (!search.trim()) return 1;
            const haystack = value.toLowerCase();
            const needle = search.toLowerCase();
            return haystack.includes(needle) ? 1 : 0;
          }}
        >
          <div className="flex items-center border-b border-violet-100 px-3 dark:border-violet-900/60">
            <Search className="mr-2 h-4 w-4 shrink-0 text-violet-600" aria-hidden />
            <Command.Input
              placeholder="Search pages, clients, actions…"
              className="flex h-10 w-full bg-transparent py-2 text-xs outline-none"
            />
            <kbd className="hidden rounded border border-input bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline">
              ⌘K
            </kbd>
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No matching commands.
            </Command.Empty>
            {grouped.map(({ group, items }) => (
              <Command.Group key={group} heading={group}>
                {items.map((item) => (
                  <Command.Item
                    key={item.id}
                    value={`${item.label} ${item.hint ?? ""} ${item.keywords ?? ""}`}
                    onSelect={() => {
                      router.push(item.href);
                      setOpen(false);
                    }}
                    className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-violet-100 dark:aria-selected:bg-violet-950/50"
                  >
                    <span>{item.label}</span>
                    {item.hint ? (
                      <span className="truncate text-[10px] text-muted-foreground">{item.hint}</span>
                    ) : null}
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
