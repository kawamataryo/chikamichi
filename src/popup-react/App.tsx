import { sendToBackground } from "@plasmohq/messaging";
import { useEffect, useState } from "react";
import { PAGES, THEME } from "~/constants";
import {
  type AppSettings,
  DEFAULT_SETTINGS,
  getSettings,
  subscribeSettings,
  updateSettings,
} from "~/core/storage";
import { AppSidebar } from "~/popup-react/components/app/AppSidebar";
import { InfoPage } from "~/popup-react/pages/InfoPage";
import { SearchPage } from "~/popup-react/pages/SearchPage";
import { SettingPage } from "~/popup-react/pages/SettingPage";
import { getResolvedTheme, reportError } from "~/popup-react/utils";

function App() {
  const [currentPage, setCurrentPage] = useState<ValueOf<typeof PAGES>>(PAGES.SEARCH);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const saveSettings = async (partial: Partial<AppSettings>) => {
    setSettings((current) => ({
      ...current,
      ...partial,
    }));
    await updateSettings(partial);
  };

  useEffect(() => {
    getSettings().then(setSettings).catch(reportError);
    return subscribeSettings(setSettings);
  }, []);

  useEffect(() => {
    const applyTheme = () => {
      document.body.classList.toggle("dark", getResolvedTheme(settings.theme) === THEME.DARK);
    };

    applyTheme();

    if (settings.theme !== THEME.AUTO) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", applyTheme);

    return () => {
      mediaQuery.removeEventListener("change", applyTheme);
    };
  }, [settings.theme]);

  return (
    <main className="popup-window h-[500px] w-[760px] overflow-hidden p-1">
      <div className="grid h-full grid-cols-[minmax(0,1fr)_62px] gap-0">
        <div className="popup-content flex h-full min-w-0 flex-col overflow-hidden p-2.5">
          {currentPage === PAGES.SEARCH ? (
            <SearchPage onUpdateSettings={saveSettings} settings={settings} />
          ) : null}
          {currentPage === PAGES.INFO ? (
            <InfoPage
              onOpenIssue={() => {
                sendToBackground({
                  body: {
                    url: "https://github.com/kawamataryo/chikamichi/issues/new",
                  },
                  name: "open-new-tab-page",
                }).catch(reportError);
              }}
              openLinkInCurrentTab={settings.openLinkInCurrentTab}
            />
          ) : null}
          {currentPage === PAGES.SETTING ? (
            <SettingPage onUpdateSettings={saveSettings} settings={settings} />
          ) : null}
        </div>
        <AppSidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      </div>
    </main>
  );
}

export default App;
