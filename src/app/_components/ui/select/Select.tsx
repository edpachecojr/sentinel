"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/app/_lib/utils";

export const Select = SelectPrimitive.Root;

export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;
export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-900 shadow-sm transition-colors hover:border-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:hover:border-gray-600",
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-60" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

export const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      position={position}
      className={cn(
        "relative z-50 min-w-[8rem] overflow-hidden rounded-xl border border-gray-200 bg-white text-gray-950 shadow-theme-lg animate-in fade-in-80 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ScrollUpButton className="flex h-8 items-center justify-center bg-white text-gray-500 dark:bg-gray-950 dark:text-gray-400">
        <ChevronUp className="h-4 w-4" />
      </SelectPrimitive.ScrollUpButton>
      <SelectPrimitive.Viewport className="p-1">
        {children}
      </SelectPrimitive.Viewport>
      <SelectPrimitive.ScrollDownButton className="flex h-8 items-center justify-center bg-white text-gray-500 dark:bg-gray-950 dark:text-gray-400">
        <ChevronDown className="h-4 w-4" />
      </SelectPrimitive.ScrollDownButton>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

export const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400",
      className,
    )}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-md px-2 py-2 text-sm font-medium text-gray-900 outline-none focus:bg-brand-50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:text-gray-100 dark:focus:bg-white/10",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText className="pl-5" />
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

export const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("my-1 h-px bg-gray-200 dark:bg-gray-800", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

// -----------------------------------------------------------------------------
// Searchable Select (for large option lists)
// -----------------------------------------------------------------------------

export interface SearchableSelectOption {
  value: string;
  label: string;
  group?: string;
}

export interface SearchableSelectLoadOptionsParams {
  query: string;
  cursor?: string | null;
  pageSize: number;
}

export interface SearchableSelectLoadOptionsResult {
  items: SearchableSelectOption[];
  nextCursor?: string | null;
  total?: number;
}

export type SearchableSelectLoadOptions = (
  params: SearchableSelectLoadOptionsParams,
) => Promise<SearchableSelectLoadOptionsResult | SearchableSelectOption[]>;

export interface SearchableSelectProps {
  /** Static options (used when loadOptions is not provided) */
  options?: SearchableSelectOption[];
  /** Load options on demand (recommended for very large datasets) */
  loadOptions?: SearchableSelectLoadOptions;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  groupBy?: (option: SearchableSelectOption) => string | undefined;
  /** Minimum characters required to trigger remote fetch */
  minSearchLength?: number;
  /** Items requested per page when using loadOptions */
  pageSize?: number;
  /** Debounce delay for remote queries */
  debounceMs?: number;
  /** If true, fetch initial options when the dropdown opens */
  fetchOnOpen?: boolean;
  /** Passed through to the underlying Radix Select trigger */
  triggerProps?: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>;
}

interface VirtualRow {
  type: "group" | "item";
  key: string;
  label: string;
  option?: SearchableSelectOption;
}

export function SearchableSelect({
  options = [],
  loadOptions,
  value,
  defaultValue,
  placeholder = "Selecione uma opção",
  searchPlaceholder = "Pesquisar...",
  onValueChange,
  disabled = false,
  className = "",
  groupBy,
  minSearchLength = 0,
  pageSize = 40,
  debounceMs = 250,
  fetchOnOpen = true,
  triggerProps,
}: SearchableSelectProps) {
  const [query, setQuery] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [internalOptions, setInternalOptions] = React.useState<SearchableSelectOption[]>(options);
  const [nextCursor, setNextCursor] = React.useState<string | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = React.useState(false);
  const requestId = React.useRef(0);
  const viewportRef = React.useRef<HTMLDivElement | null>(null);

  const pageSizeRef = React.useRef(pageSize);
  pageSizeRef.current = pageSize;

  const effectiveOptions = loadOptions ? internalOptions : options;

  React.useEffect(() => {
    if (!loadOptions) return;
    setInternalOptions(options);
  }, [options, loadOptions]);

  const buildRows = React.useMemo(() => {
    const rows: VirtualRow[] = [];

    const grouped = (() => {
      if (!groupBy) return [{ group: "", items: effectiveOptions }];

      const groups = new Map<string, SearchableSelectOption[]>();

      for (const option of effectiveOptions) {
        const groupKey = groupBy(option) ?? "";
        const items = groups.get(groupKey) ?? [];
        items.push(option);
        groups.set(groupKey, items);
      }

      return Array.from(groups, ([group, items]) => ({ group, items }));
    })();

    for (const { group, items } of grouped) {
      if (group) {
        rows.push({ type: "group", key: `group-${group}`, label: group });
      }
      for (const item of items) {
        rows.push({ type: "item", key: `item-${item.value}`, label: item.label, option: item });
      }
    }

    return rows;
  }, [effectiveOptions, groupBy]);

  const hasMore = Boolean(loadOptions && nextCursor !== null);
  const virtualizer = useVirtualizer({
    count: buildRows.length + (hasMore ? 1 : 0),
    getScrollElement: () => viewportRef.current,
    estimateSize: () => 44,
    overscan: 5,
  });

  const loadPage = React.useCallback(
    async (search: string, cursor: string | null) => {
      if (!loadOptions) return;
      const normalized = search.trim();
      if (normalized.length < minSearchLength && hasLoadedOnce && !cursor) {
        return;
      }

      const id = ++requestId.current;
      const isNext = Boolean(cursor);
      if (isNext) setIsLoadingMore(true); else setIsLoading(true);

      try {
        const result = await loadOptions({
          query: normalized,
          cursor: cursor ?? undefined,
          pageSize: pageSizeRef.current,
        });

        if (requestId.current !== id) return;

        const { items, nextCursor: newCursor } = Array.isArray(result)
          ? { items: result, nextCursor: null }
          : result;

        setInternalOptions((prev) => (cursor ? [...prev, ...items] : items));
        setNextCursor(newCursor ?? null);
        setHasLoadedOnce(true);
      } catch {
        if (requestId.current !== id) return;
        if (!cursor) setInternalOptions([]);
        setNextCursor(null);
      } finally {
        if (requestId.current === id) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [hasLoadedOnce, loadOptions, minSearchLength],
  );

  React.useEffect(() => {
    if (!loadOptions || !isOpen) return;

    const normalized = query.trim();
    if (normalized.length < minSearchLength && !hasLoadedOnce) {
      if (fetchOnOpen) {
        loadPage("", null);
      }
      return;
    }

    const handle = window.setTimeout(() => loadPage(query, null), debounceMs);
    return () => window.clearTimeout(handle);
  }, [debounceMs, fetchOnOpen, hasLoadedOnce, isOpen, loadPage, loadOptions, minSearchLength, query]);

  React.useEffect(() => {
    if (!hasMore || isLoadingMore) return;

    const virtualItems = virtualizer.getVirtualItems();
    const lastItem = virtualItems[virtualItems.length - 1];

    if (!lastItem) return;

    const nearBottom = lastItem.index >= buildRows.length - 3;
    if (nearBottom) {
      loadPage(query, nextCursor);
    }
  }, [buildRows.length, hasMore, isLoadingMore, loadPage, nextCursor, query, virtualizer]);

  const contentIsEmpty = buildRows.length === 0 && !isLoading;

  return (
    <SelectPrimitive.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
      onOpenChange={setIsOpen}
    >
      <SelectTrigger disabled={disabled} className={className} {...triggerProps}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <div className="p-3">
          <div className="relative">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
            />
            {(isLoading || isLoadingMore) ? (
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
              </span>
            ) : null}
          </div>
        </div>

        {contentIsEmpty ? (
          <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
            {isLoading ? "Carregando..." : "Nenhum resultado encontrado"}
          </div>
        ) : (
          <SelectPrimitive.Viewport
            ref={viewportRef}
            className="h-64 overflow-auto px-1"
          >
            <div
              style={{
                height: virtualizer.getTotalSize(),
                width: "100%",
                position: "relative",
              }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const isLoadMoreRow = hasMore && virtualRow.index === buildRows.length;
                const style: React.CSSProperties = {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                };

                if (isLoadMoreRow) {
                  return (
                    <div
                      key="load-more"
                      style={style}
                      className="flex h-10 items-center justify-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      {isLoadingMore ? "Carregando mais..." : "Role para carregar mais"}
                    </div>
                  );
                }

                const row = buildRows[virtualRow.index];
                if (!row) return null;

                if (row.type === "group") {
                  return (
                    <div key={row.key} style={style}>
                      <SelectLabel>{row.label}</SelectLabel>
                    </div>
                  );
                }

                return (
                  <div key={row.key} style={style}>
                    <SelectItem value={row.option!.value}>{row.option!.label}</SelectItem>
                  </div>
                );
              })}
            </div>
          </SelectPrimitive.Viewport>
        )}
      </SelectContent>
    </SelectPrimitive.Root>
  );
}
