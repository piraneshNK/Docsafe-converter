"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Upload, ImagePlus, Trash2, Download, AlertCircle, Lock, Unlock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

type ResizeMode = "dimensions" | "percentage"

export default function ImageResizer() {
  const [files, setFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resizeMode, setResizeMode] = useState<ResizeMode>("dimensions")
  const [width, setWidth] = useState<number>(800)
  const [height, setHeight] = useState<number>(600)
  const [percentage, setPercentage] = useState<number>(50)
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(true)
  const [imageDimensions, setImageDimensions] = useState<{ [key: string]: { width: number; height: number } }>({})
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

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  useEffect(() => {
    // Get dimensions of all images
    const loadImageDimensions = async () => {
      const dimensions: { [key: string]: { width: number; height: number } } = {}

      for (const file of files) {
        const url = URL.createObjectURL(file)
        try {
          const img = new Image()
          await new Promise<void>((resolve, reject) => {
            img.onload = () => {
              dimensions[file.name] = {
                width: img.width,
                height: img.height,
              }
              resolve()
            }
            img.onerror = reject
            img.src = url
          })
        } catch (error) {
          console.error("Error loading image:", error)
        } finally {
          URL.revokeObjectURL(url)
        }
      }

      setImageDimensions(dimensions)
    }

    if (files.length > 0) {
      loadImageDimensions()
    }
  }, [files])

  const removeFile = (index: number) => {
    const newFiles = [...files]
    const removedFile = newFiles[index]
    newFiles.splice(index, 1)
    setFiles(newFiles)

    // Remove dimensions for the removed file
    const newDimensions = { ...imageDimensions }
    delete newDimensions[removedFile.name]
    setImageDimensions(newDimensions)
  }

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth)
    if (maintainAspectRatio && files.length === 1) {
      const file = files[0]
      const dimensions = imageDimensions[file.name]
      if (dimensions) {
        const aspectRatio = dimensions.width / dimensions.height
        setHeight(Math.round(newWidth / aspectRatio))
      }
    }
  }

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight)
    if (maintainAspectRatio && files.length === 1) {
      const file = files[0]
      const dimensions = imageDimensions[file.name]
      if (dimensions) {
        const aspectRatio = dimensions.width / dimensions.height
        setWidth(Math.round(newHeight * aspectRatio))
      }
    }
  }

  const resizeImages = async () => {
    if (files.length === 0) {
      setError("Please select at least one image to resize")
      return
    }

    setIsProcessing(true)
    setError(null)

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
            let newWidth, newHeight

            if (resizeMode === "dimensions") {
              newWidth = width
              newHeight = height
            } else {
              // Percentage mode
              newWidth = Math.round((img.width * percentage) / 100)
              newHeight = Math.round((img.height * percentage) / 100)
            }

            // Set canvas dimensions to the new size
            canvas.width = newWidth
            canvas.height = newHeight

            // Draw image on canvas with new dimensions
            ctx.drawImage(img, 0, 0, newWidth, newHeight)

            // Convert to image and download
            const dataUrl = canvas.toDataURL(file.type)

            // Create download link
            const a = document.createElement("a")
            a.href = dataUrl
            const fileName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name
            const extension = file.name.substring(file.name.lastIndexOf(".")) || ".jpg"
            a.download = `${fileName}_resized${extension}`
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

      toast({
        title: "Images resized successfully",
        description: `${files.length} ${files.length === 1 ? "image has" : "images have"} been resized`,
      })
    } catch (err) {
      console.error(err)
      setError("An error occurred while resizing the images. Please try again.")
    } finally {
      setIsProcessing(false)
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

        <h1 className="text-3xl font-bold mb-4">Resize Images</h1>
        <p className="text-gray-600 mb-8">
          Resize your images to specific dimensions or by percentage. All processing happens in your browser - your
          files never leave your device.
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
            <ImagePlus className="h-12 w-12 text-gray-400 mb-4" />
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
              <Tabs defaultValue="dimensions" onValueChange={(value) => setResizeMode(value as ResizeMode)}>
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="dimensions">Resize by Dimensions</TabsTrigger>
                  <TabsTrigger value="percentage">Resize by Percentage</TabsTrigger>
                </TabsList>

                <TabsContent value="dimensions">
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <Label htmlFor="width">Width (px)</Label>
                        <Input
                          id="width"
                          type="number"
                          min={1}
                          value={width}
                          onChange={(e) => handleWidthChange(Number.parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="height">Height (px)</Label>
                        <Input
                          id="height"
                          type="number"
                          min={1}
                          value={height}
                          onChange={(e) => handleHeightChange(Number.parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="flex items-center mt-6">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setMaintainAspectRatio(!maintainAspectRatio)}
                          title={maintainAspectRatio ? "Aspect ratio locked" : "Aspect ratio unlocked"}
                        >
                          {maintainAspectRatio ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    {files.length === 1 && imageDimensions[files[0].name] && (
                      <p className="text-sm text-gray-500">
                        Original dimensions: {imageDimensions[files[0].name].width} x{" "}
                        {imageDimensions[files[0].name].height} pixels
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="percentage">
                  <div className="space-y-4 mb-6">
                    <Label htmlFor="percentage">Resize to {percentage}% of original size</Label>
                    <Input
                      id="percentage"
                      type="range"
                      min={1}
                      max={200}
                      value={percentage}
                      onChange={(e) => setPercentage(Number.parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">1%</span>
                      <span className="text-sm font-medium">{percentage}%</span>
                      <span className="text-sm text-gray-500">200%</span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

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
                        <div className="text-gray-500 text-sm">
                          {(file.size / 1024).toFixed(0)} KB
                          {imageDimensions[file.name] &&
                            ` • ${imageDimensions[file.name].width} x ${imageDimensions[file.name].height}`}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeFile(index)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                onClick={resizeImages}
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
                    Resize and Download
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
                Upload the images you want to resize. You can resize multiple images at once.
              </p>
            </div>
            <div>
              <div className="bg-emerald-100 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                <span className="font-bold text-emerald-600">2</span>
              </div>
              <h3 className="font-medium mb-2">Choose Dimensions</h3>
              <p className="text-gray-600 text-sm">
                Specify the new dimensions in pixels or as a percentage of the original size.
              </p>
            </div>
            <div>
              <div className="bg-emerald-100 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                <span className="font-bold text-emerald-600">3</span>
              </div>
              <h3 className="font-medium mb-2">Download Results</h3>
              <p className="text-gray-600 text-sm">
                Your browser resizes the images using the Canvas API. Download your resized images directly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
