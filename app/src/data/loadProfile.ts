import profileData from "./profile.json";
import type { Profile } from "./profile.types";

// profile.json is the single source of truth so Iteration 2's CV parser
// can regenerate this file without touching component code.
export function loadProfile(): Profile {
  return profileData as Profile;
}
