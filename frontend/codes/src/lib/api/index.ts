export { booksApi, getBooksSSR } from "./books";
export { authorsApi } from "./authors";
export { filtersApi } from "./filters";

export type * from "../types";

import { booksApi } from "./books";
import { authorsApi } from "./authors";
import { filtersApi } from "./filters";

export const api = {
  ...booksApi,
  ...authorsApi,
  ...filtersApi,
};
