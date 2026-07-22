/**
 * Standalone entry for the Math Lab surface only.
 *
 * The main app bundles the 958 KB ICSE curriculum graph, which this prototype
 * does not use — it carries its own CBSE slice. This entry renders Math Lab on
 * its own so the shareable build stays small and loads instantly.
 *
 * Build: npm run build:mathlab  ->  dist-mathlab/mathlab-artifact.html
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import "./styles/app.css";
import "./styles/standalone.css";
import { MathLab } from "./ui/mathlab/MathLab";

function Standalone() {
  return (
    <div className="tomo-standalone" data-persona="mathlab">
      <header className="app-header">
        <div className="app-header-inner" style={{ gridTemplateColumns: "1fr auto" }}>
          <div className="brand">
            <span className="brand-mark">とも</span>
            <div className="stack" style={{ lineHeight: 1.1 }}>
              <strong style={{ fontSize: 15 }}>Tomo School</strong>
              <span className="small muted">Math Lab · CBSE Grade 4 adaptive prototype</span>
            </div>
          </div>
          <span className="chip">Adaptive Math Engine brief v0.2</span>
        </div>
      </header>

      <main className="app-main">
        <MathLab />
      </main>

      <footer className="app-footer">
        <span className="muted small">
          Illustrative prototype. Curriculum references are verbatim from NCERT Maths Mela
          (Class 3 Ch. 3/6/7/8/9/12 · Class 4 Ch. 4/5/9), but the content shown is
          pipeline-pending and has not been through teacher review or board approval.
        </span>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Standalone />
  </StrictMode>,
);
