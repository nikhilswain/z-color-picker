import { useState } from "react";
import ColorPickerDemo from "./example-usage";
import FormatExamples from "./format-examples";

function App() {
  const [showExamples, setShowExamples] = useState(false);

  return (
    <div className="min-h-screen">
      <div className="fixed top-4 right-4 z-10">
        <button
          onClick={() => setShowExamples(!showExamples)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
        >
          {showExamples ? "Show Demo" : "Show Format Examples"}
        </button>
      </div>

      {showExamples ? <FormatExamples /> : <ColorPickerDemo />}
    </div>
  );
}

export default App;
