import { useState } from "react";
import EnhancedCircularColorPicker from "./components/color-picker";

export default function ColorPickerDemo() {
  const [selectedColor, setSelectedColor] = useState({
    r: 255,
    g: 100,
    b: 50,
    a: 1,
  });

  return (
    <div
      className="min-h-screen p-4 sm:p-8 flex items-center justify-center"
      style={{
        transition: "background-color 0.3s ease",
        backgroundColor: `rgba(${selectedColor.r}, ${selectedColor.g}, ${selectedColor.b}, ${selectedColor.a})`,
      }}
    >
      <div className="max-w-md w-full mx-auto bg-white rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Z Color Picker</h1>
          <p className="text-gray-500 mt-1">Flexible Format API Demo</p>
        </div>
        {/* Clean Color Picker Library - just the picker + optional eyedropper */}
        <EnhancedCircularColorPicker
          size={280}
          initialColor={selectedColor}
          formats={["rgba", "hex", "hsl"]}
          onChange={(color) => {
            console.log("Selected formats:", color);
            // color is now: { rgba: {r,g,b,a}, hex: "#ff6432", hsl: {h,s,l} }
            if ("rgba" in color) {
              setSelectedColor(color.rgba);
            }
          }}
          backgroundColor="transparent"
          showBackground={false}
          showEyedropper={true}
        />

        {/* Parent handles all display logic */}
        <div className="mt-6 space-y-4">
          {/* Color Preview */}
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-lg border-2 border-gray-300 shadow-sm flex-shrink-0"
              style={{
                backgroundColor: `rgba(${selectedColor.r}, ${selectedColor.g}, ${selectedColor.b}, ${selectedColor.a})`,
              }}
            />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Current Color
              </h3>
              <div className="text-xs text-gray-600 space-y-1">
                <div>
                  RGB: {selectedColor.r}, {selectedColor.g}, {selectedColor.b}
                </div>
                <div>Alpha: {selectedColor.a}</div>
              </div>
            </div>
          </div>

          {/* API Examples */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">
              API Examples
            </h4>
            <div className="space-y-3 text-xs">
              <div>
                <code className="bg-white px-2 py-1 rounded">
                  formats={["hex"]}
                </code>
                <br />
                <span className="text-gray-500">→ color = "#ff6432"</span>
              </div>
              <div>
                <code className="bg-white px-2 py-1 rounded">
                  formats={["rgba", "hex"]}
                </code>
                <br />
                <span className="text-gray-500">
                  → color = {`{ rgba: {r,g,b,a}, hex: "#..." }`}
                </span>
              </div>
              <div>
                <code className="bg-white px-2 py-1 rounded">
                  no formats prop
                </code>
                <br />
                <span className="text-gray-500">
                  → color = {`{r,g,b,a,h,s,v}`} (default)
                </span>
              </div>
            </div>
          </div>

          {/* Current Color Display */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">
              Current Values
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">HEX:</span>
                <code className="font-mono text-gray-800">
                  #{Math.round(selectedColor.r).toString(16).padStart(2, "0")}
                  {Math.round(selectedColor.g).toString(16).padStart(2, "0")}
                  {Math.round(selectedColor.b).toString(16).padStart(2, "0")}
                </code>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">RGBA:</span>
                <code className="font-mono text-gray-800">
                  rgba({selectedColor.r}, {selectedColor.g}, {selectedColor.b},{" "}
                  {selectedColor.a})
                </code>
              </div>
            </div>
          </div>
        </div>

        <input
          type="color"
          className="mt-6 w-full h-10 p-0 border-0"
          value={`#${Math.round(selectedColor.r)
            .toString(16)
            .padStart(2, "0")}${Math.round(selectedColor.g)
            .toString(16)
            .padStart(2, "0")}${Math.round(selectedColor.b)
            .toString(16)
            .padStart(2, "0")}`}
          onChange={(e) => {
            const hex = e.target.value;
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            setSelectedColor({ r, g, b, a: selectedColor.a });
          }}
          style={{ appearance: "none" }}
        />
      </div>
    </div>
  );
}
