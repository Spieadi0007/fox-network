"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Settings2,
  GripVertical,
  Eye,
  EyeOff,
  RotateCcw,
  ListFilter,
  X,
  Plus,
  Check,
  MoreHorizontal,
  Pencil,
  Trash2,
  Star,
  Users,
  Download,
  Type,
  Copy,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  saveTablePreferences,
  createSavedView,
  updateSavedView,
  deleteSavedView,
  renameSavedView,
  setPreferredView,
  createSharedView,
  reorderSavedViews,
} from "@fox/supabase/actions/preferences";

// ---------- Types ----------

export type ColumnType = "text" | "number" | "date" | "enum";

export interface Column<T> {
  key: string;
  label: string;
  type?: ColumnType;
  filterable?: boolean;
  filterOptions?: { label: string; value: string }[];
  filterValue?: (row: T) => unknown;
  render?: (row: T) => React.ReactNode;
}

type ColumnConfig = { key: string; visible: boolean };

interface FilterCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

export interface SavedView {
  id: string;
  name: string;
  column_config: ColumnConfig[];
  sort_config: { key: string; direction: "asc" | "desc" } | null;
  filter_config: {
    conditions: { field: string; operator: string; value: string }[];
    conjunction: "and" | "or";
  } | null;
  search_text: string;
  is_shared: boolean;
  is_preferred: boolean;
  created_by_id: string;
}

export interface BulkActionDirect {
  type: "action";
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "destructive";
  onAction: (selectedIds: string[]) => Promise<void>;
}

export interface BulkActionSelect {
  type: "select";
  label: string;
  icon?: React.ReactNode;
  options: { label: string; value: string }[];
  onAction: (selectedIds: string[], value: string) => Promise<void>;
}

export type BulkAction = BulkActionDirect | BulkActionSelect;

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKey?: string;
  searchPlaceholder?: string;
  onRowClick?: (row: T) => void;
  storageKey?: string;
  initialColumnConfig?: ColumnConfig[] | null;
  savedViews?: SavedView[];
  userRole?: string;
  userId?: string;
  bulkActions?: BulkAction[];
}

// ---------- Operator definitions ----------

const TEXT_OPERATORS = [
  { label: "contains", value: "contains" },
  { label: "does not contain", value: "not_contains" },
  { label: "is", value: "is" },
  { label: "is not", value: "is_not" },
  { label: "is empty", value: "is_empty" },
  { label: "is not empty", value: "is_not_empty" },
];

const NUMBER_OPERATORS = [
  { label: "=", value: "eq" },
  { label: "\u2260", value: "neq" },
  { label: ">", value: "gt" },
  { label: "<", value: "lt" },
  { label: "\u2265", value: "gte" },
  { label: "\u2264", value: "lte" },
  { label: "is empty", value: "is_empty" },
  { label: "is not empty", value: "is_not_empty" },
];

const DATE_OPERATORS = [
  { label: "is", value: "is" },
  { label: "is before", value: "is_before" },
  { label: "is after", value: "is_after" },
  { label: "is on or before", value: "is_on_or_before" },
  { label: "is on or after", value: "is_on_or_after" },
  { label: "is empty", value: "is_empty" },
  { label: "is not empty", value: "is_not_empty" },
];

const ENUM_OPERATORS = [
  { label: "is", value: "is" },
  { label: "is not", value: "is_not" },
  { label: "is empty", value: "is_empty" },
  { label: "is not empty", value: "is_not_empty" },
];

function getOperators(type: ColumnType) {
  switch (type) {
    case "number": return NUMBER_OPERATORS;
    case "date": return DATE_OPERATORS;
    case "enum": return ENUM_OPERATORS;
    default: return TEXT_OPERATORS;
  }
}

const NO_VALUE_OPERATORS = new Set(["is_empty", "is_not_empty"]);

// ---------- Filter evaluation ----------

function evaluateCondition<T extends Record<string, unknown>>(
  row: T,
  condition: FilterCondition,
  colMap: Map<string, Column<T>>,
): boolean {
  const col = colMap.get(condition.field);
  if (!col) return true;

  const { operator, value } = condition;
  const colType = col.type ?? "text";

  // No-value operators
  if (operator === "is_empty") {
    const raw = col.filterValue ? col.filterValue(row) : row[col.key];
    return raw == null || raw === "";
  }
  if (operator === "is_not_empty") {
    const raw = col.filterValue ? col.filterValue(row) : row[col.key];
    return raw != null && raw !== "";
  }

  // If user hasn't typed a value yet, pass through (don't hide rows)
  if (!value && value !== "0") return true;

  const raw = col.filterValue ? col.filterValue(row) : row[col.key];

  if (colType === "text") {
    const rowVal = (raw ?? "").toString().toLowerCase();
    const filterVal = value.toLowerCase();
    switch (operator) {
      case "contains": return rowVal.includes(filterVal);
      case "not_contains": return !rowVal.includes(filterVal);
      case "is": return rowVal === filterVal;
      case "is_not": return rowVal !== filterVal;
      default: return true;
    }
  }

  if (colType === "number") {
    const rowNum = raw != null ? Number(raw) : NaN;
    const filterNum = Number(value);
    if (isNaN(filterNum)) return true;
    if (isNaN(rowNum)) return false;
    switch (operator) {
      case "eq": return rowNum === filterNum;
      case "neq": return rowNum !== filterNum;
      case "gt": return rowNum > filterNum;
      case "lt": return rowNum < filterNum;
      case "gte": return rowNum >= filterNum;
      case "lte": return rowNum <= filterNum;
      default: return true;
    }
  }

  if (colType === "date") {
    if (!raw) return false;
    const rowDate = new Date(raw as string).setHours(0, 0, 0, 0);
    const filterDate = new Date(value).setHours(0, 0, 0, 0);
    if (isNaN(filterDate)) return true;
    if (isNaN(rowDate)) return false;
    switch (operator) {
      case "is": return rowDate === filterDate;
      case "is_before": return rowDate < filterDate;
      case "is_after": return rowDate > filterDate;
      case "is_on_or_before": return rowDate <= filterDate;
      case "is_on_or_after": return rowDate >= filterDate;
      default: return true;
    }
  }

  if (colType === "enum") {
    const rowVal = (raw ?? "").toString();
    switch (operator) {
      case "is": return rowVal === value;
      case "is_not": return rowVal !== value;
      default: return true;
    }
  }

  return true;
}

// ---------- Component ----------

let conditionIdCounter = 0;
function nextConditionId() {
  return `fc_${++conditionIdCounter}`;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
const MAX_VIEWS = 7;

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  searchKey,
  searchPlaceholder = "Search...",
  onRowClick,
  storageKey,
  initialColumnConfig,
  savedViews: initialSavedViews,
  userRole,
  userId,
  bulkActions,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [conditions, setConditions] = useState<FilterCondition[]>([]);
  const [conjunction, setConjunction] = useState<"and" | "or">("and");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [showColPicker, setShowColPicker] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // ---------- Saved views state ----------
  const [views, setViews] = useState<SavedView[]>(initialSavedViews ?? []);
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showNewViewInput, setShowNewViewInput] = useState(false);
  const [newViewName, setNewViewName] = useState("");
  const [saveAsShared, setSaveAsShared] = useState(false);
  const [viewMenuId, setViewMenuId] = useState<string | null>(null);
  const [viewSaving, setViewSaving] = useState(false);
  const [renamingViewId, setRenamingViewId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const viewMenuRef = useRef<HTMLDivElement>(null);
  const newViewInputRef = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const preferredViewApplied = useRef(false);

  // ---------- View pill drag refs ----------
  const viewDragItem = useRef<number | null>(null);
  const viewDragOverItem = useRef<number | null>(null);
  const viewDragSection = useRef<"personal" | "shared" | null>(null);

  // ---------- Bulk selection state ----------
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteAction, setPendingDeleteAction] = useState<BulkActionDirect | null>(null);

  // Snapshot of the active view's config (to detect changes)
  const activeViewSnapshot = useRef<string | null>(null);

  // Column config — start with server-provided or defaults
  const defaultKeys = useMemo(() => columns.map((c) => c.key), [columns]);
  const defaultConfig = useMemo(() => defaultKeys.map((k) => ({ key: k, visible: true })), [defaultKeys]);

  const [colConfig, setColConfig] = useState<ColumnConfig[]>(() => {
    if (initialColumnConfig && initialColumnConfig.length > 0) {
      const savedKeys = new Set(initialColumnConfig.map((c) => c.key));
      const merged = initialColumnConfig.filter((c) => defaultKeys.includes(c.key));
      for (const k of defaultKeys) {
        if (!savedKeys.has(k)) merged.push({ key: k, visible: true });
      }
      return merged;
    }
    return defaultConfig;
  });

  // Debounced save to database — only when no view is active
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!storageKey) return;
    if (activeViewId !== null) return; // Don't auto-save when a view is active
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveTablePreferences(storageKey, colConfig);
    }, 800);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [colConfig, storageKey, activeViewId]);

  // Track unsaved changes when a view is active
  useEffect(() => {
    if (activeViewId === null) {
      setHasUnsavedChanges(false);
      return;
    }
    const currentSnapshot = JSON.stringify({
      colConfig,
      sortKey,
      sortDir,
      conditions: conditions.map(c => ({ field: c.field, operator: c.operator, value: c.value })),
      conjunction,
      search,
    });
    setHasUnsavedChanges(activeViewSnapshot.current !== null && currentSnapshot !== activeViewSnapshot.current);
  }, [colConfig, sortKey, sortDir, conditions, conjunction, activeViewId, search]);

  // Close picker on outside click
  useEffect(() => {
    if (!showColPicker) return;
    function handleClick(e: MouseEvent) {
      if (
        pickerRef.current && !pickerRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setShowColPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showColPicker]);

  // Close view menu on outside click
  useEffect(() => {
    if (!viewMenuId) return;
    function handleClick(e: MouseEvent) {
      if (viewMenuRef.current && !viewMenuRef.current.contains(e.target as Node)) {
        setViewMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [viewMenuId]);

  // Focus the new view input when it appears
  useEffect(() => {
    if (showNewViewInput && newViewInputRef.current) {
      newViewInputRef.current.focus();
    }
  }, [showNewViewInput]);

  // Focus rename input when it appears
  useEffect(() => {
    if (renamingViewId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingViewId]);

  // Auto-load preferred view on mount
  useEffect(() => {
    if (preferredViewApplied.current) return;
    const preferred = views.find(v => v.is_preferred);
    if (preferred) {
      preferredViewApplied.current = true;
      applyView(preferred);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Column map + visible columns
  const colMap = useMemo(() => {
    const m = new Map<string, Column<T>>();
    for (const c of columns) m.set(c.key, c);
    return m;
  }, [columns]);

  const visibleColumns = useMemo(
    () => colConfig.filter((c) => c.visible && colMap.has(c.key)).map((c) => colMap.get(c.key)!),
    [colConfig, colMap]
  );

  // Filterable columns (for the field dropdown)
  const filterableColumns = useMemo(
    () => columns.filter((c) => c.filterable !== false),
    [columns]
  );

  // ---------- Row count badges ----------
  const viewCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const view of views) {
      if (!view.filter_config || view.filter_config.conditions.length === 0) {
        counts.set(view.id, data.length);
        continue;
      }
      const { conditions: conds, conjunction: conj } = view.filter_config;
      let count = 0;
      for (const row of data) {
        const results = conds.map(c => evaluateCondition(row, { ...c, id: "" }, colMap));
        if (conj === "and" ? results.every(Boolean) : results.some(Boolean)) count++;
      }
      counts.set(view.id, count);
    }
    return counts;
  }, [data, views, colMap]);

  // Split views into personal and shared
  const personalViews = useMemo(() => views.filter(v => !v.is_shared), [views]);
  const sharedViews = useMemo(() => views.filter(v => v.is_shared), [views]);

  const canManageShared = userRole === "admin" || userRole === "manager";

  // ---------- View switching ----------

  function mergeColumnConfig(viewConfig: ColumnConfig[]): ColumnConfig[] {
    const savedKeys = new Set(viewConfig.map((c) => c.key));
    const merged = viewConfig.filter((c) => defaultKeys.includes(c.key));
    for (const k of defaultKeys) {
      if (!savedKeys.has(k)) merged.push({ key: k, visible: true });
    }
    return merged;
  }

  function applyView(view: SavedView) {
    setActiveViewId(view.id);
    setColConfig(mergeColumnConfig(view.column_config));
    setSortKey(view.sort_config?.key ?? null);
    setSortDir(view.sort_config?.direction ?? "asc");
    setSearch(view.search_text ?? "");
    if (view.filter_config && view.filter_config.conditions.length > 0) {
      setConditions(view.filter_config.conditions.map(c => ({ ...c, id: nextConditionId() })));
      setConjunction(view.filter_config.conjunction);
      setShowFilters(true);
    } else {
      setConditions([]);
      setConjunction("and");
      setShowFilters(false);
    }
    setPage(0);
    setHasUnsavedChanges(false);

    // Snapshot for change detection
    const snapshot = JSON.stringify({
      colConfig: mergeColumnConfig(view.column_config),
      sortKey: view.sort_config?.key ?? null,
      sortDir: view.sort_config?.direction ?? "asc",
      conditions: view.filter_config?.conditions ?? [],
      conjunction: view.filter_config?.conjunction ?? "and",
      search: view.search_text ?? "",
    });
    activeViewSnapshot.current = snapshot;
  }

  function applyDefault() {
    setActiveViewId(null);
    setColConfig(defaultConfig);
    setSortKey(null);
    setSortDir("asc");
    setSearch("");
    setConditions([]);
    setConjunction("and");
    setShowFilters(false);
    setPage(0);
    setHasUnsavedChanges(false);
    activeViewSnapshot.current = null;
  }

  function getCurrentConfig() {
    return {
      column_config: colConfig,
      sort_config: sortKey ? { key: sortKey, direction: sortDir } as const : null,
      filter_config: conditions.length > 0
        ? {
            conditions: conditions.map(c => ({ field: c.field, operator: c.operator, value: c.value })),
            conjunction,
          } as const
        : null,
      search_text: search,
    };
  }

  async function handleSaveNewView() {
    const name = newViewName.trim();
    if (!name || !storageKey || viewSaving) return;
    setViewSaving(true);
    const config = getCurrentConfig();

    let result;
    if (saveAsShared) {
      result = await createSharedView(storageKey, name, config);
    } else {
      result = await createSavedView(storageKey, name, config);
    }

    setViewSaving(false);
    if (result.error || !result.data) return;
    const newView: SavedView = {
      id: result.data.id,
      name: result.data.name,
      column_config: result.data.column_config,
      sort_config: result.data.sort_config,
      filter_config: result.data.filter_config,
      search_text: result.data.search_text ?? "",
      is_shared: result.data.is_shared ?? false,
      is_preferred: false,
      created_by_id: result.data.created_by_id ?? "",
    };
    setViews(prev => [...prev, newView]);
    setShowNewViewInput(false);
    setNewViewName("");
    setSaveAsShared(false);
    applyView(newView);
  }

  async function handleUpdateView(viewId: string) {
    if (viewSaving) return;
    setViewSaving(true);
    const config = getCurrentConfig();
    const { error } = await updateSavedView(viewId, config);
    setViewSaving(false);
    if (error) return;
    setViews(prev => prev.map(v =>
      v.id === viewId
        ? {
            ...v,
            column_config: config.column_config,
            sort_config: config.sort_config,
            filter_config: config.filter_config,
            search_text: config.search_text,
          }
        : v
    ));
    setHasUnsavedChanges(false);
    setViewMenuId(null);
    // Update snapshot
    activeViewSnapshot.current = JSON.stringify({
      colConfig: config.column_config,
      sortKey: config.sort_config?.key ?? null,
      sortDir: config.sort_config?.direction ?? "asc",
      conditions: config.filter_config?.conditions ?? [],
      conjunction: config.filter_config?.conjunction ?? "and",
      search: config.search_text,
    });
  }

  async function handleDeleteView(viewId: string) {
    if (viewSaving) return;
    setViewSaving(true);
    const { error } = await deleteSavedView(viewId);
    setViewSaving(false);
    if (error) return;
    setViews(prev => prev.filter(v => v.id !== viewId));
    setViewMenuId(null);
    if (activeViewId === viewId) {
      applyDefault();
    }
  }

  async function handleRenameView(viewId: string) {
    const name = renameValue.trim();
    if (!name || viewSaving) return;
    setViewSaving(true);
    const { error } = await renameSavedView(viewId, name);
    setViewSaving(false);
    if (error) return;
    setViews(prev => prev.map(v => v.id === viewId ? { ...v, name } : v));
    setRenamingViewId(null);
    setRenameValue("");
  }

  async function handleSetPreferred(viewId: string, isCurrentlyPreferred: boolean) {
    if (!storageKey || viewSaving) return;
    setViewSaving(true);
    const newViewId = isCurrentlyPreferred ? null : viewId;
    const { error } = await setPreferredView(storageKey, newViewId);
    setViewSaving(false);
    if (error) return;
    setViews(prev => prev.map(v => ({
      ...v,
      is_preferred: v.id === newViewId,
    })));
    setViewMenuId(null);
  }

  // ---------- CSV Export ----------
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportColumnKeys, setExportColumnKeys] = useState<string[]>([]);

  function openExportDialog() {
    setExportColumnKeys(visibleColumns.map(c => c.key));
    setShowExportDialog(true);
  }

  function toggleExportColumn(key: string) {
    setExportColumnKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  }

  function handleExportCSV() {
    const exportCols = columns.filter(c => exportColumnKeys.includes(c.key));
    if (exportCols.length === 0) return;
    const headers = exportCols.map(c => c.label);
    const rows = filtered.map(row =>
      exportCols.map(col => {
        const val = col.filterValue ? col.filterValue(row) : row[col.key];
        return val != null ? String(val) : "";
      })
    );
    const csv = [headers, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${storageKey ?? "export"}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportDialog(false);
  }

  // ---------- Filter condition handlers ----------

  function addCondition() {
    const firstFilterable = filterableColumns[0];
    const field = firstFilterable?.key ?? "";
    const type = firstFilterable?.type ?? "text";
    const ops = getOperators(type);
    setConditions((prev) => [
      ...prev,
      { id: nextConditionId(), field, operator: ops[0].value, value: "" },
    ]);
  }

  function removeCondition(id: string) {
    setConditions((prev) => prev.filter((c) => c.id !== id));
    setPage(0);
  }

  function clearAllConditions() {
    setConditions([]);
    setPage(0);
  }

  function handleFieldChange(id: string, newField: string) {
    setConditions((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const col = colMap.get(newField);
        const type = col?.type ?? "text";
        const ops = getOperators(type);
        return { ...c, field: newField, operator: ops[0].value, value: "" };
      })
    );
    setPage(0);
  }

  function handleOperatorChange(id: string, newOp: string) {
    setConditions((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        return { ...c, operator: newOp, value: NO_VALUE_OPERATORS.has(newOp) ? "" : c.value };
      })
    );
    setPage(0);
  }

  function handleValueChange(id: string, newVal: string) {
    setConditions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, value: newVal } : c))
    );
    setPage(0);
  }

  // Auto-add first condition when opening filter panel
  function toggleFilters() {
    const next = !showFilters;
    setShowFilters(next);
    if (next && conditions.length === 0) {
      addCondition();
    }
  }

  // Count "active" conditions (ones with a value set, or no-value operators)
  const activeFilterCount = conditions.filter(
    (c) => NO_VALUE_OPERATORS.has(c.operator) || (c.value !== "")
  ).length;

  // ---------- Filtering + sorting ----------

  const filtered = useMemo(() => {
    let rows = [...data];
    if (search && searchKey) {
      const q = search.toLowerCase();
      rows = rows.filter((row) => {
        const val = row[searchKey];
        return typeof val === "string" && val.toLowerCase().includes(q);
      });
    }
    if (conditions.length > 0) {
      rows = rows.filter((row) => {
        const results = conditions.map((cond) => evaluateCondition(row, cond, colMap));
        return conjunction === "and"
          ? results.every(Boolean)
          : results.some(Boolean);
      });
    }
    if (sortKey) {
      const sortCol = colMap.get(sortKey);
      rows.sort((a, b) => {
        const aVal = sortCol?.filterValue ? sortCol.filterValue(a) ?? "" : a[sortKey] ?? "";
        const bVal = sortCol?.filterValue ? sortCol.filterValue(b) ?? "" : b[sortKey] ?? "";
        if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }
    return rows;
  }, [data, search, searchKey, conditions, conjunction, sortKey, sortDir, colMap]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  // Clear selection when page/filter/sort/search changes
  useEffect(() => {
    setSelectedIds(new Set());
  }, [page, pageSize, search, sortKey, sortDir, conditions, conjunction]);

  // ---------- Bulk selection helpers ----------
  function toggleRowSelection(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSelectAllPage() {
    const pageIds = paged.map(r => r.id as string).filter(Boolean);
    const allSelected = pageIds.every(id => selectedIds.has(id));
    if (allSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        pageIds.forEach(id => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        pageIds.forEach(id => next.add(id));
        return next;
      });
    }
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  async function executeBulkAction(action: BulkActionDirect) {
    if (action.variant === "destructive") {
      setPendingDeleteAction(action);
      setShowDeleteConfirm(true);
      return;
    }
    setBulkActionLoading(true);
    await action.onAction(Array.from(selectedIds));
    setBulkActionLoading(false);
    clearSelection();
  }

  async function confirmDeleteAction() {
    if (!pendingDeleteAction) return;
    setBulkActionLoading(true);
    await pendingDeleteAction.onAction(Array.from(selectedIds));
    setBulkActionLoading(false);
    setShowDeleteConfirm(false);
    setPendingDeleteAction(null);
    clearSelection();
  }

  async function executeBulkSelectAction(action: BulkActionSelect, value: string) {
    setBulkActionLoading(true);
    await action.onAction(Array.from(selectedIds), value);
    setBulkActionLoading(false);
    clearSelection();
  }

  function handleSort(key: string) {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
    setPage(0);
  }

  function toggleVisibility(key: string) {
    setColConfig((prev) => prev.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c)));
  }

  function resetColumns() {
    setColConfig(defaultConfig);
  }

  // Drag reorder
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragStart = useCallback((idx: number) => { dragItem.current = idx; }, []);
  const handleDragEnter = useCallback((idx: number) => { dragOverItem.current = idx; }, []);
  const handleDragEnd = useCallback(() => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const from = dragItem.current;
    const to = dragOverItem.current;
    if (from !== to) {
      setColConfig((prev) => {
        const next = [...prev];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        return next;
      });
    }
    dragItem.current = null;
    dragOverItem.current = null;
  }, []);

  const hiddenCount = colConfig.filter((c) => !c.visible && colMap.has(c.key)).length;

  // ---------- View pill drag reorder ----------
  const handleViewDragStart = useCallback((idx: number, section: "personal" | "shared") => {
    viewDragItem.current = idx;
    viewDragSection.current = section;
  }, []);

  const handleViewDragEnter = useCallback((idx: number) => {
    viewDragOverItem.current = idx;
  }, []);

  const handleViewDragEnd = useCallback(() => {
    if (viewDragItem.current === null || viewDragOverItem.current === null || !viewDragSection.current) {
      viewDragItem.current = null;
      viewDragOverItem.current = null;
      viewDragSection.current = null;
      return;
    }
    const from = viewDragItem.current;
    const to = viewDragOverItem.current;
    const section = viewDragSection.current;

    if (from !== to) {
      setViews(prev => {
        const sectionViews = section === "personal"
          ? prev.filter(v => !v.is_shared)
          : prev.filter(v => v.is_shared);
        const otherViews = section === "personal"
          ? prev.filter(v => v.is_shared)
          : prev.filter(v => !v.is_shared);

        const reordered = [...sectionViews];
        const [moved] = reordered.splice(from, 1);
        reordered.splice(to, 0, moved);

        // Fire-and-forget persist
        reorderSavedViews(reordered.map((v, i) => ({ id: v.id, display_order: i })));

        return section === "personal"
          ? [...reordered, ...otherViews]
          : [...otherViews, ...reordered];
      });
    }

    viewDragItem.current = null;
    viewDragOverItem.current = null;
    viewDragSection.current = null;
  }, []);

  // ---------- Duplicate a view ----------
  async function handleDuplicateView(view: SavedView) {
    if (viewSaving || !storageKey) return;
    const targetViews = view.is_shared ? sharedViews : personalViews;
    if (targetViews.length >= MAX_VIEWS) return;

    setViewSaving(true);
    const config = {
      column_config: view.column_config,
      sort_config: view.sort_config,
      filter_config: view.filter_config,
      search_text: view.search_text,
    };

    let result;
    if (view.is_shared) {
      result = await createSharedView(storageKey, `Copy of ${view.name}`, config);
    } else {
      result = await createSavedView(storageKey, `Copy of ${view.name}`, config);
    }
    setViewSaving(false);
    if (result.error || !result.data) return;
    const newView: SavedView = {
      id: result.data.id,
      name: result.data.name,
      column_config: result.data.column_config,
      sort_config: result.data.sort_config,
      filter_config: result.data.filter_config,
      search_text: result.data.search_text ?? "",
      is_shared: result.data.is_shared ?? false,
      is_preferred: false,
      created_by_id: result.data.created_by_id ?? "",
    };
    setViews(prev => [...prev, newView]);
    setViewMenuId(null);
    applyView(newView);
  }

  // Helper: can user edit a specific view?
  function canEditView(view: SavedView) {
    if (!view.is_shared) return true; // personal view — always editable
    return view.created_by_id === userId || userRole === "admin";
  }

  // Render a view pill
  function renderViewPill(view: SavedView, idx: number, section: "personal" | "shared") {
    const isActive = activeViewId === view.id;
    const isRenaming = renamingViewId === view.id;
    const count = viewCounts.get(view.id);
    const editable = canEditView(view);
    const targetViews = section === "personal" ? personalViews : sharedViews;
    const atLimit = targetViews.length >= MAX_VIEWS;

    return (
      <div
        key={view.id}
        className="relative flex items-center"
        draggable={editable}
        onDragStart={() => editable && handleViewDragStart(idx, section)}
        onDragEnter={() => handleViewDragEnter(idx)}
        onDragEnd={handleViewDragEnd}
        onDragOver={(e) => e.preventDefault()}
      >
        {isRenaming ? (
          <form
            onSubmit={(e) => { e.preventDefault(); handleRenameView(view.id); }}
            className="inline-flex items-center gap-1"
          >
            <input
              ref={renameInputRef}
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={() => { if (renameValue.trim()) handleRenameView(view.id); else { setRenamingViewId(null); setRenameValue(""); } }}
              maxLength={30}
              className="h-8 w-32 rounded-full border border-stone-300 bg-white px-3 text-xs outline-none focus:border-stone-400"
            />
          </form>
        ) : (
          <>
            <button
              onClick={() => applyView(view)}
              className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-stone-900 text-white"
                  : view.is_shared
                    ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {view.is_preferred && (
                <Star className="h-3 w-3 fill-current" />
              )}
              {view.is_shared && (
                <Users className="h-3 w-3" />
              )}
              {view.name}
              {count !== undefined && (
                <span className={`text-[10px] ${isActive ? "text-white/70" : "text-stone-400"}`}>
                  {count}
                </span>
              )}
              {isActive && hasUnsavedChanges && (
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              )}
            </button>
            {editable && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewMenuId(viewMenuId === view.id ? null : view.id);
                  }}
                  className="ml-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-200 hover:text-stone-600"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </button>
                {viewMenuId === view.id && (
                  <div
                    ref={viewMenuRef}
                    className="absolute left-0 top-full z-50 mt-1 w-44 rounded-xl border border-stone-200 bg-white py-1 shadow-lg"
                  >
                    <button
                      onClick={() => {
                        setRenamingViewId(view.id);
                        setRenameValue(view.name);
                        setViewMenuId(null);
                      }}
                      disabled={viewSaving}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50"
                    >
                      <Type className="h-3 w-3" />
                      Rename
                    </button>
                    <button
                      onClick={() => handleUpdateView(view.id)}
                      disabled={viewSaving}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50"
                    >
                      <Pencil className="h-3 w-3" />
                      Update view
                    </button>
                    <button
                      onClick={() => {
                        if (activeViewId !== view.id) applyView(view);
                        setShowColPicker(true);
                        setViewMenuId(null);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      <Settings2 className="h-3 w-3" />
                      Edit Columns
                    </button>
                    <button
                      onClick={() => handleDuplicateView(view)}
                      disabled={viewSaving || atLimit}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50"
                    >
                      <Copy className="h-3 w-3" />
                      Duplicate
                    </button>
                    {!view.is_shared && (
                      <button
                        onClick={() => handleSetPreferred(view.id, view.is_preferred)}
                        disabled={viewSaving}
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50"
                      >
                        <Star className={`h-3 w-3 ${view.is_preferred ? "fill-current text-amber-500" : ""}`} />
                        {view.is_preferred ? "Unset as default" : "Set as default"}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteView(view.id)}
                      disabled={viewSaving}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete view
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 min-w-0">
      {/* View Selector Bar */}
      {storageKey && (
        <div className="flex items-center gap-2 flex-wrap">
          {/* Default pill */}
          <button
            onClick={applyDefault}
            className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-xs font-medium transition-colors ${
              activeViewId === null
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            Default
          </button>

          {/* Personal view pills */}
          {personalViews.map((v, i) => renderViewPill(v, i, "personal"))}

          {/* Divider between personal and shared */}
          {sharedViews.length > 0 && personalViews.length > 0 && (
            <div className="h-5 w-px bg-stone-200" />
          )}

          {/* Shared view pills */}
          {sharedViews.map((v, i) => renderViewPill(v, i, "shared"))}

          {/* Save View button / input */}
          {personalViews.length < MAX_VIEWS && (
            showNewViewInput ? (
              <form
                onSubmit={(e) => { e.preventDefault(); handleSaveNewView(); }}
                className="inline-flex items-center gap-1.5"
              >
                <input
                  ref={newViewInputRef}
                  type="text"
                  value={newViewName}
                  onChange={(e) => setNewViewName(e.target.value)}
                  placeholder="View name..."
                  maxLength={30}
                  className="h-8 w-36 rounded-full border border-stone-200 bg-white px-3 text-xs outline-none placeholder:text-stone-400 focus:border-stone-400"
                />
                {canManageShared && (
                  <button
                    type="button"
                    onClick={() => setSaveAsShared(!saveAsShared)}
                    title={saveAsShared ? "Saving as team view" : "Saving as personal view"}
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                      saveAsShared
                        ? "bg-blue-100 text-blue-600"
                        : "text-stone-400 hover:bg-stone-100 hover:text-stone-600"
                    }`}
                  >
                    <Users className="h-3 w-3" />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!newViewName.trim() || viewSaving}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-stone-900 text-white transition-colors hover:bg-stone-800 disabled:opacity-50"
                >
                  <Check className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => { setShowNewViewInput(false); setNewViewName(""); setSaveAsShared(false); }}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setShowNewViewInput(true)}
                className="inline-flex h-8 items-center gap-1.5 rounded-full border border-dashed border-stone-300 px-3.5 text-xs text-stone-500 transition-colors hover:border-stone-400 hover:text-stone-700"
              >
                <Plus className="h-3 w-3" />
                Save View
              </button>
            )
          )}
        </div>
      )}

      {/* Toolbar */}
      {bulkActions && selectedIds.size > 0 ? (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-stone-700">
            {selectedIds.size} selected
          </span>
          <div className="h-5 w-px bg-stone-200" />
          {bulkActions.map((action, i) =>
            action.type === "select" ? (
              <DropdownMenu key={i}>
                <DropdownMenuTrigger asChild>
                  <button
                    disabled={bulkActionLoading}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-50 disabled:opacity-50"
                  >
                    {action.icon}
                    {action.label}
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {action.options.map(opt => (
                    <DropdownMenuItem
                      key={opt.value}
                      onClick={() => executeBulkSelectAction(action, opt.value)}
                    >
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                key={i}
                disabled={bulkActionLoading}
                onClick={() => executeBulkAction(action)}
                className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-medium transition-colors disabled:opacity-50 ${
                  action.variant === "destructive"
                    ? "border-red-200 bg-white text-red-600 hover:bg-red-50"
                    : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
                }`}
              >
                {action.icon}
                {action.label}
              </button>
            )
          )}
          <div className="h-5 w-px bg-stone-200" />
          <button
            onClick={clearSelection}
            className="inline-flex h-9 items-center gap-1 rounded-lg px-3 text-xs text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 flex-wrap">
          {searchKey && (
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="h-11 max-w-sm rounded-xl border-stone-200 px-4 text-sm shadow-none placeholder:text-stone-400"
            />
          )}

          {filterableColumns.length > 0 && (
            <button
              onClick={toggleFilters}
              className={`inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm transition-colors ${
                showFilters || activeFilterCount > 0
                  ? "border-stone-300 bg-stone-50 text-stone-900"
                  : "border-stone-200 text-stone-500 hover:text-stone-700 hover:border-stone-300"
              }`}
            >
              <ListFilter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-stone-900 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}

          {/* Export CSV */}
          <button
            onClick={openExportDialog}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-stone-200 px-4 text-sm text-stone-500 transition-colors hover:text-stone-700 hover:border-stone-300"
          >
            <Download className="h-4 w-4" />
            Export
          </button>

          {storageKey && (
            <div className="relative ml-auto">
              <button
                ref={btnRef}
                onClick={() => setShowColPicker(!showColPicker)}
                className={`inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm transition-colors ${
                  showColPicker
                    ? "border-stone-300 bg-stone-50 text-stone-900"
                    : "border-stone-200 text-stone-500 hover:text-stone-700 hover:border-stone-300"
                }`}
              >
                <Settings2 className="h-4 w-4" />
                Columns
                {hiddenCount > 0 && (
                  <span className="rounded-full bg-stone-900 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    {hiddenCount} hidden
                  </span>
                )}
              </button>

              {showColPicker && (
                <div
                  ref={pickerRef}
                  className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-stone-200 bg-white shadow-lg"
                >
                  <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
                    <span className="text-xs font-semibold text-stone-900">Arrange Columns</span>
                    <button
                      onClick={resetColumns}
                      className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Reset
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto py-1">
                    {colConfig.map((cfg, idx) => {
                      const col = colMap.get(cfg.key);
                      if (!col) return null;
                      return (
                        <div
                          key={cfg.key}
                          draggable
                          onDragStart={() => handleDragStart(idx)}
                          onDragEnter={() => handleDragEnter(idx)}
                          onDragEnd={handleDragEnd}
                          onDragOver={(e) => e.preventDefault()}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-stone-50 transition-colors cursor-grab active:cursor-grabbing"
                        >
                          <GripVertical className="h-3.5 w-3.5 text-stone-300 shrink-0" />
                          <span className={`flex-1 text-sm truncate ${cfg.visible ? "text-stone-700" : "text-stone-400"}`}>
                            {col.label}
                          </span>
                          <button
                            onClick={() => toggleVisibility(cfg.key)}
                            className={`shrink-0 p-1 rounded transition-colors ${
                              cfg.visible ? "text-stone-500 hover:text-stone-700" : "text-stone-300 hover:text-stone-500"
                            }`}
                          >
                            {cfg.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <div className="rounded-xl border border-stone-100 bg-stone-50/50 p-3 space-y-2">
          {conditions.map((cond, idx) => {
            const col = colMap.get(cond.field);
            const colType = col?.type ?? "text";
            const operators = getOperators(colType);
            const hideValue = NO_VALUE_OPERATORS.has(cond.operator);

            return (
              <div key={cond.id} className="flex items-center gap-2 flex-wrap">
                {/* Where / and|or label */}
                {idx === 0 ? (
                  <span className="w-14 text-xs font-medium text-stone-400 shrink-0 text-right">
                    Where
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConjunction((prev) => (prev === "and" ? "or" : "and"))}
                    className="w-14 text-xs font-medium shrink-0 text-right rounded px-1 py-0.5 transition-colors text-stone-500 hover:text-stone-700 hover:bg-stone-100"
                  >
                    {conjunction}
                  </button>
                )}

                {/* Field selector */}
                <Select value={cond.field} onValueChange={(v) => handleFieldChange(cond.id, v)}>
                  <SelectTrigger className="data-[size=default]:h-9 w-40 rounded-lg border-stone-200 bg-white px-3 text-xs shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {filterableColumns.map((fc) => (
                      <SelectItem key={fc.key} value={fc.key}>{fc.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Operator selector */}
                <Select value={cond.operator} onValueChange={(v) => handleOperatorChange(cond.id, v)}>
                  <SelectTrigger className="data-[size=default]:h-9 w-40 rounded-lg border-stone-200 bg-white px-3 text-xs shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {operators.map((op) => (
                      <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Value input — depends on column type */}
                {!hideValue && colType === "enum" && col?.filterOptions ? (
                  <Select value={cond.value || "__placeholder__"} onValueChange={(v) => handleValueChange(cond.id, v === "__placeholder__" ? "" : v)}>
                    <SelectTrigger className="data-[size=default]:h-9 w-40 rounded-lg border-stone-200 bg-white px-3 text-xs shadow-none">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__placeholder__" disabled>Select...</SelectItem>
                      {col.filterOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : !hideValue && colType === "number" ? (
                  <Input
                    type="number"
                    value={cond.value}
                    onChange={(e) => handleValueChange(cond.id, e.target.value)}
                    placeholder="Value..."
                    className="h-9 w-40 rounded-lg border-stone-200 bg-white px-3 text-xs shadow-none placeholder:text-stone-400"
                  />
                ) : !hideValue && colType === "date" ? (
                  <Input
                    type="date"
                    value={cond.value}
                    onChange={(e) => handleValueChange(cond.id, e.target.value)}
                    className="h-9 w-40 rounded-lg border-stone-200 bg-white px-3 text-xs shadow-none"
                  />
                ) : !hideValue ? (
                  <Input
                    type="text"
                    value={cond.value}
                    onChange={(e) => handleValueChange(cond.id, e.target.value)}
                    placeholder="Value..."
                    className="h-9 w-40 rounded-lg border-stone-200 bg-white px-3 text-xs shadow-none placeholder:text-stone-400"
                  />
                ) : null}

                {/* Remove button */}
                <button
                  onClick={() => removeCondition(cond.id)}
                  className="shrink-0 rounded-md p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}

          {/* Add filter + Clear all */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={addCondition}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-stone-500 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <Plus className="h-3 w-3" />
              Add filter
            </button>
            {conditions.length > 0 && (
              <button
                onClick={clearAllConditions}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-stone-500 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="h-3 w-3" />
                Clear all
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="rounded-2xl border border-stone-200 bg-white overflow-x-auto max-w-full scrollbar-thin">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="border-b border-stone-100">
              {bulkActions && (
                <th className="w-10 px-3 py-3.5">
                  <input
                    type="checkbox"
                    ref={(el) => {
                      if (el) {
                        const pageIds = paged.map(r => r.id as string).filter(Boolean);
                        const checkedCount = pageIds.filter(id => selectedIds.has(id)).length;
                        el.checked = pageIds.length > 0 && checkedCount === pageIds.length;
                        el.indeterminate = checkedCount > 0 && checkedCount < pageIds.length;
                      }
                    }}
                    onChange={toggleSelectAllPage}
                    className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-500 cursor-pointer"
                  />
                </th>
              )}
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-stone-400 cursor-pointer select-none hover:text-stone-600 transition-colors"
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key ? (
                      sortDir === "asc" ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )
                    ) : (
                      <ChevronsUpDown className="h-3 w-3 opacity-30" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + (bulkActions ? 1 : 0)} className="px-5 py-12 text-center text-stone-400">
                  No results found.
                </td>
              </tr>
            ) : (
              paged.map((row, i) => {
                const rowId = row.id as string;
                const isSelected = selectedIds.has(rowId);
                return (
                  <tr
                    key={rowId ?? i}
                    onClick={() => {
                      if (bulkActions && selectedIds.size > 0) {
                        toggleRowSelection(rowId);
                      } else {
                        onRowClick?.(row);
                      }
                    }}
                    className={`border-b border-stone-50 last:border-0 transition-colors ${
                      isSelected ? "bg-stone-50" : ""
                    } ${
                      onRowClick || bulkActions ? "cursor-pointer hover:bg-stone-50/70" : ""
                    }`}
                  >
                    {bulkActions && (
                      <td className="w-10 px-3 py-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRowSelection(rowId)}
                          className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-500 cursor-pointer"
                        />
                      </td>
                    )}
                    {visibleColumns.map((col) => (
                      <td key={col.key} className="px-5 py-4 text-stone-700 whitespace-nowrap">
                        {col.render ? col.render(row) : (row[col.key] as React.ReactNode) ?? "\u2014"}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-400">
              {page * pageSize + 1}&ndash;{Math.min((page + 1) * pageSize, filtered.length)} of{" "}
              {filtered.length}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-stone-400">Rows</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => { setPageSize(Number(v)); setPage(0); }}
              >
                <SelectTrigger className="data-[size=default]:h-8 w-16 rounded-lg border-stone-200 px-2 text-xs shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => setPage(page - 1)} disabled={page === 0} className="h-9 w-9 rounded-lg p-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = totalPages <= 5 ? i : Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className={`h-9 w-9 rounded-lg p-0 text-sm ${page === pageNum ? "bg-stone-900 text-white hover:bg-stone-800" : ""}`}
                  >
                    {pageNum + 1}
                  </Button>
                );
              })}
              <Button variant="ghost" size="sm" onClick={() => setPage(page + 1)} disabled={page >= totalPages - 1} className="h-9 w-9 rounded-lg p-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedIds.size} item{selectedIds.size !== 1 ? "s" : ""}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => { setShowDeleteConfirm(false); setPendingDeleteAction(null); }}
              disabled={bulkActionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteAction}
              disabled={bulkActionLoading}
            >
              {bulkActionLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export CSV</DialogTitle>
            <DialogDescription>
              {filtered.length} row{filtered.length !== 1 ? "s" : ""} will be exported. Choose a view or pick columns.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {/* View selector + quick toggles */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setExportColumnKeys(visibleColumns.map(c => c.key))}
                className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-medium transition-colors ${
                  exportColumnKeys.length > 0 &&
                  exportColumnKeys.length === visibleColumns.length &&
                  visibleColumns.every(c => exportColumnKeys.includes(c.key))
                    ? "bg-stone-900 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                Current view
              </button>
              <button
                type="button"
                onClick={() => setExportColumnKeys(columns.map(c => c.key))}
                className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-medium transition-colors ${
                  exportColumnKeys.length === columns.length
                    ? "bg-stone-900 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                All columns
              </button>
            </div>

            {/* Saved view pills */}
            {views.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-stone-400">Or export a saved view</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {views.map(v => {
                    const viewKeys = mergeColumnConfig(v.column_config)
                      .filter(c => c.visible)
                      .map(c => c.key);
                    const isSelected =
                      exportColumnKeys.length === viewKeys.length &&
                      viewKeys.every(k => exportColumnKeys.includes(k));
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setExportColumnKeys(viewKeys)}
                        className={`inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-[11px] font-medium transition-colors ${
                          isSelected
                            ? "bg-stone-900 text-white"
                            : v.is_shared
                              ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                              : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                        }`}
                      >
                        {v.is_shared && <Users className="h-2.5 w-2.5" />}
                        {v.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Column checklist */}
            <div className="max-h-52 overflow-y-auto rounded-lg border border-stone-200 py-1">
              {columns.map(col => (
                <label
                  key={col.key}
                  className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-stone-50"
                >
                  <input
                    type="checkbox"
                    checked={exportColumnKeys.includes(col.key)}
                    onChange={() => toggleExportColumn(col.key)}
                    className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-500"
                  />
                  <span className={exportColumnKeys.includes(col.key) ? "text-stone-700" : "text-stone-400"}>
                    {col.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowExportDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExportCSV}
              disabled={exportColumnKeys.length === 0}
              className="bg-stone-900 text-white hover:bg-stone-800"
            >
              <Download className="mr-1.5 h-4 w-4" />
              Export {exportColumnKeys.length} column{exportColumnKeys.length !== 1 ? "s" : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
