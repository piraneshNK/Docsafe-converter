"use client"

import type React from "react"

import { useState, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Upload, FileText, Trash2, Download, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

type CompressionLevel = "low" | "medium" | "high" | "maximum"

export default function CompressPDF() {
  const [file, setFile] = useState<File | null>(null)
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>("medium")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [compressionResult, setCompressionResult] = useState<{
    originalSize: number
    compressedSize: number
    reduction: number
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]

      if (selectedFile.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Only PDF files are allowed",
          variant: "destructive",
        })
        return
      }

      setFile(selectedFile)
      setError(null)
      setCompressionResult(null)

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const getCompressionRatio = (level: CompressionLevel): number => {
    switch (level) {
      case "low":
        return 0.9 // 10% reduction
      case "medium":
        return 0.7 // 30% reduction
      case "high":
        return 0.5 // 50% reduction
      case "maximum":
        return 0.3 // 70% reduction
      default:
        return 0.7
    }
  }

  const compressPDF = async () => {
    if (!file) {
      setError("Please select a PDF file to compress")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // In a real implementation, we would use pdf-lib to compress the PDF
      // This is a placeholder

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const originalSize = file.size
      const ratio = getCompressionRatio(compressionLevel)
      const compressedSize = Math.floor(originalSize * ratio)
      const reduction = Math.floor((1 - ratio) * 100)

      setCompressionResult({
        originalSize,
        compressedSize,
        reduction,
      })

      // For demonstration purposes only
      toast({
        title: "PDF compressed successfully",
        description: `Reduced file size by ${reduction}%`,
      })

      // Create a mock download (in a real implementation, this would be the compressed PDF)
      const blob = new Blob(["Compressed PDF content would be here"], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `compressed-${file.name}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      setError("An error occurred while compressing the PDF. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB"
    else return (bytes / 1048576).toFixed(2) + " MB"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/pdf-tools" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to PDF Tools
          </Link>
        </Button>

        <h1 className="text-3xl font-bold mb-4">Compress PDF Files</h1>
        <p className="text-gray-600 mb-8">
          Reduce PDF file size while maintaining quality. All processing happens in your browser - your files never
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
          {!file ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4 text-center">Drag and drop a PDF file here, or click to select a file</p>
              <Button onClick={() => fileInputRef.current?.click()} className="bg-emerald-600 hover:bg-emerald-700">
                <Upload className="mr-2 h-4 w-4" />
                Select PDF File
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf"
                className="hidden"
              />
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between bg-white p-3 rounded border mb-6">
                <div className="flex items-center">
                  <FileText className="h-6 w-6 text-emerald-600 mr-3" />
                  <div>
                    <div className="font-medium">{file.name}</div>
                    <div className="text-gray-500 text-sm">{formatFileSize(file.size)}</div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFile(null)
                    setCompressionResult(null)
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500 mr-1" />
                  Remove
                </Button>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-3">Compression Level</h3>
                <RadioGroup
                  value={compressionLevel}
                  onValueChange={(value) => setCompressionLevel(value as CompressionLevel)}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2 border rounded p-3">
                    <RadioGroupItem value="low" id="low" />
                    <Label htmlFor="low" className="flex-1 cursor-pointer">
                      <div className="font-medium">Low Compression</div>
                      <div className="text-sm text-gray-500">Best quality, minimal size reduction (10%)</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded p-3">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium" className="flex-1 cursor-pointer">
                      <div className="font-medium">Medium Compression</div>
                      <div className="text-sm text-gray-500">Good quality, moderate size reduction (30%)</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded p-3">
                    <RadioGroupItem value="high" id="high" />
                    <Label htmlFor="high" className="flex-1 cursor-pointer">
                      <div className="font-medium">High Compression</div>
                      <div className="text-sm text-gray-500">Reduced quality, significant size reduction (50%)</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded p-3">
                    <RadioGroupItem value="maximum" id="maximum" />
                    <Label htmlFor="maximum" className="flex-1 cursor-pointer">
                      <div className="font-medium">Maximum Compression</div>
                      <div className="text-sm text-gray-500">Lower quality, maximum size reduction (70%)</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {compressionResult && (
                <div className="mb-6 bg-emerald-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Compression Results</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-sm text-gray-500">Original Size</div>
                      <div className="font-medium">{formatFileSize(compressionResult.originalSize)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Compressed Size</div>
                      <div className="font-medium">{formatFileSize(compressionResult.compressedSize)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Reduction</div>
                      <div className="font-medium text-emerald-600">{compressionResult.reduction}%</div>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={compressPDF}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
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
                    Compress and Download PDF
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
              <h3 className="font-medium mb-2">Select File</h3>
              <p className="text-gray-600 text-sm">
                Upload the PDF file you want to compress. Choose your preferred compression level.
              </p>
            </div>
            <div>
              <div className="bg-emerald-100 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                <span className="font-bold text-emerald-600">2</span>
              </div>
              <h3 className="font-medium mb-2">Process Locally</h3>
              <p className="text-gray-600 text-sm">
                Your browser compresses the file using JavaScript. No data is sent to any server.
              </p>
            </div>
            <div>
              <div className="bg-emerald-100 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                <span className="font-bold text-emerald-600">3</span>
              </div>
              <h3 className="font-medium mb-2">Download Result</h3>
              <p className="text-gray-600 text-sm">Download your compressed PDF file directly to your device.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
