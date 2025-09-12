import { useState } from "react";
import EnhancedCircularColorPicker from "./components/color-picker";

type ColorFormatType = "rgba" | "rgb" | "hex" | "hsl" | "hsla" | "hsv" | "hsva";

export default function FormatExamples() {
  const [results, setResults] = useState<Record<string, unknown>>({});

  const baseColor = { r: 255, g: 100, b: 50, a: 0.8 };

  const examples: Array<{
    title: string;
    formats: ColorFormatType[] | undefined;
    description: string;
  }> = [
    {
      title: "Single Format: HEX",
      formats: ["hex"] as ColorFormatType[],
      description: "Returns a string directly",
    },
    {
      title: "Single Format: RGBA",
      formats: ["rgba"] as ColorFormatType[],
      description: "Returns {r, g, b, a} object directly",
    },
    {
      title: "Multiple Formats",
      formats: ["hex", "rgba", "hsl"] as ColorFormatType[],
      description: "Returns object with specified formats",
    },
    {
      title: "All Formats",
      formats: [
        "rgba",
        "rgb",
        "hex",
        "hsl",
        "hsla",
        "hsv",
        "hsva",
      ] as ColorFormatType[],
      description: "Returns object with all available formats",
    },
    {
      title: "No Formats (Default)",
      formats: undefined,
      description: "Returns merged RGBA + HSVA object (backward compatibility)",
    },
  ];

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          Color Picker Format Examples
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {examples.map((example, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-2">{example.title}</h3>
              <p className="text-sm text-gray-600 mb-4">
                {example.description}
              </p>

              <div className="mb-4">
                <code className="text-xs bg-gray-100 p-2 rounded block">
                  formats=
                  {example.formats
                    ? JSON.stringify(example.formats)
                    : "undefined"}
                </code>
              </div>

              <EnhancedCircularColorPicker
                size={180}
                initialColor={baseColor}
                formats={example.formats}
                onChange={(color) => {
                  setResults((prev) => ({
                    ...prev,
                    [index]: color,
                  }));
                }}
                showEyedropper={false}
                showBackground={false}
                showValueSlider={true}
              />

              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">Result:</h4>
                <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-32">
                  {JSON.stringify(results[index], null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
