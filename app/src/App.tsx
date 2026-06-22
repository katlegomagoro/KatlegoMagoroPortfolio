import { loadProfile } from "./data/loadProfile";

// MVP placeholder render — proves profile.json -> typed loader -> UI works
// end to end. Real layout/components/visual design land in Iteration 1.
function App() {
  const profile = loadProfile();

  return (
    <main>
      <h1>{profile.basics.name}</h1>
      <p>{profile.basics.title}</p>
      <p>{profile.summary}</p>
    </main>
  );
}

export default App;
