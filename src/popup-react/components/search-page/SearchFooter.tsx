import { Check } from "lucide-react";
import { Kbd } from "~/popup-react/components/common";
import { t } from "~/i18n";
import { cn } from "~/lib/utils";

type SearchFooterProps = {
  badgeText: string;
  badgeVisible: boolean;
  openLinkInCurrentTab: boolean;
};

export function SearchFooter({ badgeText, badgeVisible, openLinkInCurrentTab }: SearchFooterProps) {
  return (
    <div className="text-caption flex h-10 shrink-0 items-center gap-2 px-0 pb-0 text-foreground/56 dark:text-muted-foreground">
      <Kbd>↑ ↓</Kbd>
      <span>{t("footerSelect")}</span>
      <Kbd>↵</Kbd>
      <span>{t("footerOpen")}</span>
      <Kbd>Ctrl ↵</Kbd>
      <span>{t(openLinkInCurrentTab ? "footerOpenNewTab" : "footerOpenCurrentTab")}</span>
      <Kbd>esc</Kbd>
      <span>{t("footerClose")}</span>
      <div className="ml-auto flex min-w-0 justify-end">
        <div
          className={cn(
            "text-caption inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary px-2.5 py-1 font-semibold text-primary-foreground shadow-[0_8px_18px_rgba(42,91,199,0.2),inset_0_1px_0_rgba(255,255,255,0.18)] transition-all duration-200 ease-out dark:border-primary/35 dark:shadow-[0_10px_24px_rgba(10,18,35,0.36),inset_0_1px_0_rgba(255,255,255,0.28)]",
            badgeVisible
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-1 opacity-0",
          )}
          data-cy="action-feedback"
        >
          <Check className="size-3.5" />
          <span>{badgeText}</span>
        </div>
      </div>
    </div>
  );
}
