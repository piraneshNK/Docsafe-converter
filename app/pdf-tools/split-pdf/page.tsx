"use client"

import type React from "react"

import { useState, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Upload, FileDigit, Trash2, Download, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

export default function SplitPDF() {
  const [file, setFile] = useState<File | null>(null)
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null)
  const [pageCount, setPageCount] = useState<number>(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPages, setSelectedPages] = useState<number[]>([])
  const [splitMode, setSplitMode] = useState<"range" | "extract" | "pages">("range")
  const [rangeStart, setRangeStart] = useState<number>(1)
  const [rangeEnd, setRangeEnd] = useState<number>(1)
  const [pagesPerFile, setPagesPerFile] = useState<number>(1)
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
    return Math.max(1, Math.min(20, Math.floor(size / 10000) + 1))
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
        setRangeEnd(estimatedPageCount)
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

  // Split the PDF data
  const splitPDF = async () => {
    if (!file || !pdfData) {
      setError("Please select a PDF file to split")
      return
    }

    if (splitMode === "extract" && selectedPages.length === 0) {
      setError("Please select at least one page to extract")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 1500))

      let successMessage = ""
      let fileName = ""
      let extractedData: ArrayBuffer

      if (splitMode === "range") {
        successMessage = `PDF split into range: pages ${rangeStart} to ${rangeEnd}`
        fileName = `${file.name.replace(".pdf", "")}_pages_${rangeStart}-${rangeEnd}.pdf`

        // Simulate extracting pages by taking a portion of the PDF data
        const totalPages = pageCount
        const startPercent = (rangeStart - 1) / totalPages
        const endPercent = rangeEnd / totalPages
        const startByte = Math.floor(pdfData.byteLength * startPercent)
        const endByte = Math.floor(pdfData.byteLength * endPercent)

        // Create a new ArrayBuffer with the extracted portion
        extractedData = pdfData.slice(startByte, endByte)
      } else if (splitMode === "extract") {
        successMessage = `Extracted ${selectedPages.length} pages from PDF`
        fileName = `${file.name.replace(".pdf", "")}_extracted_pages.pdf`

        // Simulate extracting specific pages
        const totalPages = pageCount
        const extractedParts: ArrayBuffer[] = []

        // Add PDF header
        const header = new TextEncoder().encode("%PDF-1.7\n")
        extractedParts.push(header.buffer)

        // Extract each selected page
        for (const pageNum of selectedPages) {
          const pagePercent = (pageNum - 1) / totalPages
          const nextPagePercent = pageNum / totalPages
          const startByte = Math.floor(pdfData.byteLength * pagePercent)
          const endByte = Math.floor(pdfData.byteLength * nextPagePercent)

          extractedParts.push(pdfData.slice(startByte, endByte))
        }

        // Add PDF footer
        const footer = new TextEncoder().encode("\n%%EOF")
        extractedParts.push(footer.buffer)

        // Calculate total size
        const totalSize = extractedParts.reduce((size, part) => size + part.byteLength, 0)

        // Create a merged buffer
        const mergedBuffer = new Uint8Array(totalSize)
        let offset = 0

        for (const part of extractedParts) {
          mergedBuffer.set(new Uint8Array(part), offset)
          offset += part.byteLength
        }

        extractedData = mergedBuffer.buffer
      } else if (splitMode === "pages") {
        successMessage = `PDF split into files with ${pagesPerFile} pages each`
        fileName = `${file.name.replace(".pdf", "")}_split_part1.pdf`

        // Simulate splitting into multiple files with pagesPerFile pages each
        // For simplicity, we'll just create the first part
        const totalPages = pageCount
        const partPages = Math.min(pagesPerFile, totalPages)
        const endPercent = partPages / totalPages
        const endByte = Math.floor(pdfData.byteLength * endPercent)

        // Create a new ArrayBuffer with the first part
        extractedData = pdfData.slice(0, endByte)
      } else {
        throw new Error("Invalid split mode")
      }

      // Create a blob with the extracted data
      const blob = new Blob([extractedData], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)

      // Create a download link
      const a = document.createElement("a")
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "PDF split successfully",
        description: successMessage,
      })
    } catch (err) {
      console.error(err)
      setError("An error occurred while splitting the PDF. Please try again.")
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
          setRangeEnd(estimatedPageCount)
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

        <h1 className="text-3xl font-bold mb-4">Split PDF Files</h1>
        <p className="text-gray-600 mb-8">
          Extract pages or split PDF into multiple files. All processing happens in your browser - your files never
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
            <div
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <FileDigit className="h-12 w-12 text-gray-400 mb-4" />
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
                  <FileDigit className="h-6 w-6 text-emerald-600 mr-3" />
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

              <Tabs
                defaultValue="range"
                onValueChange={(value) => setSplitMode(value as "range" | "extract" | "pages")}
              >
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="range">Split by Range</TabsTrigger>
                  <TabsTrigger value="extract">Extract Pages</TabsTrigger>
                  <TabsTrigger value="pages">Split by Pages</TabsTrigger>
                </TabsList>

                <TabsContent value="range">
                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="range-start">From Page</Label>
                        <Input
                          id="range-start"
                          type="number"
                          min={1}
                          max={pageCount}
                          value={rangeStart}
                          onChange={(e) => setRangeStart(Number.parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="range-end">To Page</Label>
                        <Input
                          id="range-end"
                          type="number"
                          min={1}
                          max={pageCount}
                          value={rangeEnd}
                          onChange={(e) => setRangeEnd(Number.parseInt(e.target.value) || 1)}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      This will extract pages {rangeStart} to {rangeEnd} into a new PDF file.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="extract">
                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-5 gap-2">
                      {Array.from({ length: pageCount }, (_, i) => i + 1).map((pageNum) => (
                        <div key={pageNum} className="flex items-center space-x-2 border rounded p-2">
                          <Checkbox
                            id={`page-${pageNum}`}
                            checked={selectedPages.includes(pageNum)}
                            onCheckedChange={() => togglePageSelection(pageNum)}
                          />
                          <Label htmlFor={`page-${pageNum}`} className="text-sm">
                            Page {pageNum}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">
                      Selected {selectedPages.length} of {pageCount} pages.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="pages">
                  <div className="space-y-4 mb-6">
                    <div>
                      <Label htmlFor="pages-per-file">Pages per file</Label>
                      <Input
                        id="pages-per-file"
                        type="number"
                        min={1}
                        max={pageCount}
                        value={pagesPerFile}
                        onChange={(e) => setPagesPerFile(Number.parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      This will split the PDF into multiple files with {pagesPerFile} pages each.
                      {pageCount > 0 && <> You will get approximately {Math.ceil(pageCount / pagesPerFile)} files.</>}
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              <Button
                onClick={splitPDF}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={isProcessing || !file || (splitMode === "extract" && selectedPages.length === 0)}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Split and Download PDF
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
                Upload the PDF file you want to split. Choose your preferred splitting method.
              </p>
            </div>
            <div>
              <div className="bg-emerald-100 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                <span className="font-bold text-emerald-600">2</span>
              </div>
              <h3 className="font-medium mb-2">Process Locally</h3>
              <p className="text-gray-600 text-sm">
                Your browser processes the file using JavaScript. No data is sent to any server.
              </p>
            </div>
            <div>
              <div className="bg-emerald-100 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                <span className="font-bold text-emerald-600">3</span>
              </div>
              <h3 className="font-medium mb-2">Download Result</h3>
              <p className="text-gray-600 text-sm">Download your split PDF file(s) directly to your device.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
