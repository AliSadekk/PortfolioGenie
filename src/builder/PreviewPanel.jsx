
import { buildPreviewHtml } from "../templates/index.js";

export default function PreviewPanel({ files }) {
  if (!files || !files["index.html"]) {
    return (
      <section>
        <h2>Portfolio Preview</h2>
        <p>No preview available yet.</p>
      </section>
    );
  }

  const previewHtml = buildPreviewHtml(files);

  return (
    <section className="preview-panel">
     <h2 style={{ color: "#1B1B1B" }}>
  Portfolio Preview
</h2>

      <iframe
        title="Portfolio preview"
        srcDoc={previewHtml}
        sandbox=""
        style={{
          display: "block",
          width: "100%",
          minHeight: "600px",
          border: "1px solid #D6CFC2",
          background: "#F4EFE6",
        }}
      />
    </section>
  );
}
