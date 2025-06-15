/// <reference types="cypress" />

describe("Mock Verification", () => {
  it("should load the application", () => {
    cy.visit("/");
    cy.get("h1").should("contain", "Book Library");
  });

  it("should use mock data instead of real API", () => {
    cy.visit("/");

    cy.get('[data-testid="book-card"]', { timeout: 10000 }).should("exist");

    cy.get('[data-testid="book-card"]').should("have.length", 6);

    cy.get('[data-testid="books-count"]').should("contain", "6 books");

    cy.get('[data-testid="book-title"]')
      .first()
      .should(
        "contain",
        "Clean Code: A Handbook of Agile Software Craftsmanship"
      );
  });

  it("should verify that mock data is being used (not real API)", () => {
    cy.visit("/");

    cy.get('[data-testid="book-card"]', { timeout: 15000 }).should("exist");

    cy.get('[data-testid="book-card"]').then(($cards) => {
      const count = $cards.length;
      cy.log(`📚 Found ${count} books on the page`);

      expect(count).to.equal(
        6,
        "Should have exactly 6 mock books, not real API data"
      );

      if (count === 6) {
        cy.log("SUCCESS: Using mock data (6 books)");
      } else if (count > 100) {
        cy.log("ERROR: Using real API data (500+ books)");
        throw new Error(
          `Using real API data! Found ${count} books instead of 6 mock books`
        );
      } else {
        cy.log(`WARNING: Unexpected book count: ${count}`);
      }
    });

    const expectedTitles = [
      "Clean Code: A Handbook of Agile Software Craftsmanship",
      "The Clean Coder: A Code of Conduct for Professional Programmers",
      "JavaScript: The Good Parts",
    ];

    expectedTitles.forEach((title, index) => {
      cy.get('[data-testid="book-title"]').eq(index).should("contain", title);
    });
  });

  it("should confirm test mode is active", () => {
    cy.visit("/");

    cy.get('[data-testid="book-card"]', { timeout: 10000 }).should("exist");

    cy.get('[data-testid="book-card"]').should("have.length", 6);

    cy.log("SUCCESS: Mock data is working correctly!");
    cy.log("All tests are using mock data instead of real API");
  });
});
