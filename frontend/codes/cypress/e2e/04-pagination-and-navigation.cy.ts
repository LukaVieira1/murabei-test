/// <reference types="cypress" />

describe("Pagination and Navigation", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get('[data-testid="book-card"]', { timeout: 10000 }).should("exist");
    cy.get("main").should("be.visible");
  });

  describe("Pagination and Navigation", () => {
    it("should not show pagination controls with only 6 books", () => {
      cy.get('[data-testid="pagination"]').should("not.exist");
    });

    it("should show all books on a single page", () => {
      cy.get('[data-testid="book-card"]').should("have.length", 6);

      cy.get('[data-testid="pagination"]').should("not.exist");

      cy.get('[data-testid="books-count"]').should("contain", "6 books found");
    });
  });

  describe("Navigation with Filters", () => {
    it("should keep filters in URL when applying search", () => {
      cy.get('input[placeholder*="Search"]').type("Clean");

      cy.wait(1000);
      cy.get('[data-testid="book-card"]', { timeout: 10000 }).should("exist");

      cy.url().should("include", "title=Clean");

      cy.get('[data-testid="book-card"]').should("have.length.at.least", 1);
      cy.contains("Clean Code").should("be.visible");
    });

    it("should clear filters and show all books", () => {
      cy.get('input[placeholder*="Search"]').type("Clean");
      cy.wait(1000);
      cy.get('[data-testid="book-card"]', { timeout: 10000 }).should("exist");

      cy.get('input[placeholder*="Search"]').clear();
      cy.wait(1000);
      cy.get('[data-testid="book-card"]', { timeout: 10000 }).should("exist");

      cy.get('[data-testid="book-card"]').should("have.length", 6);
    });

    it("should apply advanced filters", () => {
      cy.get("button").contains("Filters").click();
      cy.get('[data-testid="filters-sidebar"]').should("be.visible");

      cy.get('input[name="author"]').type("Robert C. Martin", { force: true });
      cy.get('[data-testid="apply-filters"]').click();

      cy.get('[data-testid="book-card"]', { timeout: 10000 }).should("exist");

      cy.url().should(
        "satisfy",
        (url) =>
          url.includes("author=Robert+C.+Martin") ||
          url.includes("author=Robert%20C.%20Martin")
      );

      cy.get('[data-testid="book-card"]').should("have.length.at.least", 1);
      cy.contains("Clean Code").should("be.visible");
    });
  });

  describe("Responsive Navigation", () => {
    it("should maintain responsive layout on mobile", () => {
      cy.viewport(375, 667);

      cy.get('[data-testid="book-card"]').should("have.length", 6);

      cy.get("main").should("be.visible");
      cy.get('[data-testid="books-count"]').should("be.visible");
    });

    it("should maintain functionality on tablets", () => {
      cy.viewport(768, 1024);

      cy.get('[data-testid="book-card"]').should("have.length", 6);

      cy.get('input[placeholder*="Search"]').should("be.visible");
      cy.get("button").contains("Filters").should("be.visible");
    });
  });

  describe("Loading States", () => {
    it("should show books after initial loading", () => {
      cy.get('[data-testid="book-card"]', { timeout: 10000 }).should("exist");
      cy.get('[data-testid="book-card"]').should("have.length", 6);

      cy.get('[data-testid="loading-spinner"]').should("not.exist");
    });

    it("should maintain state during filter application", () => {
      cy.get('input[placeholder*="Search"]').type("JavaScript");
      cy.wait(1000);
      cy.get('[data-testid="book-card"]', { timeout: 10000 }).should("exist");

      cy.contains("JavaScript: The Good Parts").should("be.visible");

      cy.get('input[placeholder*="Search"]').should("have.value", "JavaScript");
    });
  });

  describe("Edge Cases", () => {
    it("should handle search without results", () => {
      cy.get('input[placeholder*="Search"]').type("NonExistentBook12345");
      cy.wait(1000);
      cy.get('[data-testid="book-card"]', { timeout: 10000 }).should(
        "not.exist"
      );

      cy.contains("No books found").should("be.visible");
    });

    it("should preserve state when using browser back button", () => {
      cy.get('input[placeholder*="Search"]').type("Clean");
      cy.wait(1000);
      cy.get('[data-testid="book-card"]', { timeout: 10000 }).should("exist");

      cy.get('[data-testid="book-card"]')
        .first()
        .within(() => {
          cy.get("button").contains("View Details").click();
        });

      cy.get("body").type("{esc}");

      cy.get('input[placeholder*="Search"]').should("have.value", "Clean");
      cy.url().should("include", "title=Clean");
    });

    it("should handle invalid URL parameters", () => {
      cy.visit("/?page=999&invalid=param");

      cy.get('[data-testid="book-card"]', { timeout: 10000 }).should("exist");
      cy.get('[data-testid="book-card"]').should("have.length", 6);
    });
  });
});
