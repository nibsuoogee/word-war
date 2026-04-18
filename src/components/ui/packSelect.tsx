import { Check, ChevronDown } from "lucide-react";
import { Checkbox, Popover } from "radix-ui";
import { cn } from "@/lib/utils";
import { categoryPacks } from "@/data/packs";

const ALL_KEYS = Object.keys(categoryPacks);

export function PackSelect({
  selectedKeys,
  onChange,
}: {
  selectedKeys: string[];
  onChange: (keys: string[]) => void;
}) {
  const allSelected = selectedKeys.length === ALL_KEYS.length;

  function toggle(key: string) {
    if (selectedKeys.includes(key)) {
      if (selectedKeys.length === 1) return; // keep at least one selected
      onChange(selectedKeys.filter((k) => k !== key));
    } else {
      onChange([...selectedKeys, key]);
    }
  }

  function toggleAll() {
    onChange(allSelected ? [ALL_KEYS[0]] : ALL_KEYS);
  }

  const label =
    selectedKeys.length === 1
      ? categoryPacks[selectedKeys[0]].name
      : allSelected
        ? "All packs"
        : `${selectedKeys.length} packs`;

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="inline-flex items-center justify-between gap-2 rounded-md border bg-background px-3 py-2 text-sm shadow-xs hover:bg-accent hover:text-accent-foreground min-w-40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
          {label}
          <ChevronDown className="size-4 opacity-50" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          className="z-50 min-w-40 rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
        >
          <Checkbox.Root
            checked={allSelected}
            onCheckedChange={toggleAll}
            className={cn(
              "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 border-b border-border mb-1 pb-2",
              allSelected && "font-medium",
            )}
          >
            <div className="size-4 shrink-0 rounded border border-input flex items-center justify-center">
              <Checkbox.Indicator>
                <Check className="size-3" />
              </Checkbox.Indicator>
            </div>
            All packs
          </Checkbox.Root>
          {Object.entries(categoryPacks).map(([key, pack]) => {
            const checked = selectedKeys.includes(key);
            return (
              <Checkbox.Root
                key={key}
                checked={checked}
                onCheckedChange={() => toggle(key)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  checked && "font-medium",
                )}
              >
                <div className="size-4 shrink-0 rounded border border-input flex items-center justify-center">
                  <Checkbox.Indicator>
                    <Check className="size-3" />
                  </Checkbox.Indicator>
                </div>
                {pack.name}
              </Checkbox.Root>
            );
          })}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
