import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    setupNodeEvents(on, config) {
      return config;
    },

    watchForFileChanges: true,

    specPattern: "cypress/e2e/**/*.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.ts",
    fixturesFolder: "cypress/fixtures",
    videosFolder: "cypress/videos",
    screenshotsFolder: "cypress/screenshots",
  },
});
