import * as matchers from "@testing-library/jest-dom/matchers";
import { expect } from "vitest";

// Registered on this app's own vitest (not via "@testing-library/jest-dom/vitest",
// which Bun's isolated install links to a different vitest copy). Types: ./jest-dom.d.ts
expect.extend(matchers);
