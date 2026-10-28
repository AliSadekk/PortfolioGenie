
import { useMemo } from "react";
import PreviewPanel from "./builder/PreviewPanel.jsx";
import { renderTemplate } from "./templates/index.js";
import fullData from "./templates/sample-data/full.json";

function App() {
  const files = useMemo(() => renderTemplate(fullData), []);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "24px",
        background: "#E8E3DA",
        color: "#1B1B1B",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <header style={{ margin: "0 auto 24px", maxWidth: "1000px" }}>
        <p style={{ color: "#1F4D3A", fontWeight: "bold" }}>
          PORTFOLIOGENIE
        </p>
        <h1 style={{ color: "#1B1B1B" }}>
  Template 1 — Editorial
</h1>
        <p>Static preview using sample portfolio data.</p>
      </header>

      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <PreviewPanel files={files} />
      </div>
    </main>
  );
}

export default App;
