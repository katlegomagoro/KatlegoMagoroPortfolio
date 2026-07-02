import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";
import profile from "./data/profile.json";

function renderAppWithIntroDismissed() {
  render(<App />);
  const continueButton = screen.getByRole("button", {
    name: /press enter to continue/i,
  });
  fireEvent.click(continueButton);
}

// Guards the one real contract that exists at MVP stage: App.tsx must
// actually render whatever is in profile.json, not hardcoded text. This is
// what Iteration 2's CV parser will eventually rewrite profile.json against,
// so a silent break here (e.g. someone hardcodes a name in JSX later) is
// exactly the kind of regression worth catching automatically.
describe("App", () => {
  it("renders the name from profile.json", () => {
    renderAppWithIntroDismissed();
    expect(
      screen.getByRole("heading", { name: profile.basics.name })
    ).toBeInTheDocument();
  });

  it("renders the title from profile.json", () => {
    renderAppWithIntroDismissed();
    expect(screen.getByText(profile.basics.title)).toBeInTheDocument();
  });

  it("renders the summary paragraphs from profile.json", () => {
    renderAppWithIntroDismissed();

    const summaryParagraphs = profile.summary
      .split(/\n\n+/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    summaryParagraphs.forEach((paragraph) => {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    });
  });
});
