import "./commands";

Cypress.on("uncaught:exception", (err) => {
  if (err.message.includes("ResizeObserver loop limit exceeded")) {
    return false;
  }
  if (err.message.includes("Non-Error promise rejection captured")) {
    return false;
  }
  return true;
});
