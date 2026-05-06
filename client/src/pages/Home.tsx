/*
Design philosophy reminder: Industrial precision with modern clarity. Dark slate backgrounds,
orange #ff6633 accents, Poppins typography. Real-time calculations, sharp edges, structured layout.
Vyrian's engineering heritage meets contemporary UI clarity.
*/

import { useMemo, useState } from "react";
import {
  Copy,
  RotateCcw,
  Zap,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface OhmsLawInputs {
  voltage: string;
  current: string;
  resistance: string;
  power: string;
}

const VYRIAN_LOGO = "https://www.vyrian.com/images/logo2.webp";

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [resistanceUnit, setResistanceUnit] = useState<"Ω" | "kΩ" | "MΩ" | "--">("--");
  const [resistanceInputValue, setResistanceInputValue] = useState("");

  // Ohm's Law state
  const [ohmsInputs, setOhmsInputs] = useState<OhmsLawInputs>({
    voltage: "12",
    current: "2",
    resistance: "",
    power: "",
  });

  // Format numbers to remove unnecessary decimals
  const formatNumber = (num: string | number): string => {
    if (!num) return "";
    const parsed = parseFloat(num.toString());
    if (isNaN(parsed)) return "";
    if (Number.isInteger(parsed)) return parsed.toString();
    return parseFloat(parsed.toFixed(6)).toString();
  };

  // Ohm's Law calculations
  const ohmsCalculations = useMemo(() => {
    const v = parseFloat(ohmsInputs.voltage) || 0;
    const i = parseFloat(ohmsInputs.current) || 0;
    const r = parseFloat(ohmsInputs.resistance) || 0;
    const p = parseFloat(ohmsInputs.power) || 0;

    const results: Partial<OhmsLawInputs> = {
      voltage: formatNumber(ohmsInputs.voltage),
      current: formatNumber(ohmsInputs.current),
      resistance: formatNumber(ohmsInputs.resistance),
      power: formatNumber(ohmsInputs.power),
    };

    // Count filled inputs
    const filledInputs = [v, i, r, p].filter((x) => x > 0).length;

    if (filledInputs >= 2) {
      // R = V / I
      if (v > 0 && i > 0 && !ohmsInputs.resistance) {
        results.resistance = formatNumber((v / i).toFixed(6));
      }
      // I = V / R
      if (v > 0 && r > 0 && !ohmsInputs.current) {
        results.current = formatNumber((v / r).toFixed(6));
      }
      // V = I × R
      if (i > 0 && r > 0 && !ohmsInputs.voltage) {
        results.voltage = formatNumber((i * r).toFixed(6));
      }
      // P = V × I
      if (v > 0 && i > 0 && !ohmsInputs.power) {
        results.power = formatNumber((v * i).toFixed(6));
      }
      // P = V² / R
      if (v > 0 && r > 0 && !ohmsInputs.power) {
        results.power = formatNumber(((v * v) / r).toFixed(6));
      }
      // P = I² × R
      if (i > 0 && r > 0 && !ohmsInputs.power) {
        results.power = formatNumber(((i * i) * r).toFixed(6));
      }
    }

    return results;
  }, [ohmsInputs]);

  // Generate graph data for Power vs Resistance
  const graphData = useMemo(() => {
    const v = parseFloat(ohmsInputs.voltage) || 1;
    if (v <= 0) return [];

    const data = [];
    for (let r = 0.1; r <= 100; r += 0.1) {
      const power = (v * v) / r;
      data.push({
        resistance: parseFloat(r.toFixed(2)),
        power: parseFloat(power.toFixed(2)),
      });
    }
    return data;
  }, [ohmsInputs.voltage]);

  // Calculate max power for Y-axis formatting
  const maxPower = useMemo(() => {
    if (graphData.length === 0) return 0;
    return Math.max(...graphData.map((d) => d.power));
  }, [graphData]);

  const handleOhmsChange = (field: keyof OhmsLawInputs, value: string) => {
    if (field === "resistance") {
      setResistanceInputValue(value);
      setResistanceUnit("--");
      if (value === "") {
        setOhmsInputs((prev) => ({ ...prev, [field]: "" }));
      } else {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          setOhmsInputs((prev) => ({ ...prev, [field]: numValue.toString() }));
        }
      }
    } else {
      setOhmsInputs((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleResistanceUnitChange = (unit: "Ω" | "kΩ" | "MΩ") => {
    if (resistanceInputValue && resistanceUnit === "--") {
      const numValue = parseFloat(resistanceInputValue);
      if (!isNaN(numValue)) {
        let baseOhms = numValue;
        if (unit === "kΩ") baseOhms = numValue * 1000;
        if (unit === "MΩ") baseOhms = numValue * 1000000;
        setOhmsInputs((prev) => ({ ...prev, resistance: baseOhms.toString() }));
      }
    }
    setResistanceUnit(unit);
  };

  const getDisplayResistance = () => {
    if (resistanceUnit === "--") return resistanceInputValue;
    const r = parseFloat(ohmsInputs.resistance) || 0;
    if (resistanceUnit === "kΩ") return (r / 1000).toString();
    if (resistanceUnit === "MΩ") return (r / 1000000).toString();
    return r.toString();
  };

  const resetOhms = () => {
    setOhmsInputs({
      voltage: "12",
      current: "2",
      resistance: "",
      power: "",
    });
    setResistanceUnit("--");
    setResistanceInputValue("");
  };

  const downloadGraphAsImage = () => {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `ohms-law-power-dissipation-${new Date().toISOString().split("T")[0]}.png`;
      link.click();
    }
  };

  const copyResult = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const FormulaCard = ({ label, formula, color }: { label: string; formula: string; color: string }) => (
    <div className="flex flex-col items-center rounded-lg bg-white p-6 shadow-md transition-all hover:shadow-lg">
      <div className={`mb-3 text-xs font-bold uppercase tracking-widest ${color}`}>{label}</div>
      <div className="font-mono text-xl font-bold text-[#24222e] sm:text-2xl">{formula}</div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#f6f5fa] text-[#24222e]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b-2 border-[#ff6633] bg-[#1e1c27] shadow-lg">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <a href="https://www.vyrian.com/" target="_blank" rel="noreferrer" className="flex flex-shrink-0 items-center">
            <img src={VYRIAN_LOGO} alt="Vyrian" className="h-11 w-auto object-contain sm:h-12" />
          </a>
          <div className="text-base font-bold text-white">Ohm's Law Calculator</div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1e1c27] via-[#2a2835] to-[#22202b] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-[#ff6633] blur-3xl" />
          <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-[#ff6633] blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <div className="mb-2 inline-block rounded-full bg-[#ff6633]/10 px-4 py-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#ff6633]">Engineering Tool</span>
          </div>
          <h1 className="mb-4 text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl">
            Ohm's Law Calculator
          </h1>
          <p className="mb-8 max-w-2xl text-lg text-white/80">
            Calculate voltage, current, resistance, and power relationships instantly. Real-time results for circuit analysis and design.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="space-y-8">
          {/* Calculator Section */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Input Card */}
            <Card className="border-0 bg-white p-8 shadow-lg">
              <h2 className="mb-6 text-2xl font-bold text-[#24222e]">Calculate</h2>
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#24222e]">
                    Voltage (V)
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter voltage"
                    value={ohmsInputs.voltage}
                    onChange={(e) => handleOhmsChange("voltage", e.target.value)}
                    className="border-[#e0dce8] bg-white text-[#24222e] placeholder:text-[#9b96a8]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#24222e]">
                    Current (A)
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter current"
                    value={ohmsInputs.current}
                    onChange={(e) => handleOhmsChange("current", e.target.value)}
                    className="border-[#e0dce8] bg-white text-[#24222e] placeholder:text-[#9b96a8]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#24222e]">
                    Resistance
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Enter resistance (e.g., 0.01, 1.5, 100)"
                      value={getDisplayResistance()}
                      onChange={(e) => handleOhmsChange("resistance", e.target.value)}
                      className="border-[#e0dce8] bg-white text-[#24222e] placeholder:text-[#9b96a8] flex-1"
                    />
                    <select
                      value={resistanceUnit}
                      onChange={(e) => handleResistanceUnitChange(e.target.value as "Ω" | "kΩ" | "MΩ")}
                      className="rounded-md border border-[#e0dce8] bg-white px-3 py-2 text-sm font-medium text-[#24222e] hover:bg-[#f6f5fa]"
                    >
                      <option value="--">--</option>
                      <option value="Ω">Ω</option>
                      <option value="kΩ">kΩ</option>
                      <option value="MΩ">MΩ</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#24222e]">
                    Power (W)
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter power"
                    value={ohmsInputs.power}
                    onChange={(e) => handleOhmsChange("power", e.target.value)}
                    className="border-[#e0dce8] bg-white text-[#24222e] placeholder:text-[#9b96a8]"
                  />
                </div>
              </div>
              <Button
                onClick={resetOhms}
                variant="outline"
                className="mt-6 w-full border-[#e0dce8] text-[#24222e] hover:bg-[#f6f5fa]"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </Card>

            {/* Results Card */}
            <Card className="border-l-4 border-l-[#ff6633] bg-white p-8 shadow-lg">
              <h2 className="mb-6 flex items-center text-2xl font-bold text-[#24222e]">
                <Zap className="mr-2 h-6 w-6 text-[#ff6633]" />
                Results
              </h2>
              <div className="space-y-4">
                {[
                  { label: "Voltage", value: ohmsCalculations.voltage, unit: "V" },
                  { label: "Current", value: ohmsCalculations.current, unit: "A" },
                  { label: "Resistance", value: ohmsCalculations.resistance, unit: "Ω" },
                  { label: "Power", value: ohmsCalculations.power, unit: "W" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-lg bg-[#f6f5fa] p-4"
                  >
                    <span className="text-sm font-medium text-[#9b96a8]">{item.label}</span>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-mono text-lg font-bold text-[#24222e]">
                          {item.value || "—"}
                        </div>
                        <div className="text-xs text-[#9b96a8]">{item.unit}</div>
                      </div>
                      {item.value && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyResult(`${item.value} ${item.unit}`)}
                          className="h-8 w-8 p-0 text-[#ff6633] hover:bg-[#ff6633]/10"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Graph Section */}
          <Card className="border-0 bg-white shadow-lg">
            <button
              onClick={() => setShowGraph(!showGraph)}
              className="flex w-full items-center justify-between p-8 transition-all hover:bg-[#f6f5fa]"
            >
              <h2 className="text-2xl font-bold text-[#24222e]">Power Dissipation Analysis</h2>
              <ChevronDown
                className={`h-6 w-6 text-[#ff6633] transition-transform ${
                  showGraph ? "rotate-180" : ""
                }`}
              />
            </button>
            {showGraph && (
              <div className="border-t border-[#e0dce8] px-8 pb-8 pt-6">
                {parseFloat(ohmsInputs.voltage) > 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-[#9b96a8]">
                      At {ohmsInputs.voltage}V, lower resistance values dissipate more power. Hover over the curve to see exact power dissipation at any resistance value.
                    </p>
                    <div className="flex flex-col gap-4">
                      <div className="rounded-lg bg-[#f6f5fa] p-4">
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={graphData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0dce8" />
                          <XAxis
                            dataKey="resistance"
                            label={{ value: "Resistance (Ω)", position: "insideBottomRight", offset: -5 }}
                            stroke="#9b96a8"
                            type="number"
                            domain={[0, 100]}
                            ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                          />
                          <YAxis
                            label={{ value: maxPower > 1000 ? "Power (kW)" : "Power (W)", angle: -90, position: "insideLeft" }}
                            stroke="#9b96a8"
                            tickFormatter={(value) => {
                              if (maxPower > 1000) {
                                return (value / 1000).toFixed(1);
                              }
                              return value.toFixed(0);
                            }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#24222e",
                              border: "1px solid #ff6633",
                              borderRadius: "6px",
                              color: "white",
                            }}
                            formatter={(value) => {
                              const numValue = parseFloat(value.toString());
                              if (numValue >= 1000) return `${(numValue / 1000).toFixed(2)} kW`;
                              return `${numValue.toFixed(1)} W`;
                            }}
                            labelFormatter={(label) => {
                              const numLabel = parseFloat(label.toString());
                              if (numLabel >= 1000) return `${(numLabel / 1000).toFixed(2)} kΩ`;
                              return `${numLabel.toFixed(2)} Ω`;
                            }}
                          />
                          <Legend />
                          <Line
                            key="power-dissipation"
                            type="monotone"
                            dataKey="power"
                            stroke="#ff6633"
                            dot={false}
                            strokeWidth={2}
                            isAnimationActive={true}
                            name="Power Dissipation"
                          />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <Button
                        onClick={downloadGraphAsImage}
                        className="w-full bg-[#ff6633] hover:bg-[#e55a1f] text-white font-semibold"
                      >
                        Download Graph as Image
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg bg-[#f6f5fa] p-6 text-center text-[#9b96a8]">
                    <p>Enter a voltage value to see the power dissipation curve</p>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Formula Section */}
          <Card className="border-0 bg-white p-8 shadow-lg">
            <h2 className="mb-8 text-3xl font-bold text-[#24222e]">Formulas</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <FormulaCard label="Voltage" formula="V = I × R" color="text-[#ff6633]" />
              <FormulaCard label="Current" formula="I = V / R" color="text-[#ff6633]" />
              <FormulaCard label="Resistance" formula="R = V / I" color="text-[#ff6633]" />
              <FormulaCard label="Power (V×I)" formula="P = V × I" color="text-[#ff6633]" />
              <FormulaCard label="Power (V²/R)" formula="P = V² / R" color="text-[#ff6633]" />
              <FormulaCard label="Power (I²×R)" formula="P = I² × R" color="text-[#ff6633]" />
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e0dce8] bg-white py-12 text-center text-sm text-[#9b96a8]">
        <p>Vyrian Ohm's Law Calculator • Precision engineering tools for circuit analysis</p>
      </footer>
    </main>
  );
}
