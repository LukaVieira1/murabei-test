/// <reference types="cypress" />

describe("Book Management (CRUD)", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get('[data-testid="book-card"]', { timeout: 10000 }).should("exist");
    cy.get("main").should("be.visible");
  });

  describe("Create Book", () => {
    it("should open and close the create book modal", () => {
      cy.get("button").contains("New Book").click();
      cy.get('[data-testid="create-book-modal"]').should("be.visible");

      cy.get('[data-testid="close-modal"]').click();
      cy.get('[data-testid="create-book-modal"]').should("not.exist");
    });

    it("should close modal with ESC", () => {
      cy.get("button").contains("New Book").click();
      cy.get('[data-testid="create-book-modal"]').should("be.visible");

      cy.get("body").type("{esc}");
      cy.get('[data-testid="create-book-modal"]').should("not.exist");
    });

    it("should create a book with required fields", () => {
      const bookData = {
        title: "Cypress Test Book",
        author: "Test Author",
      };

      cy.get("button").contains("New Book").click();
      cy.get('[data-testid="create-book-modal"]').should("be.visible");

      cy.get('input[name="title"]').type(bookData.title);
      cy.get('input[name="author"]').type(bookData.author);

      cy.get('button[type="submit"]').click();

      cy.get('[data-testid="create-book-modal"]', { timeout: 5000 }).should(
        "not.exist"
      );
    });

    it("should create a book with all fields filled", () => {
      const bookData = {
        title: "Complete Test Book",
        author: "Test Author Complete",
        publisher: "Test Publisher",
        synopsis:
          "This is a complete test book with all fields filled out for testing purposes.",
        pages: 250,
        format: "Hardcover",
      };

      cy.get("button").contains("New Book").click();
      cy.get('[data-testid="create-book-modal"]').should("be.visible");

      cy.get('input[name="title"]').type(bookData.title);
      cy.get('input[name="author"]').type(bookData.author);
      cy.get('input[name="publisher"]').type(bookData.publisher);
      cy.get('textarea[name="synopsis"]').type(bookData.synopsis);
      cy.get('input[name="pages"]').clear().type(bookData.pages.toString());

      cy.get('input[name="format"]').clear().type(bookData.format);

      cy.get('button[type="submit"]').click();

      cy.get('[data-testid="create-book-modal"]', { timeout: 5000 }).should(
        "not.exist"
      );
    });

    it("should validate required fields", () => {
      cy.get("button").contains("New Book").click();
      cy.get('[data-testid="create-book-modal"]').should("be.visible");

      cy.get('button[type="submit"]').click();

      cy.get('input[name="title"]:invalid').should("exist");
      cy.get('input[name="author"]:invalid').should("exist");

      cy.get('[data-testid="create-book-modal"]').should("be.visible");
    });

    it("should reset form when closing and reopening modal", () => {
      cy.get("button").contains("New Book").click();

      cy.get('input[name="title"]').type("Test");
      cy.get('input[name="author"]').type("Author");

      cy.get('[data-testid="close-modal"]').click();

      cy.get("button").contains("New Book").click();

      cy.get('input[name="title"]').should("have.value", "");
      cy.get('input[name="author"]').should("have.value", "");
    });
  });

  describe("Edit Book", () => {
    it("should open edit book modal with filled data", () => {
      cy.get('[data-testid="book-card"]')
        .first()
        .within(() => {
          cy.get('[data-testid="book-actions-dropdown"]').click();
        });

      cy.get('[data-testid="edit-book-option"]').click();

      cy.get('[data-testid="edit-book-modal"]').should("be.visible");

      cy.get('input[name="title"]', { timeout: 10000 }).should(
        "not.have.value",
        ""
      );
      cy.get('input[name="author"]').should("not.have.value", "");

      cy.get('input[name="title"]').should("contain.value", "Clean Code");
      cy.get('input[name="author"]').should(
        "contain.value",
        "Robert C. Martin"
      );
    });

    it("should edit book successfully", () => {
      cy.get('[data-testid="book-card"]')
        .first()
        .within(() => {
          cy.get('[data-testid="book-actions-dropdown"]').click();
        });

      cy.get('[data-testid="edit-book-option"]').click();

      cy.get('input[name="title"]', { timeout: 10000 }).should(
        "not.have.value",
        ""
      );

      cy.get('input[name="title"]').clear().type("Updated Book Title");
      cy.get('input[name="author"]').clear().type("Updated Author");

      cy.get('button[type="submit"]').click();

      cy.get('[data-testid="edit-book-modal"]', { timeout: 5000 }).should(
        "not.exist"
      );
    });
  });

  describe("Delete Book", () => {
    it("should delete book with confirmation", () => {
      cy.get('[data-testid="book-card"]')
        .first()
        .within(() => {
          cy.get('[data-testid="book-actions-dropdown"]').click();
        });

      cy.get('[data-testid="delete-book-option"]').click();

      cy.get('[data-testid="confirm-delete-modal"]').should("be.visible");
      cy.get('[data-testid="confirm-delete-modal"]').should(
        "contain",
        "Are you sure"
      );

      cy.get('[data-testid="confirm-delete-button"]').click();

      cy.get('[data-testid="confirm-delete-modal"]', { timeout: 5000 }).should(
        "not.exist"
      );
    });

    it("should cancel deletion", () => {
      cy.get('[data-testid="book-card"]')
        .first()
        .within(() => {
          cy.get('[data-testid="book-actions-dropdown"]').click();
        });

      cy.get('[data-testid="delete-book-option"]').click();
      cy.get('[data-testid="confirm-delete-modal"]').should("be.visible");

      cy.get('[data-testid="cancel-delete-button"]').click();

      cy.get('[data-testid="confirm-delete-modal"]').should("not.exist");
    });
  });

  describe("Dropdown Actions", () => {
    it("should open and close dropdown actions", () => {
      const firstBookCard = cy.get('[data-testid="book-card"]').first();

      firstBookCard.within(() => {
        cy.get('[data-testid="book-actions-dropdown"]').click();
      });

      cy.get('[data-testid="edit-book-option"]').should("be.visible");
      cy.get('[data-testid="delete-book-option"]').should("be.visible");

      cy.get("body").click({ force: true });

      cy.get('[data-testid="edit-book-option"]').should("not.exist");
    });

    it("should show all dropdown options", () => {
      cy.get('[data-testid="book-card"]')
        .first()
        .within(() => {
          cy.get('[data-testid="book-actions-dropdown"]').click();
        });

      cy.get('[data-testid="edit-book-option"]').should("contain", "Edit");
      cy.get('[data-testid="delete-book-option"]').should("contain", "Delete");
    });
  });

  describe("Mock Data Verification", () => {
    it("should verify that we are using mock data", () => {
      cy.get('[data-testid="book-card"]').should("have.length", 6);

      cy.contains("Clean Code").should("be.visible");
      cy.contains("JavaScript: The Good Parts").should("be.visible");
      cy.contains("Design Patterns").should("be.visible");
    });

    it("should verify book card structure", () => {
      cy.get('[data-testid="book-card"]')
        .first()
        .within(() => {
          cy.get('[data-testid="book-actions-dropdown"]').should("exist");

          cy.get('[data-testid="book-title"]').should("exist");

          cy.get("span").should("exist");
        });
    });
  });
});
