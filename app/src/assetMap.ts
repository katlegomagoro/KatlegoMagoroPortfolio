import profileKatlego from "./assets/Profile_katlego.png";
import elidz from "./assets/ELIDZ.jpg";
import rivoniaCircle from "./assets/Rivonia_Cycle_hcaython.jpeg";
import rivoniaCircleAlt from "./assets/Riovoinia_cycle_hacjathons.jpeg";
import samsungAward from "./assets/Samsung_Innovation_Award.jpg";
import sicKeynote2024 from "./assets/SiC_Keynot_2024.jpg";
import expleoFeature from "./assets/Yes_Expleo_internship.jpg";

// profile.json stores plain filename strings (e.g. "ELIDZ.jpg") rather than
// import paths, since it's meant to stay a plain-data file that Iteration 2's
// CV parser can regenerate without needing to know anything about Vite's
// asset-import mechanics. This map is the one place that translates a stored
// filename into the actual bundled asset URL.
const ASSET_MAP: Record<string, string> = {
  "Profile_katlego.png": profileKatlego,
  "ELIDZ.jpg": elidz,
  "Rivonia_Cycle_hcaython.jpeg": rivoniaCircle,
  "Riovoinia_cycle_hacjathons.jpeg": rivoniaCircleAlt,
  "Samsung_Innovation_Award.jpg": samsungAward,
  "SiC_Keynot_2024.jpg": sicKeynote2024,
  "Yes_Expleo_internship.jpg": expleoFeature,
};

export function resolveAsset(
  filename: string | null | undefined
): string | null {
  if (!filename) return null;
  return ASSET_MAP[filename] ?? null;
}
