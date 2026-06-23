import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";
import profile from "./data/profile.json";

// Guards the one real contract that exists at MVP stage: App.tsx must
// actually render whatever is in profile.json, not hardcoded text. This is
// what Iteration 2's CV parser will eventually rewrite profile.json against,
// so a silent break here (e.g. someone hardcodes a name in JSX later) is
// exactly the kind of regression worth catching automatically.
describe("App", () => {
  it("renders the name from profile.json", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { name: profile.basics.name })
    ).toBeInTheDocument();
  });

  it("renders the title from profile.json", () => {
    render(<App />);
    expect(screen.getByText(profile.basics.title)).toBeInTheDocument();
  });

  it("renders the summary from profile.json", () => {
    render(<App />);
    expect(screen.getByText(profile.summary)).toBeInTheDocument();
  });
});
