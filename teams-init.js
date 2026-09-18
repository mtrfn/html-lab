// HTML Lab V2 — inițializare Microsoft Teams
// Aplicația continuă să funcționeze și într-un browser obișnuit.
(async function () {
  const badge = document.querySelector(".badge");

  try {
    if (window.microsoftTeams && microsoftTeams.app) {
      await microsoftTeams.app.initialize();

      const context = await microsoftTeams.app.getContext();
      document.documentElement.dataset.teamsHost = context.app?.host?.name || "Teams";

      if (badge) {
        badge.textContent = "Teams";
        badge.title = "HTML Lab rulează în Microsoft Teams";
      }

      // Respectă tema Teams când este disponibilă.
      const applyTheme = (theme) => {
        document.documentElement.dataset.teamsTheme = theme || "default";
      };
      applyTheme(context.app?.theme);
      microsoftTeams.app.registerOnThemeChangeHandler(applyTheme);
    }
  } catch (error) {
    // În browser normal, TeamsJS poate să nu aibă un host Teams.
    console.info("HTML Lab rulează în modul browser.", error);
    if (badge) badge.textContent = "Web";
  }
})();
