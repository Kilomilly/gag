"use client"

import { useState, useEffect } from "react"
import { Calculator, Sun, Moon, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"

// Fruit data
const FRUITS = [
  { name: "Apple", baseValue: 275, baseWeight: 10.0 },
  { name: "Mango", baseValue: 850, baseWeight: 8.5 },
  { name: "Dragonfruit", baseValue: 4750, baseWeight: 12.5 },
  { name: "Watermelon", baseValue: 1200, baseWeight: 15.0 },
  { name: "Pineapple", baseValue: 2100, baseWeight: 11.0 },
  { name: "Coconut", baseValue: 950, baseWeight: 9.0 },
  { name: "Banana", baseValue: 180, baseWeight: 6.0 },
  { name: "Orange", baseValue: 320, baseWeight: 7.5 },
]

// Growth variants
const GROWTH_VARIANTS = {
  none: { name: "None", multiplier: 1 },
  gold: { name: "Gold", multiplier: 20 },
  rainbow: { name: "Rainbow", multiplier: 50 },
}

// Mutations with categories
const MUTATIONS = {
  environmental: [
    { name: "Wet", multiplier: 2 },
    { name: "Dry", multiplier: 1.5 },
    { name: "Windy", multiplier: 3 },
  ],
  temperature: [
    { name: "Chilled", multiplier: 5 },
    { name: "Frozen", multiplier: 10 },
    { name: "Heated", multiplier: 4 },
  ],
  special: [
    { name: "Shocked", multiplier: 100 },
    { name: "Celestial", multiplier: 120 },
    { name: "Dawnbound", multiplier: 150 },
  ],
}

interface CalculationResult {
  baseValue: number
  weightRatio: number
  growthMultiplier: number
  mutationMultiplier: number
  friendBoostMultiplier: number
  valuePerFruit: number
  totalValue: number
}

export default function GrowGardenCalculator() {
  const [darkMode, setDarkMode] = useState(false)
  const [reverseMode, setReverseMode] = useState(false)

  // Form inputs
  const [fruitType, setFruitType] = useState("")
  const [actualWeight, setActualWeight] = useState("")
  const [targetValue, setTargetValue] = useState("")
  const [growthVariant, setGrowthVariant] = useState("none")
  const [selectedMutations, setSelectedMutations] = useState<{ [key: string]: string }>({})
  const [friendBoost, setFriendBoost] = useState([0])
  const [quantity, setQuantity] = useState("1")

  // Results
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  const validateInputs = (): string[] => {
    const newErrors: string[] = []

    if (!fruitType) newErrors.push("Please select a fruit type")

    if (reverseMode) {
      if (!targetValue || Number.parseFloat(targetValue) <= 0) {
        newErrors.push("Target value must be greater than 0")
      }
    } else {
      if (!actualWeight || Number.parseFloat(actualWeight) <= 0) {
        newErrors.push("Weight must be greater than 0")
      }
    }

    if (!quantity || Number.parseInt(quantity) < 1) {
      newErrors.push("Quantity must be at least 1")
    }

    return newErrors
  }

  const calculateMutationMultiplier = (): number => {
    const mutations = Object.values(selectedMutations).filter(Boolean)
    if (mutations.length === 0) return 1

    let totalMultiplier = 1
    mutations.forEach((mutationName) => {
      const mutation = Object.values(MUTATIONS)
        .flat()
        .find((m) => m.name === mutationName)
      if (mutation) {
        totalMultiplier += mutation.multiplier - 1
      }
    })

    return totalMultiplier
  }

  const calculateValue = (): CalculationResult | null => {
    const fruit = FRUITS.find((f) => f.name === fruitType)
    if (!fruit) return null

    const weight = Number.parseFloat(actualWeight)
    const qty = Number.parseInt(quantity)
    const growthMult = GROWTH_VARIANTS[growthVariant as keyof typeof GROWTH_VARIANTS].multiplier
    const mutationMult = calculateMutationMultiplier()
    const friendMult = 1 + friendBoost[0] / 100

    const weightRatio = weight / fruit.baseWeight
    const valuePerFruit = fruit.baseValue * Math.pow(weightRatio, 2) * growthMult * mutationMult * friendMult

    return {
      baseValue: fruit.baseValue,
      weightRatio: weightRatio,
      growthMultiplier: growthMult,
      mutationMultiplier: mutationMult,
      friendBoostMultiplier: friendMult,
      valuePerFruit: valuePerFruit,
      totalValue: valuePerFruit * qty,
    }
  }

  const calculateRequiredWeight = (): number | null => {
    const fruit = FRUITS.find((f) => f.name === fruitType)
    if (!fruit) return null

    const target = Number.parseFloat(targetValue)
    const qty = Number.parseInt(quantity)
    const growthMult = GROWTH_VARIANTS[growthVariant as keyof typeof GROWTH_VARIANTS].multiplier
    const mutationMult = calculateMutationMultiplier()
    const friendMult = 1 + friendBoost[0] / 100

    const targetPerFruit = target / qty
    const requiredWeightRatio = Math.sqrt(targetPerFruit / (fruit.baseValue * growthMult * mutationMult * friendMult))

    return requiredWeightRatio * fruit.baseWeight
  }

  const handleCalculate = () => {
    const validationErrors = validateInputs()
    setErrors(validationErrors)

    if (validationErrors.length === 0) {
      if (reverseMode) {
        const requiredWeight = calculateRequiredWeight()
        if (requiredWeight) {
          setActualWeight(requiredWeight.toFixed(2))
          // Calculate the result with the required weight
          const tempWeight = actualWeight
          setActualWeight(requiredWeight.toString())
          const calcResult = calculateValue()
          setResult(calcResult)
          // Don't reset actualWeight since we want to show the calculated weight
        }
      } else {
        const calcResult = calculateValue()
        setResult(calcResult)
      }
    }
  }

  const handleMutationChange = (category: string, mutationName: string, checked: boolean) => {
    setSelectedMutations((prev) => ({
      ...prev,
      [category]: checked ? mutationName : "",
    }))
  }

  const resetForm = () => {
    setFruitType("")
    setActualWeight("")
    setTargetValue("")
    setGrowthVariant("none")
    setSelectedMutations({})
    setFriendBoost([0])
    setQuantity("1")
    setResult(null)
    setErrors([])
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark" : ""}`}>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Calculator className="h-8 w-8 text-green-600 dark:text-green-400" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Grow a Garden Value Calculator</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={resetForm}
                className="flex items-center gap-2 bg-transparent"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center gap-2"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {darkMode ? "Light" : "Dark"}
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Calculator Inputs</CardTitle>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="reverse-mode" className="text-sm">
                      Reverse Mode
                    </Label>
                    <Switch id="reverse-mode" checked={reverseMode} onCheckedChange={setReverseMode} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Fruit Selection */}
                <div>
                  <Label htmlFor="fruit-type" className="text-sm font-medium mb-2 block">
                    Fruit Type
                  </Label>
                  <Select value={fruitType} onValueChange={setFruitType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a fruit" />
                    </SelectTrigger>
                    <SelectContent>
                      {FRUITS.map((fruit) => (
                        <SelectItem key={fruit.name} value={fruit.name}>
                          {fruit.name} (Base: {fruit.baseValue} Sheckles, {fruit.baseWeight}kg)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Weight or Target Value */}
                <div className="grid md:grid-cols-2 gap-4">
                  {reverseMode ? (
                    <div>
                      <Label htmlFor="target-value" className="text-sm font-medium mb-2 block">
                        Target Value (Sheckles)
                      </Label>
                      <Input
                        id="target-value"
                        type="number"
                        step="0.01"
                        value={targetValue}
                        onChange={(e) => setTargetValue(e.target.value)}
                        placeholder="Enter target value"
                      />
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="actual-weight" className="text-sm font-medium mb-2 block">
                        Actual Weight (kg)
                      </Label>
                      <Input
                        id="actual-weight"
                        type="number"
                        step="0.1"
                        value={actualWeight}
                        onChange={(e) => setActualWeight(e.target.value)}
                        placeholder="Enter weight"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="quantity" className="text-sm font-medium mb-2 block">
                      Quantity
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="Enter quantity"
                    />
                  </div>
                </div>

                {/* Growth Variant */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Growth Variant</Label>
                  <RadioGroup value={growthVariant} onValueChange={setGrowthVariant}>
                    <div className="grid grid-cols-3 gap-4">
                      {Object.entries(GROWTH_VARIANTS).map(([key, variant]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <RadioGroupItem value={key} id={key} />
                          <Label htmlFor={key} className="text-sm">
                            {variant.name} ({variant.multiplier}×)
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                {/* Mutations */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Mutations (Max 1 per category)</Label>
                  <div className="space-y-4">
                    {Object.entries(MUTATIONS).map(([category, mutations]) => (
                      <div key={category}>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                          {category}
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {mutations.map((mutation) => (
                            <div key={mutation.name} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${category}-${mutation.name}`}
                                checked={selectedMutations[category] === mutation.name}
                                onCheckedChange={(checked) =>
                                  handleMutationChange(category, mutation.name, checked as boolean)
                                }
                              />
                              <Label htmlFor={`${category}-${mutation.name}`} className="text-sm">
                                {mutation.name} ({mutation.multiplier}×)
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Friend Boost */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Friend Boost: {friendBoost[0]}%</Label>
                  <Slider value={friendBoost} onValueChange={setFriendBoost} max={50} step={10} className="w-full" />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>10%</span>
                    <span>20%</span>
                    <span>30%</span>
                    <span>40%</span>
                    <span>50%</span>
                  </div>
                </div>

                {/* Errors */}
                {errors.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Calculate Button */}
                <Button
                  onClick={handleCalculate}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  {reverseMode ? "Calculate Required Weight" : "Calculate Value"}
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Results</CardTitle>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-6">
                    {/* Total Value Highlight */}
                    <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                      <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">Total Value</h3>
                      <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                        {Math.round(result.totalValue).toLocaleString()} Sheckles
                      </p>
                    </div>

                    {reverseMode && (
                      <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
                        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">Required Weight</h3>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{actualWeight} kg</p>
                      </div>
                    )}

                    {/* Breakdown */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Calculation Breakdown</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-gray-600 dark:text-gray-400">Base Value:</span>
                          <span className="font-medium">{result.baseValue.toLocaleString()} Sheckles</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-gray-600 dark:text-gray-400">Weight Ratio²:</span>
                          <span className="font-medium">
                            {result.weightRatio.toFixed(3)}² = {Math.pow(result.weightRatio, 2).toFixed(3)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-gray-600 dark:text-gray-400">Growth Multiplier:</span>
                          <span className="font-medium">{result.growthMultiplier}×</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-gray-600 dark:text-gray-400">Mutation Multiplier:</span>
                          <span className="font-medium">{result.mutationMultiplier.toFixed(1)}×</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-gray-600 dark:text-gray-400">Friend Boost:</span>
                          <span className="font-medium">{result.friendBoostMultiplier.toFixed(2)}×</span>
                        </div>
                        <div className="flex justify-between items-center py-3 bg-gray-50 dark:bg-gray-800 rounded-lg px-3">
                          <span className="font-semibold">Value per Fruit:</span>
                          <span className="font-bold text-lg">
                            {Math.round(result.valuePerFruit).toLocaleString()} Sheckles
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 bg-green-50 dark:bg-green-900/30 rounded-lg px-3">
                          <span className="font-semibold">Total (× {quantity}):</span>
                          <span className="font-bold text-xl text-green-700 dark:text-green-300">
                            {Math.round(result.totalValue).toLocaleString()} Sheckles
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Calculator className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Enter your fruit details and click calculate to see the results</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Grow a Garden Value Calculator • Built for Roblox Players</p>
            <p className="mt-1">
              Formula: Value = BaseValue × (Weight/BaseWeight)² × Growth × Mutations × (1 + FriendBoost)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
