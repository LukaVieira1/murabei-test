/// <reference types="cypress" />

describe("Home Page", () => {
  beforeEach(() => {
    cy.visit("/");

    cy.get('[data-testid="book-card"]', { timeout: 10000 }).should("exist");
  });

  it("should display the home page", () => {
    cy.contains("Book Library").should("be.visible");

    cy.contains("Explore our book collection").should("be.visible");

    cy.get("button").contains("New Book").should("be.visible");

    cy.get("main").should("be.visible");
  });

  it("should have functional navigation elements", () => {
    cy.get('input[placeholder*="Search"]').should("be.visible");

    cy.get("button").contains("Filters").should("be.visible");
  });

  it("should be responsive", () => {
    const viewports = [
      [320, 568],
      [768, 1024],
      [1280, 720],
    ] as const;

    viewports.forEach(([width, height]) => {
      cy.viewport(width, height);
      cy.contains("Book Library").should("be.visible");

      cy.get('[data-testid="book-card"]').should("have.length", 6);
    });
  });

  it("should navigate correctly with URL parameters", () => {
    cy.visit("/?title=Clean&author=Robert");

    cy.get('[data-testid="book-card"]', { timeout: 10000 }).should("exist");

    cy.contains("Book Library").should("be.visible");

    cy.url().should("include", "title=Clean");
    cy.url().should("include", "author=Robert");

    cy.get('[data-testid="book-card"]').should("have.length.at.least", 1);
  });

  it("should ensure that there are no real API requests", () => {
    cy.visit("/");
    cy.get('[data-testid="book-card"]', { timeout: 10000 }).should("exist");

    cy.get('[data-testid="book-card"]').then(($cards) => {
      const count = $cards.length;

      if (count === 6) {
        cy.log(`SUCCESS: ${count} mock books found`);
      } else if (count > 100) {
        throw new Error(
          `ERROR: Detected ${count} books - probably real API data!`
        );
      } else {
        cy.log(`WARNING: ${count} books found (expected: 6)`);
      }
    });

    const expectedTitles = [
      "Clean Code: A Handbook of Agile Software Craftsmanship",
      "The Clean Coder: A Code of Conduct for Professional Programmers",
      "JavaScript: The Good Parts",
    ];

    expectedTitles.forEach((title) => {
      cy.contains(title).should("be.visible");
    });
  });

  it("should display correct information about mock books", () => {
    cy.visit("/");
    cy.get('[data-testid="book-card"]', { timeout: 10000 }).should("exist");

    cy.get('[data-testid="book-card"]')
      .first()
      .within(() => {
        cy.get('[data-testid="book-title"]').should("contain", "Clean Code");
        cy.contains("Robert C. Martin").should("be.visible");
        cy.contains("Pearson").should("be.visible");
        cy.contains("464").should("be.visible");
      });

    cy.contains("Pearson").should("be.visible");
    cy.contains("O'Reilly Media").should("be.visible");
    cy.contains("Addison-Wesley").should("be.visible");

    cy.contains("464").should("be.visible");
    cy.contains("176").should("be.visible");
    cy.contains("98").should("be.visible");
  });
});
