
import { useMemo, useState } from "react";

import PreviewPanel from "./builder/PreviewPanel.jsx";
import { renderTemplate } from "./templates/index.js";

import fullData from "./templates/sample-data/full.json";
import partialData from "./templates/sample-data/partial.json";
import hostileData from "./templates/sample-data/hostile.json";

const sampleData = {
  full: {
    label: "Full Data",
    description: "Preview with complete portfolio information.",
    data: fullData,
  },
  partial: {
    label: "Partial Data",
    description: "Preview with some missing information.",
    data: partialData,
  },
  hostile: {
    label: "Hostile Data",
    description: "Preview with potentially unsafe HTML and URLs.",
    data: hostileData,
  },
};

function App() {
  const [selectedSample, setSelectedSample] = useState("full");

  const currentSample = sampleData[selectedSample];

  const files = useMemo(
    () => renderTemplate(currentSample.data),
    [currentSample]
  );

  const buttonStyle = (sample) => ({
    padding: "10px 18px",
    border: "1px solid #1F4D3A",
    borderRadius: "4px",
    background:
      selectedSample === sample ? "#1F4D3A" : "transparent",
    color: selectedSample === sample ? "#FFFFFF" : "#1F4D3A",
    fontWeight: "bold",
    cursor: "pointer",
  });

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
      <header
        style={{
          margin: "0 auto 24px",
          maxWidth: "1000px",
        }}
      >
        <p
          style={{
            color: "#1F4D3A",
            fontWeight: "bold",
            letterSpacing: "2px",
          }}
        >
          PORTFOLIOGENIE
        </p>

        <h1>Preview Demo — Editorial Template</h1>

        <p>
          Test the template using different sample data.
        </p>
      </header>

      <section
        style={{
          maxWidth: "1000px",
          margin: "0 auto 24px",
        }}
      >
        <h2>Choose Sample Data</h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <button
            type="button"
            style={buttonStyle("full")}
            onClick={() => setSelectedSample("full")}
          >
            Full Data
          </button>

          <button
            type="button"
            style={buttonStyle("partial")}
            onClick={() => setSelectedSample("partial")}
          >
            Partial Data
          </button>

          <button
            type="button"
            style={buttonStyle("hostile")}
            onClick={() => setSelectedSample("hostile")}
          >
            Hostile Data
          </button>
        </div>

        <p>{currentSample.description}</p>
      </section>

      <section
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <PreviewPanel files={files} />
      </section>
    </main>
  );
}

export default App;
