import { type ReactNode } from "react";
import { type Search } from "lucide-react";
import { Button } from "~/components/ui/button";
import { PAGES } from "~/constants";
import { cn } from "~/lib/utils";
import { getPageMeta } from "~/popup-react/utils";

function SectionHeading({ description, title }: { description: string; title: string }) {
  return (
    <div className="space-y-1">
      <h2 className="text-section-title font-semibold tracking-tight text-foreground/[0.96]">
        {title}
      </h2>
      <p className="text-meta leading-5 text-foreground/[0.58] dark:text-muted-foreground/[0.88]">
        {description}
      </p>
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-border-control/[0.45] bg-control-surface/[0.88] px-2 text-caption font-medium text-foreground/[0.56] dark:border-border-control/[0.26] dark:bg-control-surface/[0.6] dark:text-muted-foreground">
      {children}
    </span>
  );
}

function SideMenuButton({
  icon: Icon,
  active,
  dataCy,
  onClick,
}: {
  active?: boolean;
  dataCy?: string;
  icon: typeof Search;
  onClick: () => void;
}) {
  return (
    <Button
      className={cn(
        "size-10 rounded-panel border p-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.015)] transition-colors",
        "border-border-control/[0.45] bg-control-surface/[0.72] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] dark:border-border-control/[0.26] dark:bg-control-surface/[0.44] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.015)]",
        active
          ? "bg-primary/[0.12] text-foreground dark:bg-primary/[0.1]"
          : "text-foreground hover:bg-slate-200/[0.72] dark:hover:bg-muted/[0.56]",
      )}
      data-cy={dataCy}
      type="button"
      variant="ghost"
      onClick={onClick}
    >
      <span
        className={cn(
          "flex size-full items-center justify-center rounded-control",
          active
            ? "bg-primary/[0.1] text-primary dark:bg-primary/[0.08]"
            : "bg-transparent text-foreground/[0.72] dark:text-foreground/[0.88]",
        )}
      >
        <Icon className="size-4" />
      </span>
    </Button>
  );
}

export function PageMenuButton({
  currentPage,
  page,
  setCurrentPage,
}: {
  currentPage: ValueOf<typeof PAGES>;
  page: ValueOf<typeof PAGES>;
  setCurrentPage: (page: ValueOf<typeof PAGES>) => void;
}) {
  const { icon: Icon } = getPageMeta(page);

  return (
    <SideMenuButton
      active={currentPage === page}
      dataCy={`${page}-tab-btn`}
      icon={Icon}
      onClick={() => {
        setCurrentPage(page);
      }}
    />
  );
}

export function PageShell({
  children,
  dataCy,
  description,
  title,
}: {
  children: ReactNode;
  dataCy: string;
  description: string;
  title: string;
}) {
  return (
    <section className="flex h-full min-h-0 flex-col gap-3.5 overflow-hidden" data-cy={dataCy}>
      <SectionHeading description={description} title={title} />
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
    </section>
  );
}

export function FlatSection({
  children,
  className,
  description,
  title,
}: {
  children: ReactNode;
  className?: string;
  description?: string;
  title: string;
}) {
  return (
    <section className={cn("space-y-3 rounded-panel bg-card/[0.1] p-0", className)}>
      <div className="px-0.5 py-0.5">
        <div className="space-y-1">
          <h3 className="text-body-sm font-semibold tracking-tight text-foreground/[0.95]">
            {title}
          </h3>
          {description ? (
            <p className="text-meta leading-5 text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      <div>{children}</div>
    </section>
  );
}

export function SettingToggleButton({
  active,
  children,
  ...props
}: React.ComponentProps<typeof Button> & {
  active: boolean;
}) {
  return (
    <Button
      className={cn(
        "h-9 justify-start rounded-control border px-3 text-body-sm transition-colors",
        active
          ? "border-primary/[0.25] bg-primary/[0.1] text-foreground"
          : "control-surface text-foreground",
      )}
      variant="ghost"
      {...props}
    >
      {children}
    </Button>
  );
}

export function SettingRow({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <div className="grid grid-cols-[156px_minmax(0,1fr)] items-start gap-4 border-b border-border-divider/[0.12] py-3 last:border-b-0 last:pb-0 first:pt-0 dark:border-border-divider/[0.2]">
      <div className="space-y-1">
        <h3 className="text-body-sm font-semibold tracking-tight text-foreground/[0.95]">
          {title}
        </h3>
        {description ? (
          <p className="text-meta leading-5 text-foreground/[0.6] dark:text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <div>{children}</div>
    </div>
  );
}
