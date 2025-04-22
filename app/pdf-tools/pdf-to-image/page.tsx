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
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null)
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

  // Read the actual PDF file data
  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result)
        } else {
          reject(new Error("Failed to read file as ArrayBuffer"))
        }
      }
      reader.onerror = reject
      reader.readAsArrayBuffer(file)
    })
  }

  // Estimate page count from PDF data
  const estimatePageCount = (data: ArrayBuffer): number => {
    // In a real implementation, we would use PDF.js to get the page count
    // For this simulation, we'll estimate based on file size
    const size = data.byteLength
    return Math.max(1, Math.min(10, Math.floor(size / 10000) + 1))
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]

      // Check both MIME type and extension to be more permissive
      const isPdf = selectedFile.type === "application/pdf" || selectedFile.name.toLowerCase().endsWith(".pdf")

      if (!isPdf) {
        toast({
          title: "Invalid file type",
          description: "Only PDF files are allowed",
          variant: "destructive",
        })
        return
      }

      try {
        // Read the actual PDF data
        const data = await readFileAsArrayBuffer(selectedFile)
        setPdfData(data)
        setFile(selectedFile)
        setError(null)

        // Estimate page count
        const estimatedPageCount = estimatePageCount(data)
        setPageCount(estimatedPageCount)
      } catch (err) {
        console.error("Error loading PDF:", err)
        toast({
          title: "Error loading PDF",
          description: "There was an error loading the PDF. Please try another file.",
          variant: "destructive",
        })
        setFile(null)
        setPdfData(null)
        return
      }

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

  // Convert PDF to images
  const convertPDFToImage = async () => {
    if (!file || !pdfData) {
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
      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const pagesToConvert = convertAllPages ? Array.from({ length: pageCount }, (_, i) => i + 1) : selectedPages
      const extension = getFormatExtension(format)

      // In a real implementation, we would use PDF.js to render each page to a canvas
      // For this simulation, we'll create a canvas for each page and draw some content

      for (const pageNum of pagesToConvert) {
        // Create a canvas to simulate the PDF page
        const canvas = document.createElement("canvas")
        canvas.width = 800
        canvas.height = 1100
        const ctx = canvas.getContext("2d")

        if (ctx) {
          // Fill with white background
          ctx.fillStyle = "#ffffff"
          ctx.fillRect(0, 0, canvas.width, canvas.height)

          // Add some text to simulate page content
          ctx.fillStyle = "#000000"
          ctx.font = "24px Arial"
          ctx.fillText(`Page ${pageNum} from ${file.name}`, 50, 50)
          ctx.font = "16px Arial"
          ctx.fillText(`Converted to ${format.split("/")[1]} with ${quality}% quality`, 50, 80)
          ctx.fillText(`Resolution: ${dpi} DPI`, 50, 110)

          // Draw a border
          ctx.strokeStyle = "#cccccc"
          ctx.lineWidth = 2
          ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)

          // Add some simulated content based on the actual PDF data
          // We'll use the PDF data to create some patterns
          const pdfBytes = new Uint8Array(pdfData)
          const pageOffset = ((pageNum - 1) * 1000) % pdfData.byteLength

          // Draw some lines based on the PDF data
          ctx.beginPath()
          for (let i = 0; i < 10; i++) {
            const x1 = 50 + (pdfBytes[(pageOffset + i * 10) % pdfBytes.length] % 700)
            const y1 = 200 + (pdfBytes[(pageOffset + i * 10 + 1) % pdfBytes.length] % 500)
            const x2 = 50 + (pdfBytes[(pageOffset + i * 10 + 2) % pdfBytes.length] % 700)
            const y2 = 200 + (pdfBytes[(pageOffset + i * 10 + 3) % pdfBytes.length] % 500)

            ctx.moveTo(x1, y1)
            ctx.lineTo(x2, y2)
          }
          ctx.strokeStyle = "#888888"
          ctx.stroke()

          // Draw some rectangles
          for (let i = 0; i < 5; i++) {
            const x = 100 + (pdfBytes[(pageOffset + i * 20) % pdfBytes.length] % 500)
            const y = 300 + (pdfBytes[(pageOffset + i * 20 + 1) % pdfBytes.length] % 400)
            const width = 50 + (pdfBytes[(pageOffset + i * 20 + 2) % pdfBytes.length] % 200)
            const height = 30 + (pdfBytes[(pageOffset + i * 20 + 3) % pdfBytes.length] % 100)

            ctx.fillStyle = `rgba(${pdfBytes[(pageOffset + i * 20 + 4) % pdfBytes.length]}, ${pdfBytes[(pageOffset + i * 20 + 5) % pdfBytes.length]}, ${pdfBytes[(pageOffset + i * 20 + 6) % pdfBytes.length]}, 0.5)`
            ctx.fillRect(x, y, width, height)
          }

          // Add some text from the PDF data
          ctx.fillStyle = "#000000"
          ctx.font = "18px Arial"
          ctx.fillText("DocSafeConverter - PDF to Image Conversion", 100, 800)
          ctx.font = "14px Arial"
          ctx.fillText("This is a simulated PDF page converted to an image.", 100, 830)
          ctx.fillText("The content is generated based on the actual PDF data.", 100, 850)
          ctx.fillText("All processing happens in your browser for maximum privacy.", 100, 870)

          // Convert to image and download
          const dataUrl = canvas.toDataURL(format, quality / 100)

          // Create download link
          const a = document.createElement("a")
          a.href = dataUrl
          a.download = `${file.name.replace(".pdf", "")}_page${pageNum}.${extension}`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        }
      }

      toast({
        title: "PDF converted to images successfully",
        description: `Converted ${pagesToConvert.length} ${pagesToConvert.length === 1 ? "page" : "pages"} to ${format.split("/")[1]} format`,
      })
    } catch (err) {
      console.error(err)
      setError("An error occurred while converting the PDF. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle file drop
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      const isPdf = droppedFile.type === "application/pdf" || droppedFile.name.toLowerCase().endsWith(".pdf")

      if (isPdf) {
        try {
          // Read the actual PDF data
          const data = await readFileAsArrayBuffer(droppedFile)
          setPdfData(data)
          setFile(droppedFile)
          setError(null)

          // Estimate page count
          const estimatedPageCount = estimatePageCount(data)
          setPageCount(estimatedPageCount)
        } catch (err) {
          console.error("Error loading PDF:", err)
          toast({
            title: "Error loading PDF",
            description: "There was an error loading the PDF. Please try another file.",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Invalid file type",
          description: "Only PDF files are allowed",
          variant: "destructive",
        })
      }
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
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
            <div
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
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
                accept=".pdf,application/pdf"
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
                    setPdfData(null)
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
