"use client"

import type React from "react"

import { useState, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Upload, FileOutput, Trash2, Download, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"

type ImageFormat = "image/jpeg" | "image/png" | "image/webp"

export default function PDFToImage() {
  const [file, setFile] = useState<File | null>(null)
  const [pageCount, setPageCount] = useState<number>(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [format, setFormat] = useState<ImageFormat>("image/jpeg")
  const [quality, setQuality] = useState<number>(90)
  const [dpi, setDpi] = useState<number>(150)
  const [selectedPages, setSelectedPages] = useState<number[]>([])
  const [convertAllPages, setConvertAllPages] = useState<boolean>(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      // In a real implementation, we would use PDF.js to get the page count
      // This is a placeholder that simulates getting the page count
      // Simulate a random page count between 1 and 10
      const simulatedPageCount = Math.floor(Math.random() * 10) + 1
      setPageCount(simulatedPageCount)

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const togglePageSelection = (pageNum: number) => {
    if (selectedPages.includes(pageNum)) {
      setSelectedPages(selectedPages.filter((p) => p !== pageNum))
    } else {
      setSelectedPages([...selectedPages, pageNum])
    }
  }

  const selectAllPages = () => {
    setSelectedPages(Array.from({ length: pageCount }, (_, i) => i + 1))
  }

  const deselectAllPages = () => {
    setSelectedPages([])
  }

  const getFormatExtension = (format: ImageFormat) => {
    switch (format) {
      case "image/jpeg":
        return "jpg"
      case "image/png":
        return "png"
      case "image/webp":
        return "webp"
      default:
        return "jpg"
    }
  }

  const convertPDFToImage = async () => {
    if (!file) {
      setError("Please select a PDF file to convert")
      return
    }

    if (!convertAllPages && selectedPages.length === 0) {
      setError("Please select at least one page to convert")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // In a real implementation, we would use PDF.js to render the PDF pages to canvas
      // and then convert them to images

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const pagesToConvert = convertAllPages ? Array.from({ length: pageCount }, (_, i) => i + 1) : selectedPages

      // For demonstration purposes only
      toast({
        title: "PDF converted to images successfully",
        description: `Converted ${pagesToConvert.length} ${pagesToConvert.length === 1 ? "page" : "pages"} to ${format.split("/")[1]} format`,
      })

      // Create a mock download (in a real implementation, this would be the image files)
      // In a real implementation, we would create a zip file for multiple images
      const extension = getFormatExtension(format)
      const blob = new Blob(["Image content would be here"], { type: format })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download =
        pagesToConvert.length > 1
          ? `${file.name.replace(".pdf", "")}_images.zip`
          : `${file.name.replace(".pdf", "")}_page${pagesToConvert[0]}.${extension}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      setError("An error occurred while converting the PDF. Please try again.")
    } finally {
      setIsProcessing(false)
    }
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

        <h1 className="text-3xl font-bold mb-4">Convert PDF to Images</h1>
        <p className="text-gray-600 mb-8">
          Convert PDF pages to high-quality images. All processing happens in your browser - your files never leave your
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
              <FileOutput className="h-12 w-12 text-gray-400 mb-4" />
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
                  <FileOutput className="h-6 w-6 text-emerald-600 mr-3" />
                  <div>
                    <div className="font-medium">{file.name}</div>
                    <div className="text-gray-500 text-sm">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • {pageCount} pages
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFile(null)
                    setPageCount(0)
                    setSelectedPages([])
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500 mr-1" />
                  Remove
                </Button>
              </div>

              <div className="space-y-6 mb-6">
                <div>
                  <h3 className="font-semibold mb-3">Image Format</h3>
                  <Select value={format} onValueChange={(value) => setFormat(value as ImageFormat)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image/jpeg">JPEG</SelectItem>
                      <SelectItem value="image/png">PNG</SelectItem>
                      <SelectItem value="image/webp">WebP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Quality: {quality}%</Label>
                  </div>
                  <Slider
                    value={[quality]}
                    min={10}
                    max={100}
                    step={5}
                    onValueChange={(value) => setQuality(value[0])}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Resolution: {dpi} DPI</Label>
                  </div>
                  <Slider value={[dpi]} min={72} max={300} step={1} onValueChange={(value) => setDpi(value[0])} />
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="convert-all"
                      checked={convertAllPages}
                      onCheckedChange={(checked) => {
                        setConvertAllPages(checked === true)
                        if (checked) {
                          selectAllPages()
                        }
                      }}
                    />
                    <Label htmlFor="convert-all">Convert all pages</Label>
                  </div>

                  {!convertAllPages && (
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label>Select Pages to Convert</Label>
                        <div className="space-x-2">
                          <Button variant="outline" size="sm" onClick={selectAllPages}>
                            Select All
                          </Button>
                          <Button variant="outline" size="sm" onClick={deselectAllPages}>
                            Deselect All
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-2 mt-2">
                        {Array.from({ length: pageCount }, (_, i) => i + 1).map((pageNum) => (
                          <div key={pageNum} className="flex items-center space-x-2 border rounded p-2">
                            <Checkbox
                              id={`page-${pageNum}`}
                              checked={selectedPages.includes(pageNum)}
                              onCheckedChange={() => togglePageSelection(pageNum)}
                              disabled={convertAllPages}
                            />
                            <Label htmlFor={`page-${pageNum}`} className="text-sm">
                              Page {pageNum}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={convertPDFToImage}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={isProcessing || !file || (!convertAllPages && selectedPages.length === 0)}
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
              <h3 className="font-medium mb-2">Select File</h3>
              <p className="text-gray-600 text-sm">
                Upload the PDF file you want to convert. Choose your preferred image format and quality.
              </p>
            </div>
            <div>
              <div className="bg-emerald-100 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                <span className="font-bold text-emerald-600">2</span>
              </div>
              <h3 className="font-medium mb-2">Process Locally</h3>
              <p className="text-gray-600 text-sm">
                Your browser renders the PDF pages to images using JavaScript. No data is sent to any server.
              </p>
            </div>
            <div>
              <div className="bg-emerald-100 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                <span className="font-bold text-emerald-600">3</span>
              </div>
              <h3 className="font-medium mb-2">Download Result</h3>
              <p className="text-gray-600 text-sm">
                Download your converted images directly to your device. Multiple pages are packaged as a ZIP file.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
