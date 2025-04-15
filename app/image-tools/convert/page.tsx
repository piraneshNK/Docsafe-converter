"use client"

import type React from "react"

import { useState, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Upload, ImageIcon, Trash2, Download, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

type ImageFormat = "image/jpeg" | "image/png" | "image/webp" | "image/gif"

export default function ImageConverter() {
  const [files, setFiles] = useState<File[]>([])
  const [format, setFormat] = useState<ImageFormat>("image/jpeg")
  const [quality, setQuality] = useState<number>(90)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const getFormatExtension = (format: ImageFormat) => {
    switch (format) {
      case "image/jpeg":
        return "jpg"
      case "image/png":
        return "png"
      case "image/webp":
        return "webp"
      case "image/gif":
        return "gif"
      default:
        return "jpg"
    }
  }

  const convertImages = async () => {
    if (files.length === 0) {
      setError("Please select at least one image to convert")
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
            // Set canvas dimensions to match image
            canvas.width = img.width
            canvas.height = img.height

            // Draw image on canvas
            ctx.drawImage(img, 0, 0)

            // Convert to desired format
            const dataUrl = canvas.toDataURL(format, quality / 100)

            // Create download link
            const a = document.createElement("a")
            a.href = dataUrl
            const extension = getFormatExtension(format)
            const fileName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name
            a.download = `${fileName}.${extension}`
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
        title: "Images converted successfully",
        description: `${files.length} ${files.length === 1 ? "image has" : "images have"} been converted to ${format.split("/")[1]}`,
      })
    } catch (err) {
      console.error(err)
      setError("An error occurred while converting the images. Please try again.")
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

        <h1 className="text-3xl font-bold mb-4">Convert Images</h1>
        <p className="text-gray-600 mb-8">
          Convert images between different formats. All processing happens in your browser - your files never leave your
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

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Output Format</label>
              <Select value={format} onValueChange={(value) => setFormat(value as ImageFormat)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image/jpeg">JPEG</SelectItem>
                  <SelectItem value="image/png">PNG</SelectItem>
                  <SelectItem value="image/webp">WebP</SelectItem>
                  <SelectItem value="image/gif">GIF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quality ({quality}%)</label>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number.parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {files.length > 0 && (
            <div>
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
                          {(file.size / 1024).toFixed(0)} KB • {file.type.split("/")[1].toUpperCase()}
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
                onClick={convertImages}
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
                    Convert and Download
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
                Upload the images you want to convert. We support JPG, PNG, WebP, and GIF formats.
              </p>
            </div>
            <div>
              <div className="bg-emerald-100 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                <span className="font-bold text-emerald-600">2</span>
              </div>
              <h3 className="font-medium mb-2">Choose Settings</h3>
              <p className="text-gray-600 text-sm">
                Select your desired output format and quality. Higher quality means larger file size.
              </p>
            </div>
            <div>
              <div className="bg-emerald-100 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                <span className="font-bold text-emerald-600">3</span>
              </div>
              <h3 className="font-medium mb-2">Download Results</h3>
              <p className="text-gray-600 text-sm">
                Your browser converts the images using the Canvas API. Download your converted images directly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
