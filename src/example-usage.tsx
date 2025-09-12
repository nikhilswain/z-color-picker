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
      <div className="max-w-4xl w-full mx-auto bg-white rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Z Color Picker</h1>
          <p className="text-gray-500 mt-1">Professional Layout Demo</p>
        </div>

        {/* Enhanced Color Picker with all features */}
        <div className="flex justify-center mb-8">
          <EnhancedCircularColorPicker
            size={240}
            initialColor={selectedColor}
            formats={["rgba", "hex", "hsl"]}
            onChange={(color) => {
              console.log("Selected formats:", color);
              if ("rgba" in color) {
                setSelectedColor(color.rgba);
              }
            }}
            backgroundColor="transparent"
            showBackground={false}
            showEyedropper={true}
            showBrightnessBar={true}
            showColorRings={true}
            showValueSlider={false}
          />
        </div>

        {/* Layout Configuration Examples */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">
              Minimal Setup
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <EnhancedCircularColorPicker
                size={120}
                initialColor={{ r: 100, g: 200, b: 255, a: 1 }}
                showEyedropper={true}
              />
            </div>
            <code className="text-xs text-gray-600 mt-2 block">
              Only eyedropper
            </code>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">
              With Color Rings
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <EnhancedCircularColorPicker
                size={120}
                initialColor={{ r: 255, g: 100, b: 100, a: 1 }}
                showEyedropper={true}
                showColorRings={true}
              />
            </div>
            <code className="text-xs text-gray-600 mt-2 block">
              Two rows of rings
            </code>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">
              Full Layout
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <EnhancedCircularColorPicker
                size={120}
                initialColor={{ r: 150, g: 255, b: 150, a: 1 }}
                showEyedropper={true}
                showColorRings={true}
                showBrightnessBar={true}
              />
            </div>
            <code className="text-xs text-gray-600 mt-2 block">
              One row + brightness bar
            </code>
          </div>
        </div>

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
              Layout Options
            </h4>
            <div className="space-y-3 text-xs">
              <div>
                <code className="bg-white px-2 py-1 rounded">
                  showEyedropper + showBrightnessBar + showColorRings
                </code>
                <br />
                <span className="text-gray-500">
                  → Full professional layout
                </span>
              </div>
              <div>
                <code className="bg-white px-2 py-1 rounded">
                  showBrightnessBar={true}
                </code>
                <br />
                <span className="text-gray-500">
                  → Horizontal brightness slider
                </span>
              </div>
              <div>
                <code className="bg-white px-2 py-1 rounded">
                  colorRingsPalette={["#ff0000", "#00ff00"]}
                </code>
                <br />
                <span className="text-gray-500">
                  → Custom color preset palette
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
