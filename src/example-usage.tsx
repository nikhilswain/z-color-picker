import React, { useCallback, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import EnhancedCircularColorPicker from "./components/color-picker";

export default function ColorPickerDemo() {
  const [selectedColor, setSelectedColor] = useState({
    r: 255,
    g: 100,
    b: 50,
    a: 0.8,
  });

  // Check if the EyeDropper API is available in the user's browser
  const isEyeDropperSupported = "EyeDropper" in window;

  const pickColorFromScreen = async () => {
    if (!isEyeDropperSupported) {
      alert("Your browser doesn't support the EyeDropper API yet.");
      return;
    }

    try {
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open(); // This opens the eyedropper

      // The result gives us a hex color, e.g., #RRGGBB
      const rgb = hexToRgb(result.sRGBHex);

      if (rgb) {
        // Update our state with the new color, keeping the previous alpha
        setSelectedColor((prevColor) => ({
          ...rgb,
          a: prevColor.a,
        }));
      }
    } catch (e) {
      // This catch block runs if the user cancels the eyedropper (e.g., by pressing Escape)
      console.log("EyeDropper cancelled by user.");
    }
  };

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
          <p className="text-gray-500 mt-1">Touch, Pen, and Mouse compatible</p>
        </div>
        <EnhancedCircularColorPicker
          size={280}
          initialColor={selectedColor}
          onChange={(c) => {
            console.log("onChange called:", c);

            setSelectedColor({ ...c });
          }}
          backgroundColor="transparent"
          showBackground={false}
        />
        {isEyeDropperSupported && (
          <div className="mt-6">
            <button
              onClick={pickColorFromScreen}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-colors"
            >
              <svg
                className="w-6 h-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.362-3.797z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.362 5.214C14.267 4.502 12.94 4 11.25 4c-1.423 0-2.809.39-4.062 1.134a8.26 8.26 0 002.82 2.802 8.983 8.983 0 013.362-3.797z"
                />
              </svg>
              Pick a Color from Screen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
