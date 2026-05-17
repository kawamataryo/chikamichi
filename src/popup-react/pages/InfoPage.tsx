import { ArrowUpRight } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { t } from "~/i18n";
import { FlatSection, Kbd, PageShell } from "~/popup-react/components/common";

export function InfoPage({
  onOpenIssue,
  openLinkInCurrentTab,
}: {
  onOpenIssue: () => void;
  openLinkInCurrentTab: boolean;
}) {
  return (
    <PageShell dataCy="page-info" description={t("infoDescription")} title={t("infoTitle")}>
      <div className="space-y-4">
        <FlatSection title={t("quickReferenceTitle")}>
          <div className="panel-surface space-y-0 px-3.5 py-2.5">
            <div className="grid grid-cols-[132px_minmax(0,1fr)] items-start gap-3 border-b border-border-divider/[0.1] py-2.5 first:pt-0 dark:border-border-divider/[0.18]">
              <div className="text-meta text-muted-foreground">{t("labelSearchTargets")}</div>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary">{t("searchTargetTabs")}</Badge>
                <Badge variant="secondary">{t("searchTargetBookmarks")}</Badge>
                <Badge variant="secondary">{t("searchTargetHistory")}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-[132px_minmax(0,1fr)] items-start gap-3 border-b border-border-divider/[0.1] py-2.5 dark:border-border-divider/[0.18]">
              <div className="text-meta text-muted-foreground">{t("labelMoveSelection")}</div>
              <div className="text-body-sm flex flex-wrap items-center gap-2 text-foreground">
                <Kbd>↑ ↓</Kbd>
                <span>{t("shortcutsMoveSelection")}</span>
              </div>
            </div>
            <div className="grid grid-cols-[132px_minmax(0,1fr)] items-start gap-3 border-b border-border-divider/[0.1] py-2.5 dark:border-border-divider/[0.18]">
              <div className="text-meta text-muted-foreground">{t("labelOpenPopup")}</div>
              <div className="text-body-sm flex flex-wrap items-center gap-2 text-foreground">
                <Kbd>⌘ K</Kbd>
                <span>{t("shortcutOpenPopup")}</span>
              </div>
            </div>
            <div className="grid grid-cols-[132px_minmax(0,1fr)] items-start gap-3 border-b border-border-divider/[0.1] py-2.5 dark:border-border-divider/[0.18]">
              <div className="text-meta text-muted-foreground">{t("altOpen")}</div>
              <div className="text-body-sm flex flex-wrap items-center gap-2 text-foreground">
                <Kbd>⌘ ↵</Kbd>
                <span>
                  {t(
                    "labelAlternativeOpen",
                    openLinkInCurrentTab ? t("labelCurrentTab") : t("labelNewTab"),
                  )}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-[132px_minmax(0,1fr)] items-start gap-3 border-b border-border-divider/[0.1] py-2.5 dark:border-border-divider/[0.18]">
              <div className="text-meta text-muted-foreground">{t("actionModeShortcutTitle")}</div>
              <div className="text-body-sm flex flex-wrap items-center gap-2 text-foreground">
                <Kbd>&gt;</Kbd>
                <span>{t("actionModeShortcutBody")}</span>
              </div>
            </div>
            <div className="grid grid-cols-[132px_minmax(0,1fr)] items-start gap-3 pt-2.5">
              <div className="text-meta text-muted-foreground">{t("labelUtilities")}</div>
              <div className="text-body-sm flex flex-wrap items-center gap-2 text-foreground">
                <Kbd>⌘ D</Kbd>
                <span>{t("shortcutUtilities")}</span>
              </div>
            </div>
          </div>
        </FlatSection>
        <FlatSection
          className="space-y-3"
          description={t("feedbackDescription")}
          title={t("feedbackTitle")}
        >
          <div className="flex items-center justify-between gap-4 rounded-panel border border-border-subtle/[0.1] bg-background/10 px-3.5 py-3 dark:border-border-subtle/[0.18]">
            <div className="text-meta leading-5 text-foreground/[0.6] dark:text-muted-foreground">
              {t("feedbackBody")}
            </div>
            <Button
              className="h-9 shrink-0 rounded-control border border-border-control/[0.18] bg-primary/[0.12] px-3 text-sm hover:bg-primary/[0.16] dark:border-border-control/[0.24]"
              type="button"
              variant="ghost"
              onClick={onOpenIssue}
            >
              <ArrowUpRight className="size-4" />
              {t("buttonOpenIssue")}
            </Button>
          </div>
        </FlatSection>
      </div>
    </PageShell>
  );
}
