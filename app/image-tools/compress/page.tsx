"use client"

import type React from "react"

import { useState, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Upload, ImageIcon, Trash2, Download, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"

type CompressionLevel = "low" | "medium" | "high" | "custom"

export default function ImageCompressor() {
  const [files, setFiles] = useState<File[]>([])
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>("medium")
  const [quality, setQuality] = useState<number>(70)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [compressionResults, setCompressionResults] = useState<
    { fileName: string; originalSize: number; compressedSize: number; reduction: number }[]
  >([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter((file) => file.type.startsWith("image/"))

      if (newFiles.length !== Array.from(e.target.files).length) {
        toast({
          title: "Invalid file type",
          description: "Only image files are allowed",
          variant: "destructive",
        })
      }

      setFiles((prev) => [...prev, ...newFiles])
      setError(null)
      setCompressionResults([])

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setCompressionResults([])
  }

  const getQualityFromLevel = (level: CompressionLevel): number => {
    switch (level) {
      case "low":
        return 85
      case "medium":
        return 70
      case "high":
        return 40
      case "custom":
        return quality
      default:
        return 70
    }
  }

  const compressImages = async () => {
    if (files.length === 0) {
      setError("Please select at least one image to compress")
      return
    }

    setIsProcessing(true)
    setError(null)
    setCompressionResults([])

    const results: { fileName: string; originalSize: number; compressedSize: number; reduction: number }[] = []

    try {
      // Process each image
      for (const file of files) {
        // Create a canvas to draw the image
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          throw new Error("Could not create canvas context")
        }

        // Load the image
        const img = new Image()
        img.crossOrigin = "anonymous"

        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            // Set canvas dimensions to match image
            canvas.width = img.width
            canvas.height = img.height

            // Draw image on canvas
            ctx.drawImage(img, 0, 0)

            // Get the compression quality
            const compressionQuality = getQualityFromLevel(compressionLevel) / 100

            // Convert to JPEG with compression
            let outputType = "image/jpeg"
            if (file.type === "image/png" && compressionQuality > 0.8) {
              outputType = "image/png" // Keep PNG for high quality to preserve transparency
            }

            const dataUrl = canvas.toDataURL(outputType, compressionQuality)

            // Calculate compressed size
            const base64 = dataUrl.split(",")[1]
            const binaryString = window.atob(base64)
            const compressedSize = binaryString.length

            // Calculate reduction percentage
            const originalSize = file.size
            const reduction = Math.round(((originalSize - compressedSize) / originalSize) * 100)

            // Add to results
            results.push({
              fileName: file.name,
              originalSize,
              compressedSize,
              reduction: Math.max(0, reduction), // Ensure reduction is not negative
            })

            // Create download link
            const a = document.createElement("a")
            a.href = dataUrl
            const fileName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name
            a.download = `${fileName}_compressed.jpg`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)

            resolve()
          }

          img.onerror = () => {
            reject(new Error(`Failed to load image: ${file.name}`))
          }

          img.src = URL.createObjectURL(file)
        })
      }

      setCompressionResults(results)

      toast({
        title: "Images compressed successfully",
        description: `${files.length} ${files.length === 1 ? "image has" : "images have"} been compressed`,
      })
    } catch (err) {
      console.error(err)
      setError("An error occurred while compressing the images. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB"
    else return (bytes / 1048576).toFixed(2) + " MB"
  }

  const handleCompressionLevelChange = (level: CompressionLevel) => {
    setCompressionLevel(level)
    if (level !== "custom") {
      setQuality(getQualityFromLevel(level))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/image-tools" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Image Tools
          </Link>
        </Button>

        <h1 className="text-3xl font-bold mb-4">Compress Images</h1>
        <p className="text-gray-600 mb-8">
          Reduce image file size while maintaining quality. All processing happens in your browser - your files never
          leave your device.
        </p>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="p-6 mb-8">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6">
            <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4 text-center">Drag and drop image files here, or click to select files</p>
            <Button onClick={() => fileInputRef.current?.click()} className="bg-emerald-600 hover:bg-emerald-700">
              <Upload className="mr-2 h-4 w-4" />
              Select Images
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept="image/*"
              className="hidden"
            />
          </div>

          {files.length > 0 && (
            <div>
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Compression Level</h3>
                <RadioGroup
                  value={compressionLevel}
                  onValueChange={(value) => handleCompressionLevelChange(value as CompressionLevel)}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2 border rounded p-3">
                    <RadioGroupItem value="low" id="low" />
                    <Label htmlFor="low" className="flex-1 cursor-pointer">
                      <div className="font-medium">Low Compression</div>
                      <div className="text-sm text-gray-500">Best quality, minimal size reduction (15-25%)</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded p-3">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium" className="flex-1 cursor-pointer">
                      <div className="font-medium">Medium Compression</div>
                      <div className="text-sm text-gray-500">Good quality, moderate size reduction (40-60%)</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded p-3">
                    <RadioGroupItem value="high" id="high" />
                    <Label htmlFor="high" className="flex-1 cursor-pointer">
                      <div className="font-medium">High Compression</div>
                      <div className="text-sm text-gray-500">Reduced quality, significant size reduction (70-80%)</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded p-3">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom" className="flex-1 cursor-pointer">
                      <div className="font-medium">Custom</div>
                      <div className="text-sm text-gray-500">Set your own compression level</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {compressionLevel === "custom" && (
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <Label>Quality: {quality}%</Label>
                  </div>
                  <Slider
                    value={[quality]}
                    min={1}
                    max={100}
                    step={1}
                    onValueChange={(value) => setQuality(value[0])}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Lower quality = smaller file size. Higher quality = better image quality.
                  </p>
                </div>
              )}

              <h3 className="font-semibold text-lg mb-4">Selected Images ({files.length})</h3>
              <div className="space-y-3 mb-6">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden mr-3 flex-shrink-0">
                        <img
                          src={URL.createObjectURL(file) || "/placeholder.svg"}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="truncate max-w-xs">{file.name}</div>
                        <div className="text-gray-500 text-sm">{formatFileSize(file.size)}</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeFile(index)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                ))}
              </div>

              {compressionResults.length > 0 && (
                <div className="mb-6 bg-emerald-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Compression Results</h3>
                  <div className="space-y-3">
                    {compressionResults.map((result, index) => (
                      <div key={index} className="bg-white p-3 rounded border">
                        <div className="font-medium truncate">{result.fileName}</div>
                        <div className="grid grid-cols-3 gap-2 mt-1">
                          <div>
                            <div className="text-xs text-gray-500">Original</div>
                            <div className="text-sm">{formatFileSize(result.originalSize)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Compressed</div>
                            <div className="text-sm">{formatFileSize(result.compressedSize)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Reduction</div>
                            <div className="text-sm text-emerald-600">{result.reduction}%</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={compressImages}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={isProcessing || files.length === 0}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Compress and Download
                  </>
                )}
              </Button>
            </div>
          )}
        </Card>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="bg-emerald-100 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                <span className="font-bold text-emerald-600">1</span>
              </div>
              <h3 className="font-medium mb-2">Select Images</h3>
              <p className="text-gray-600 text-sm">
                Upload the images you want to compress. You can compress multiple images at once.
              </p>
            </div>
            <div>
              <div className="bg-emerald-100 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                <span className="font-bold text-emerald-600">2</span>
              </div>
              <h3 className="font-medium mb-2">Choose Compression Level</h3>
              <p className="text-gray-600 text-sm">
                Select your preferred compression level. Higher compression means smaller file size but lower quality.
              </p>
            </div>
            <div>
              <div className="bg-emerald-100 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                <span className="font-bold text-emerald-600">3</span>
              </div>
              <h3 className="font-medium mb-2">Download Results</h3>
              <p className="text-gray-600 text-sm">
                Your browser compresses the images using the Canvas API. Download your compressed images directly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
