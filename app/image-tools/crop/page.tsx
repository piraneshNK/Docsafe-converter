"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Upload, CropIcon, Trash2, Download, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

type AspectRatio = "free" | "1:1" | "4:3" | "16:9" | "3:2" | "custom"

export default function ImageCropper() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("free")
  const [customRatioWidth, setCustomRatioWidth] = useState<number>(4)
  const [customRatioHeight, setCustomRatioHeight] = useState<number>(3)
  const [cropX, setCropX] = useState<number>(0)
  const [cropY, setCropY] = useState<number>(0)
  const [cropWidth, setCropWidth] = useState<number>(0)
  const [cropHeight, setCropHeight] = useState<number>(0)
  const [imageWidth, setImageWidth] = useState<number>(0)
  const [imageHeight, setImageHeight] = useState<number>(0)
  const [imageUrl, setImageUrl] = useState<string>("")
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [dragStartX, setDragStartX] = useState<number>(0)
  const [dragStartY, setDragStartY] = useState<number>(0)
  const [isResizing, setIsResizing] = useState<boolean>(false)
  const [resizeStartX, setResizeStartX] = useState<number>(0)
  const [resizeStartY, setResizeStartY] = useState<number>(0)
  const [resizeStartWidth, setResizeStartWidth] = useState<number>(0)
  const [resizeStartHeight, setResizeStartHeight] = useState<number>(0)
  const [resizeCorner, setResizeCorner] = useState<string>("")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const cropAreaRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]

      if (!selectedFile.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Only image files are allowed",
          variant: "destructive",
        })
        return
      }

      setFile(selectedFile)
      setError(null)

      // Create URL for the image
      const url = URL.createObjectURL(selectedFile)
      setImageUrl(url)

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Load image and set initial crop area
  useEffect(() => {
    if (imageUrl && imageRef.current) {
      const img = imageRef.current

      const onImageLoad = () => {
        setImageWidth(img.naturalWidth)
        setImageHeight(img.naturalHeight)

        // Set initial crop area to cover the entire image
        setCropX(0)
        setCropY(0)
        setCropWidth(img.naturalWidth)
        setCropHeight(img.naturalHeight)
      }

      if (img.complete) {
        onImageLoad()
      } else {
        img.onload = onImageLoad
      }
    }

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl)
      }
    }
  }, [imageUrl])

  // Update crop area when aspect ratio changes
  useEffect(() => {
    if (imageWidth > 0 && imageHeight > 0) {
      let ratio = 0

      switch (aspectRatio) {
        case "1:1":
          ratio = 1
          break
        case "4:3":
          ratio = 4 / 3
          break
        case "16:9":
          ratio = 16 / 9
          break
        case "3:2":
          ratio = 3 / 2
          break
        case "custom":
          ratio = customRatioWidth / customRatioHeight
          break
        default:
          // Free aspect ratio, keep current dimensions
          return
      }

      if (ratio > 0) {
        // Calculate new dimensions while maintaining the aspect ratio
        let newWidth, newHeight

        if (imageWidth / imageHeight > ratio) {
          // Image is wider than the target ratio
          newHeight = imageHeight
          newWidth = newHeight * ratio
        } else {
          // Image is taller than the target ratio
          newWidth = imageWidth
          newHeight = newWidth / ratio
        }

        // Center the crop area
        const newX = (imageWidth - newWidth) / 2
        const newY = (imageHeight - newHeight) / 2

        setCropX(newX)
        setCropY(newY)
        setCropWidth(newWidth)
        setCropHeight(newHeight)
      }
    }
  }, [aspectRatio, customRatioWidth, customRatioHeight, imageWidth, imageHeight])

  // Handle mouse events for dragging the crop area
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cropAreaRef.current || !containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const cropRect = cropAreaRef.current.getBoundingClientRect()
    const mouseX = e.clientX - containerRect.left
    const mouseY = e.clientY - containerRect.top

    // Check if we're on a resize handle
    const handleSize = 10
    const isOnLeftEdge = Math.abs(mouseX - cropX * (containerRect.width / imageWidth)) < handleSize
    const isOnRightEdge = Math.abs(mouseX - (cropX + cropWidth) * (containerRect.width / imageWidth)) < handleSize
    const isOnTopEdge = Math.abs(mouseY - cropY * (containerRect.height / imageHeight)) < handleSize
    const isOnBottomEdge = Math.abs(mouseY - (cropY + cropHeight) * (containerRect.height / imageHeight)) < handleSize

    if (isOnRightEdge && isOnBottomEdge) {
      setIsResizing(true)
      setResizeCorner("br")
      setResizeStartX(mouseX)
      setResizeStartY(mouseY)
      setResizeStartWidth(cropWidth)
      setResizeStartHeight(cropHeight)
    } else if (isOnLeftEdge && isOnBottomEdge) {
      setIsResizing(true)
      setResizeCorner("bl")
      setResizeStartX(mouseX)
      setResizeStartY(mouseY)
      setResizeStartWidth(cropWidth)
      setResizeStartHeight(cropHeight)
    } else if (isOnRightEdge && isOnTopEdge) {
      setIsResizing(true)
      setResizeCorner("tr")
      setResizeStartX(mouseX)
      setResizeStartY(mouseY)
      setResizeStartWidth(cropWidth)
      setResizeStartHeight(cropHeight)
    } else if (isOnLeftEdge && isOnTopEdge) {
      setIsResizing(true)
      setResizeCorner("tl")
      setResizeStartX(mouseX)
      setResizeStartY(mouseY)
      setResizeStartWidth(cropWidth)
      setResizeStartHeight(cropHeight)
    } else if (
      mouseX >= cropRect.left - containerRect.left &&
      mouseX <= cropRect.right - containerRect.left &&
      mouseY >= cropRect.top - containerRect.top &&
      mouseY <= cropRect.bottom - containerRect.top
    ) {
      // We're inside the crop area, start dragging
      setIsDragging(true)
      setDragStartX(mouseX - cropX * (containerRect.width / imageWidth))
      setDragStartY(mouseY - cropY * (containerRect.height / imageHeight))
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || (!isDragging && !isResizing)) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const mouseX = e.clientX - containerRect.left
    const mouseY = e.clientY - containerRect.top

    const scaleX = imageWidth / containerRect.width
    const scaleY = imageHeight / containerRect.height

    if (isDragging) {
      // Calculate new position
      let newX = (mouseX - dragStartX) * scaleX
      let newY = (mouseY - dragStartY) * scaleY

      // Constrain to image boundaries
      newX = Math.max(0, Math.min(newX, imageWidth - cropWidth))
      newY = Math.max(0, Math.min(newY, imageHeight - cropHeight))

      setCropX(newX)
      setCropY(newY)
    } else if (isResizing) {
      const deltaX = (mouseX - resizeStartX) * scaleX
      const deltaY = (mouseY - resizeStartY) * scaleY

      let newWidth = resizeStartWidth
      let newHeight = resizeStartHeight
      let newX = cropX
      let newY = cropY

      const currentRatio =
        aspectRatio !== "free" && aspectRatio !== "custom"
          ? aspectRatio === "1:1"
            ? 1
            : aspectRatio === "4:3"
              ? 4 / 3
              : aspectRatio === "16:9"
                ? 16 / 9
                : 3 / 2
          : aspectRatio === "custom"
            ? customRatioWidth / customRatioHeight
            : 0

      if (resizeCorner === "br") {
        newWidth = Math.max(50, resizeStartWidth + deltaX)
        if (currentRatio > 0) {
          newHeight = newWidth / currentRatio
        } else {
          newHeight = Math.max(50, resizeStartHeight + deltaY)
        }
      } else if (resizeCorner === "bl") {
        const widthChange = Math.min(resizeStartWidth - 50, deltaX)
        newWidth = resizeStartWidth - widthChange
        newX = cropX + widthChange

        if (currentRatio > 0) {
          newHeight = newWidth / currentRatio
        } else {
          newHeight = Math.max(50, resizeStartHeight + deltaY)
        }
      } else if (resizeCorner === "tr") {
        newWidth = Math.max(50, resizeStartWidth + deltaX)
        if (currentRatio > 0) {
          newHeight = newWidth / currentRatio
        } else {
          const heightChange = Math.min(resizeStartHeight - 50, deltaY)
          newHeight = resizeStartHeight - heightChange
          newY = cropY + heightChange
        }
      } else if (resizeCorner === "tl") {
        const widthChange = Math.min(resizeStartWidth - 50, deltaX)
        newWidth = resizeStartWidth - widthChange
        newX = cropX + widthChange

        if (currentRatio > 0) {
          newHeight = newWidth / currentRatio
        } else {
          const heightChange = Math.min(resizeStartHeight - 50, deltaY)
          newHeight = resizeStartHeight - heightChange
          newY = cropY + heightChange
        }
      }

      // Constrain to image boundaries
      if (newX < 0) {
        newWidth += newX
        newX = 0
      }
      if (newY < 0) {
        newHeight += newY
        newY = 0
      }
      if (newX + newWidth > imageWidth) {
        newWidth = imageWidth - newX
      }
      if (newY + newHeight > imageHeight) {
        newHeight = imageHeight - newY
      }

      setCropX(newX)
      setCropY(newY)
      setCropWidth(newWidth)
      setCropHeight(newHeight)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
  }

  const resetCrop = () => {
    setCropX(0)
    setCropY(0)
    setCropWidth(imageWidth)
    setCropHeight(imageHeight)
  }

  const cropImage = async () => {
    if (!file || !imageUrl) {
      setError("Please select an image to crop")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Create a canvas to draw the cropped image
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        throw new Error("Could not create canvas context")
      }

      // Set canvas dimensions to the crop size
      canvas.width = cropWidth
      canvas.height = cropHeight

      // Load the image
      const img = new Image()
      img.crossOrigin = "anonymous"

      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          // Draw only the cropped portion of the image
          ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight)

          // Convert to image and download
          const dataUrl = canvas.toDataURL(file.type)

          // Create download link
          const a = document.createElement("a")
          a.href = dataUrl
          const fileName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name
          const extension = file.name.substring(file.name.lastIndexOf(".")) || ".jpg"
          a.download = `${fileName}_cropped${extension}`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)

          resolve()
        }

        img.onerror = () => {
          reject(new Error(`Failed to load image: ${file.name}`))
        }

        img.src = imageUrl
      })

      toast({
        title: "Image cropped successfully",
        description: "Your cropped image has been downloaded",
      })
    } catch (err) {
      console.error(err)
      setError("An error occurred while cropping the image. Please try again.")
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

        <h1 className="text-3xl font-bold mb-4">Crop Images</h1>
        <p className="text-gray-600 mb-8">
          Crop and adjust images to your needs. All processing happens in your browser - your files never leave your
          device.
        </p>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="p-6 mb-8">
          {!file ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8">
              <CropIcon className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4 text-center">
                Drag and drop an image file here, or click to select a file
              </p>
              <Button onClick={() => fileInputRef.current?.click()} className="bg-emerald-600 hover:bg-emerald-700">
                <Upload className="mr-2 h-4 w-4" />
                Select Image
              </Button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>
          ) : (
            <div>
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="md:col-span-2">
                  <div
                    ref={containerRef}
                    className="relative border rounded bg-gray-100 overflow-hidden"
                    style={{ height: "400px" }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    <img
                      ref={imageRef}
                      src={imageUrl || "/placeholder.svg"}
                      alt="Preview"
                      className="absolute top-0 left-0 w-full h-full object-contain"
                    />
                    {imageWidth > 0 && (
                      <div
                        ref={cropAreaRef}
                        className="absolute border-2 border-emerald-500"
                        style={{
                          left: `${(cropX / imageWidth) * 100}%`,
                          top: `${(cropY / imageHeight) * 100}%`,
                          width: `${(cropWidth / imageWidth) * 100}%`,
                          height: `${(cropHeight / imageHeight) * 100}%`,
                          cursor: isDragging ? "grabbing" : "grab",
                        }}
                      >
                        <div className="absolute w-3 h-3 bg-white border border-emerald-500 rounded-full -top-1.5 -left-1.5 cursor-nwse-resize"></div>
                        <div className="absolute w-3 h-3 bg-white border border-emerald-500 rounded-full -top-1.5 -right-1.5 cursor-nesw-resize"></div>
                        <div className="absolute w-3 h-3 bg-white border border-emerald-500 rounded-full -bottom-1.5 -left-1.5 cursor-nesw-resize"></div>
                        <div className="absolute w-3 h-3 bg-white border border-emerald-500 rounded-full -bottom-1.5 -right-1.5 cursor-nwse-resize"></div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
                      <Select value={aspectRatio} onValueChange={(value) => setAspectRatio(value as AspectRatio)}>
                        <SelectTrigger id="aspect-ratio">
                          <SelectValue placeholder="Select aspect ratio" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free Form</SelectItem>
                          <SelectItem value="1:1">Square (1:1)</SelectItem>
                          <SelectItem value="4:3">4:3</SelectItem>
                          <SelectItem value="16:9">16:9</SelectItem>
                          <SelectItem value="3:2">3:2</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {aspectRatio === "custom" && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="ratio-width">Width</Label>
                          <Input
                            id="ratio-width"
                            type="number"
                            min={1}
                            value={customRatioWidth}
                            onChange={(e) => setCustomRatioWidth(Number.parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="ratio-height">Height</Label>
                          <Input
                            id="ratio-height"
                            type="number"
                            min={1}
                            value={customRatioHeight}
                            onChange={(e) => setCustomRatioHeight(Number.parseInt(e.target.value) || 1)}
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <Label>Crop Dimensions</Label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div className="text-sm">
                          <span className="text-gray-500">X:</span> {Math.round(cropX)}
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Y:</span> {Math.round(cropY)}
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Width:</span> {Math.round(cropWidth)}
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Height:</span> {Math.round(cropHeight)}
                        </div>
                      </div>
                    </div>

                    <Button variant="outline" onClick={resetCrop} className="w-full">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reset Crop
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(null)
                    setImageUrl("")
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                  Remove Image
                </Button>
                <Button
                  onClick={cropImage}
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={isProcessing || !file}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Crop and Download
                    </>
                  )}
                </Button>
              </div>
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
              <h3 className="font-medium mb-2">Select Image</h3>
              <p className="text-gray-600 text-sm">
                Upload the image you want to crop. Choose your preferred aspect ratio.
              </p>
            </div>
            <div>
              <div className="bg-emerald-100 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                <span className="font-bold text-emerald-600">2</span>
              </div>
              <h3 className="font-medium mb-2">Adjust Crop Area</h3>
              <p className="text-gray-600 text-sm">
                Drag the crop area to position it. Resize by dragging the corner handles.
              </p>
            </div>
            <div>
              <div className="bg-emerald-100 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                <span className="font-bold text-emerald-600">3</span>
              </div>
              <h3 className="font-medium mb-2">Download Result</h3>
              <p className="text-gray-600 text-sm">
                Your browser crops the image using the Canvas API. Download your cropped image directly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
