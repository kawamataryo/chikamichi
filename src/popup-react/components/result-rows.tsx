import { memo } from "react";
import { ArrowUpRight, GripVertical, Pin, PinOff } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { t } from "~/i18n";
import { highlightText } from "~/popup-react/utils";
import type { ActionItem } from "~/popup-react/types";

// oxlint-disable-next-line prefer-arrow-callback
export const SearchResultRow = memo(function SearchResultRow({
  dragOverFavoriteIndex,
  draggedFavoriteIndex,
  favoriteReorderEnabled,
  handlePointerSelection,
  index,
  item,
  onDragStateChange,
  onOpen,
  onReorder,
  rowRef,
  onToggleFavorite,
  selected,
}: {
  dragOverFavoriteIndex: number | null;
  draggedFavoriteIndex: number | null;
  favoriteReorderEnabled: boolean;
  handlePointerSelection: (index: number, clientX: number, clientY: number) => void;
  index: number;
  item: SearchResult;
  onDragStateChange: (draggedIndex: number | null, dragOverIndex: number | null) => void;
  onOpen: (item: SearchResult) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  rowRef?: (element: HTMLDivElement | null) => void;
  onToggleFavorite: (item: SearchResult) => void;
  selected: boolean;
}) {
  return (
    <div
      aria-selected={selected}
      className={cn(
        "group grid cursor-pointer items-center gap-2.5 rounded-row px-3 py-2",
        favoriteReorderEnabled
          ? "grid-cols-[auto_18px_minmax(0,1fr)_auto_auto]"
          : "grid-cols-[18px_minmax(0,1fr)_auto_auto]",
        selected ? "interactive-row-selected" : "interactive-row",
        draggedFavoriteIndex === index ? "opacity-55" : "",
        dragOverFavoriteIndex === index ? "shadow-[inset_0_0_0_1px_rgba(90,145,255,0.26)]" : "",
      )}
      data-cy={`search-result-${index}`}
      data-selected={selected}
      draggable={false}
      ref={rowRef}
      role="button"
      tabIndex={0}
      onClick={() => {
        onOpen(item);
      }}
      onDragLeave={() => {
        if (dragOverFavoriteIndex === index) {
          onDragStateChange(draggedFavoriteIndex, null);
        }
      }}
      onDragOver={(event) => {
        if (!favoriteReorderEnabled || draggedFavoriteIndex === null) {
          return;
        }
        event.preventDefault();
        if (dragOverFavoriteIndex !== index) {
          onDragStateChange(draggedFavoriteIndex, index);
        }
      }}
      onDrop={(event) => {
        if (!favoriteReorderEnabled || draggedFavoriteIndex === null) {
          return;
        }
        event.preventDefault();
        onDragStateChange(null, null);
        onReorder(draggedFavoriteIndex, index);
      }}
      onMouseMove={(event) => {
        handlePointerSelection(index, event.clientX, event.clientY);
      }}
    >
      {favoriteReorderEnabled ? (
        <button
          aria-label={t("favoriteDragHandle")}
          className={cn(
            "flex size-6 cursor-grab items-center justify-center rounded-md text-foreground/34 opacity-0 transition-opacity group-hover:opacity-100",
            selected ? "opacity-100 text-primary/70" : "",
          )}
          data-cy={`favorite-drag-handle-${index}`}
          draggable
          type="button"
          onClick={(event) => {
            event.stopPropagation();
          }}
          onDragEnd={() => {
            onDragStateChange(null, null);
          }}
          onDragStart={(event) => {
            event.stopPropagation();
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", String(index));
            onDragStateChange(index, index);
          }}
        >
          <GripVertical className="size-3.5" />
        </button>
      ) : null}
      <img alt="" className="size-[18px] rounded-sm" height="18" src={item.faviconUrl} width="18" />
      <div className="min-w-0">
        <div className="text-body truncate font-medium">
          {highlightText(item.title, item.matchedWord)}
        </div>
        <div className="text-caption truncate text-foreground/58 dark:text-muted-foreground">
          {item.url}
        </div>
      </div>
      <div className="text-caption flex min-w-0 flex-col items-end gap-0.5 text-muted-foreground">
        <Badge className="capitalize" data-cy={`search-result-type-${index}`} variant="secondary">
          {item.type}
        </Badge>
        {item.folderName ? <span className="max-w-28 truncate">{item.folderName}</span> : null}
      </div>
      <button
        aria-label={item.isFavorite ? t("badgeRemoveFavorite") : t("badgeAddFavorite")}
        className={cn(
          "flex size-7 items-center justify-center rounded-lg border",
          item.isFavorite
            ? "border-primary/18 bg-primary/10 text-primary/82 dark:text-primary/88"
            : "border-transparent bg-control-surface/[0.88] text-foreground/52 dark:bg-control-surface/[0.52] dark:text-muted-foreground",
        )}
        data-cy={`search-result-favorite-${index}`}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onToggleFavorite(item);
        }}
      >
        {item.isFavorite ? (
          <Pin className="size-3.5 fill-current" />
        ) : (
          <PinOff className="size-3.5" />
        )}
      </button>
    </div>
  );
});

// oxlint-disable-next-line prefer-arrow-callback
export const ActionResultRow = memo(function ActionResultRow({
  description,
  icon: Icon,
  id,
  index,
  item,
  onPointerSelection,
  onRunItem,
  rowRef,
  selected,
  title,
}: {
  description: string;
  icon: ActionItem["icon"];
  id: string;
  index: number;
  item: ActionItem;
  onPointerSelection: (index: number, clientX: number, clientY: number) => void;
  onRunItem: (item: ActionItem) => void;
  rowRef?: (element: HTMLButtonElement | null) => void;
  selected: boolean;
  title: string;
}) {
  return (
    <button
      aria-selected={selected}
      className={cn(
        "grid w-full cursor-pointer grid-cols-[18px_minmax(0,1fr)_auto] items-center gap-2.5 rounded-row px-3 py-2 text-left",
        selected ? "interactive-row-selected-subtle" : "interactive-row",
      )}
      data-cy={`action-result-${index}`}
      data-selected={selected}
      key={id}
      ref={rowRef}
      type="button"
      onClick={() => {
        onRunItem(item);
      }}
      onMouseMove={(event) => {
        onPointerSelection(index, event.clientX, event.clientY);
      }}
    >
      <div className="flex size-[18px] items-center justify-center text-primary/88">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <div className="text-body truncate font-medium">{title}</div>
        <div className="text-meta truncate text-foreground/58 dark:text-muted-foreground">
          {description}
        </div>
      </div>
      <ArrowUpRight className="size-4 text-muted-foreground" />
    </button>
  );
});
