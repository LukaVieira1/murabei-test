/// <reference types="cypress" />

describe("Search and Filters", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get('[data-testid="book-card"]', { timeout: 10000 }).should("exist");
    cy.get("main").should("be.visible");
  });

  describe("Search functionality", () => {
    it("should search for books by title", () => {
      const searchTerm = "JavaScript";

      cy.get('input[placeholder*="Search"]').clear().type(searchTerm);

      cy.wait(1000);
      cy.get('[data-testid="book-card"]', { timeout: 10000 }).should("exist");

      cy.url().should("include", `title=${searchTerm}`);

      cy.get('[data-testid="book-card"]').should("have.length.at.least", 1);
      cy.get('[data-testid="book-title"]')
        .first()
        .should("contain.text", searchTerm);

      cy.get('[data-testid="books-count"]').should("contain", "book");
    });

    it("should clear the search", () => {
      cy.get('input[placeholder*="Search"]').clear().type("JavaScript");
      cy.wait(1000);
      cy.get('[data-testid="book-card"]', { timeout: 10000 }).should("exist");

      cy.get('input[placeholder*="Search"]').clear();
      cy.wait(1000);

      cy.get('[data-testid="book-card"]', { timeout: 10000 }).should("exist");

      cy.url().should("not.include", "title=");

      cy.get('[data-testid="book-card"]').should("have.length", 6);
    });

    it("should handle search without results", () => {
      const invalidSearch = "not-a-book";

      cy.get('input[placeholder*="Search"]').clear().type(invalidSearch);

      cy.wait(1000);

      cy.contains("No results found").should("be.visible");
      cy.get('[data-testid="books-count"]').should(
        "contain",
        "No results found"
      );
    });

    it("should maintain search state when reloading the page", () => {
      const searchTerm = "Clean";

      cy.get('input[placeholder*="Search"]').clear().type(searchTerm);
      cy.wait(1000);
      cy.get('[data-testid="book-card"]', { timeout: 10000 }).should("exist");

      cy.reload();

      cy.get('[data-testid="book-card"]', { timeout: 10000 }).should("exist");

      cy.get('input[placeholder*="Search"]').should("have.value", searchTerm);

      cy.url().should("include", `title=${searchTerm}`);
    });
  });

  describe("Filters functionality", () => {
    beforeEach(() => {
      cy.get("button").contains("Filters").click();
      cy.get('[data-testid="filters-sidebar"]').should("be.visible");
    });

    it("should open and close the filters sidebar", () => {
      cy.get('[data-testid="filters-sidebar"]').should("be.visible");

      cy.get('[data-testid="close-filters"]').click();
      cy.get('[data-testid="filters-sidebar"]').should("not.be.visible");
    });

    it("should close filters with ESC key", () => {
      cy.get('[data-testid="filters-sidebar"]').should("be.visible");

      cy.get("body").type("{esc}");
      cy.get('[data-testid="filters-sidebar"]').should("not.be.visible");
    });

    it("should filter by author", () => {
      const author = "Robert C. Martin";

      cy.get('input[name="author"]').clear().type(author, { force: true });

      cy.get('[data-testid="apply-filters"]').click();

      cy.get('[data-testid="book-card"]', { timeout: 10000 }).should("exist");

      cy.url().should(
        "satisfy",
        (url) =>
          url.includes("author=Robert+C.+Martin") ||
          url.includes("author=Robert%20C.%20Martin")
      );

      cy.get('[data-testid="filters-sidebar"]').should("not.be.visible");

      cy.get('[data-testid="book-card"]').should("have.length", 2);
      cy.contains("Robert C. Martin").should("be.visible");
    });

    it("should filter by publisher", () => {
      const publisher = "O'Reilly Media";

      cy.get('input[name="publisher"]')
        .clear()
        .type(publisher, { force: true });
      cy.get('[data-testid="apply-filters"]').click();

      cy.get('[data-testid="book-card"]', { timeout: 10000 }).should("exist");
      cy.url().should(
        "satisfy",
        (url) =>
          url.includes("publisher=O%27Reilly+Media") ||
          url.includes("publisher=O'Reilly%20Media")
      );

      cy.get('[data-testid="book-card"]').should("have.length", 2);
      cy.contains("O'Reilly Media").should("be.visible");
    });

    it("should filter by page range", () => {
      const minPages = "200";
      const maxPages = "500";

      cy.get('input[name="pages_min"]').clear().type(minPages, { force: true });
      cy.get('input[name="pages_max"]').clear().type(maxPages, { force: true });

      cy.get('[data-testid="apply-filters"]').click();

      cy.get('[data-testid="book-card"]', { timeout: 10000 }).should("exist");
      cy.url().should("include", `pages_min=${minPages}`);
      cy.url().should("include", `pages_max=${maxPages}`);

      cy.get('[data-testid="book-card"]').should("have.length.at.least", 1);
    });

    it("should apply multiple filters simultaneously", () => {
      const author = "Robert C. Martin";

      cy.get('input[name="author"]').clear().type(author, { force: true });
      cy.get('input[name="pages_min"]').clear().type("400", { force: true });

      cy.get('[data-testid="apply-filters"]').click();

      cy.get('[data-testid="book-card"]', { timeout: 10000 }).should("exist");

      cy.url().should(
        "satisfy",
        (url) =>
          url.includes("author=Robert+C.+Martin") ||
          url.includes("author=Robert%20C.%20Martin")
      );
      cy.url().should("include", "pages_min=400");

      cy.get('[data-testid="book-card"]').should("have.length", 1);
      cy.contains("Robert C. Martin").should("be.visible");
      cy.contains("464").should("be.visible");
    });

    it("should clear all filters", () => {
      cy.get('input[name="author"]')
        .clear()
        .type("Robert C. Martin", { force: true });
      cy.get('[data-testid="apply-filters"]').click();

      cy.get('[data-testid="book-card"]', { timeout: 10000 }).should("exist");

      cy.get("button").contains("Filters").click();

      cy.get('[data-testid="clear-filters"]').click();

      cy.get('[data-testid="apply-filters"]').click();

      cy.get('[data-testid="book-card"]', { timeout: 10000 }).should("exist");

      cy.url().should("not.include", "author=");

      cy.get('[data-testid="book-card"]').should("have.length", 6);
    });
  });

  describe("Integration Search and Filters", () => {
    it("should combine search with filters", () => {
      const searchTerm = "JavaScript";
      const author = "Douglas Crockford";

      cy.get('input[placeholder*="Search"]').clear().type(searchTerm);
      cy.wait(1000);
      cy.get('[data-testid="book-card"]', { timeout: 10000 }).should("exist");

      cy.get("button").contains("Filters").click();
      cy.get('input[name="author"]').clear().type(author, { force: true });
      cy.get('[data-testid="apply-filters"]').click();

      cy.get('[data-testid="book-card"]', { timeout: 10000 }).should("exist");

      cy.url().should("include", `title=${searchTerm}`);
      cy.url().should(
        "satisfy",
        (url) =>
          url.includes("author=Douglas+Crockford") ||
          url.includes("author=Douglas%20Crockford")
      );

      cy.get('[data-testid="book-card"]').should("have.length", 1);
      cy.contains("JavaScript: The Good Parts").should("be.visible");
      cy.contains("Douglas Crockford").should("be.visible");
    });

    it("should clear search and filters independently", () => {
      cy.get('input[placeholder*="Search"]').clear().type("Clean");
      cy.wait(1000);
      cy.get('[data-testid="book-card"]', { timeout: 10000 }).should("exist");

      cy.get("button").contains("Filters").click();
      cy.get('input[name="author"]')
        .clear()
        .type("Robert C. Martin", { force: true });
      cy.get('[data-testid="apply-filters"]').click();

      cy.get('[data-testid="book-card"]', { timeout: 10000 }).should("exist");

      cy.get('input[placeholder*="Search"]').clear();
      cy.wait(1000);

      cy.get('[data-testid="book-card"]', { timeout: 10000 }).should("exist");

      cy.url().should("not.include", "title=");
      cy.url().should(
        "satisfy",
        (url) =>
          url.includes("author=Robert+C.+Martin") ||
          url.includes("author=Robert%20C.%20Martin")
      );

      cy.get('[data-testid="book-card"]').should("have.length", 2);
    });
  });
});
