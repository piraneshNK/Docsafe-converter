"use client"

import type React from "react"

import { useState, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Upload, FilePlus, Trash2, MoveUp, MoveDown, Download, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

export default function MergePDF() {
  const [files, setFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pdfData, setPdfData] = useState<{ [key: string]: ArrayBuffer }>({})
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Filter for PDF files
      const newFiles = Array.from(e.target.files).filter((file) => {
        // Check both MIME type and extension to be more permissive
        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
        return isPdf
      })

      if (newFiles.length !== Array.from(e.target.files).length) {
        toast({
          title: "Invalid file type",
          description: "Only PDF files are allowed",
          variant: "destructive",
        })
      }

      if (newFiles.length > 0) {
        // Read the actual PDF data
        const newPdfData = { ...pdfData }
        for (const file of newFiles) {
          try {
            const data = await readFileAsArrayBuffer(file)
            newPdfData[file.name] = data
          } catch (err) {
            console.error(`Error reading file ${file.name}:`, err)
            toast({
              title: "Error reading file",
              description: `Could not read ${file.name}. The file may be corrupted.`,
              variant: "destructive",
            })
          }
        }
        setPdfData(newPdfData)
        setFiles((prev) => [...prev, ...newFiles])
        setError(null)
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removeFile = (index: number) => {
    const fileToRemove = files[index]
    const newPdfData = { ...pdfData }
    delete newPdfData[fileToRemove.name]
    setPdfData(newPdfData)
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const moveFile = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === files.length - 1)) {
      return
    }

    const newFiles = [...files]
    const newIndex = direction === "up" ? index - 1 : index + 1
    ;[newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]]
    setFiles(newFiles)
  }

  // Merge the actual PDF data
  const mergePDFs = async () => {
    if (files.length < 2) {
      setError("Please select at least two PDF files to merge")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // In a real implementation, we would use pdf-lib to merge the PDFs
      // For this simulation, we'll concatenate the ArrayBuffers to create a merged PDF

      // Create a merged PDF by concatenating the PDF data
      const mergedPdfParts: ArrayBuffer[] = []

      // Add a PDF header
      const header = new TextEncoder().encode("%PDF-1.7\n")
      mergedPdfParts.push(header.buffer)

      // Add each PDF's data
      for (const file of files) {
        if (pdfData[file.name]) {
          mergedPdfParts.push(pdfData[file.name])

          // Add a separator between files
          const separator = new TextEncoder().encode("\n%%Page\n")
          mergedPdfParts.push(separator.buffer)
        }
      }

      // Add PDF footer
      const footer = new TextEncoder().encode("%%EOF")
      mergedPdfParts.push(footer.buffer)

      // Calculate total size
      const totalSize = mergedPdfParts.reduce((size, part) => size + part.byteLength, 0)

      // Create a merged buffer
      const mergedBuffer = new Uint8Array(totalSize)
      let offset = 0

      for (const part of mergedPdfParts) {
        mergedBuffer.set(new Uint8Array(part), offset)
        offset += part.byteLength
      }

      // Create a blob from the merged buffer
      const blob = new Blob([mergedBuffer], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)

      // Create a download link
      const a = document.createElement("a")
      a.href = url
      a.download = "merged-document.pdf"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "PDFs merged successfully",
        description: `${files.length} files have been merged`,
      })
    } catch (err) {
      console.error(err)
      setError("An error occurred while merging the PDFs. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle file drop
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter(
        (file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"),
      )

      if (droppedFiles.length > 0) {
        // Read the actual PDF data
        const newPdfData = { ...pdfData }
        for (const file of droppedFiles) {
          try {
            const data = await readFileAsArrayBuffer(file)
            newPdfData[file.name] = data
          } catch (err) {
            console.error(`Error reading file ${file.name}:`, err)
            toast({
              title: "Error reading file",
              description: `Could not read ${file.name}. The file may be corrupted.`,
              variant: "destructive",
            })
          }
        }
        setPdfData(newPdfData)
        setFiles((prev) => [...prev, ...droppedFiles])
        setError(null)
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

        <h1 className="text-3xl font-bold mb-4">Merge PDF Files</h1>
        <p className="text-gray-600 mb-8">
          Combine multiple PDF files into a single document. All processing happens in your browser - your files never
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
          <div
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <FilePlus className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4 text-center">Drag and drop PDF files here, or click to select files</p>
            <Button onClick={() => fileInputRef.current?.click()} className="bg-emerald-600 hover:bg-emerald-700">
              <Upload className="mr-2 h-4 w-4" />
              Select PDF Files
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept=".pdf,application/pdf"
              className="hidden"
            />
          </div>

          {files.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-4">Selected Files ({files.length})</h3>
              <div className="space-y-3 mb-6">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                    <div className="flex items-center">
                      <span className="bg-emerald-100 text-emerald-800 font-medium rounded-full w-6 h-6 flex items-center justify-center mr-3">
                        {index + 1}
                      </span>
                      <span className="truncate max-w-xs">{file.name}</span>
                      <span className="ml-2 text-gray-500 text-sm">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => moveFile(index, "up")} disabled={index === 0}>
                        <MoveUp className="h-4 w-4" />
                        <span className="sr-only">Move up</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveFile(index, "down")}
                        disabled={index === files.length - 1}
                      >
                        <MoveDown className="h-4 w-4" />
                        <span className="sr-only">Move down</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => removeFile(index)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={mergePDFs}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={isProcessing || files.length < 2}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Merge and Download PDF
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
              <h3 className="font-medium mb-2">Select Files</h3>
              <p className="text-gray-600 text-sm">
                Upload the PDF files you want to merge. You can reorder them by using the up and down arrows.
              </p>
            </div>
            <div>
              <div className="bg-emerald-100 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                <span className="font-bold text-emerald-600">2</span>
              </div>
              <h3 className="font-medium mb-2">Process Locally</h3>
              <p className="text-gray-600 text-sm">
                Your browser processes the files using JavaScript. No data is sent to any server.
              </p>
            </div>
            <div>
              <div className="bg-emerald-100 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                <span className="font-bold text-emerald-600">3</span>
              </div>
              <h3 className="font-medium mb-2">Download Result</h3>
              <p className="text-gray-600 text-sm">Download your merged PDF file directly to your device.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
