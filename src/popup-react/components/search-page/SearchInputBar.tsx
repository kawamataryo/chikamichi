import { Search } from "lucide-react";
import type { KeyboardEvent, RefObject } from "react";
import { Input } from "~/components/ui/input";
import { t } from "~/i18n";
import { reportError } from "~/popup-react/utils";

type SearchInputBarProps = {
  actionMode: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  searchWord: string;
  setSearchWord: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => Promise<void>;
};

export function SearchInputBar({
  actionMode,
  inputRef,
  searchWord,
  setSearchWord,
  onKeyDown,
}: SearchInputBarProps) {
  return (
    <div className="search-surface flex h-12 shrink-0 items-center gap-3 px-4">
      <Search className="size-5 shrink-0 text-primary" />
      <Input
        autoComplete="off"
        className="h-full border-0 bg-transparent px-0 text-base text-foreground/[0.92] shadow-none focus-visible:ring-0 dark:text-white"
        data-cy="search-input"
        placeholder={actionMode ? t("actionModePlaceholder") : t("placeholderSearch")}
        ref={inputRef}
        type="search"
        value={searchWord}
        onChange={(event) => {
          setSearchWord(event.target.value);
        }}
        onKeyDown={(event) => {
          onKeyDown(event).catch(reportError);
        }}
      />
    </div>
  );
}
