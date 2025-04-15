import Link from "next/link"
import { FileText, FilePlus, FileOutput, FileDigit, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function PDFTools() {
  const pdfTools = [
    {
      id: "merge-pdf",
      title: "Merge PDF",
      description: "Combine multiple PDF files into one document",
      icon: <FilePlus className="h-8 w-8 text-emerald-600" />,
      content: "Easily merge multiple PDFs into a single document with custom ordering.",
    },
    {
      id: "split-pdf",
      title: "Split PDF",
      description: "Extract pages or split PDF into multiple files",
      icon: <FileDigit className="h-8 w-8 text-emerald-600" />,
      content: "Split large PDFs into smaller documents or extract specific pages.",
    },
    {
      id: "compress-pdf",
      title: "Compress PDF",
      description: "Reduce PDF file size while maintaining quality",
      icon: <FileText className="h-8 w-8 text-emerald-600" />,
      content: "Compress PDF files to save storage space and make sharing easier.",
    },
    {
      id: "pdf-to-image",
      title: "PDF to Image",
      description: "Convert PDF pages to JPG, PNG or WebP images",
      icon: <FileOutput className="h-8 w-8 text-emerald-600" />,
      content: "Extract and convert individual pages or the entire PDF to high-quality images.",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">PDF Tools</h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            Process your PDF files directly in your browser. No uploads, no tracking, 100% private.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
          {pdfTools.map((tool) => (
            <Card key={tool.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="mb-4">{tool.icon}</div>
                <CardTitle className="text-2xl">{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{tool.content}</p>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t">
                <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <Link href={`/pdf-tools/${tool.id}`}>Use {tool.title}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 bg-emerald-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">How Our PDF Tools Work</h2>
          <p className="text-gray-600 mb-6">
            All our PDF tools work entirely in your browser using JavaScript. Your files never leave your device,
            ensuring complete privacy and security.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <span className="font-bold text-emerald-600">1</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Select Files</h3>
              <p className="text-gray-600">Choose the PDF files you want to process from your device.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <span className="font-bold text-emerald-600">2</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Process Locally</h3>
              <p className="text-gray-600">
                Your browser processes the files using JavaScript, with no server uploads.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <span className="font-bold text-emerald-600">3</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Download Result</h3>
              <p className="text-gray-600">Download your processed PDF files directly to your device.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
