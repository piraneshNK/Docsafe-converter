import Link from "next/link"
import { ArrowLeft, Shield, FileText, ImageIcon, Github } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">About DocSafeConverter</h1>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <div className="flex items-center mb-6">
              <Shield className="h-10 w-10 text-emerald-600 mr-4" />
              <h2 className="text-2xl font-bold">Our Mission</h2>
            </div>
            <p className="text-gray-600 mb-4">
              DocSafeConverter was created with a simple mission: to provide powerful document and image tools that
              respect your privacy.
            </p>
            <p className="text-gray-600 mb-4">
              In today's digital world, many online tools require you to upload your files to their servers for
              processing. This raises serious privacy concerns, especially when dealing with sensitive documents.
            </p>
            <p className="text-gray-600">
              We believe there's a better way. By leveraging modern web technologies, we've built tools that run
              entirely in your browser. Your files never leave your device, ensuring complete privacy and security.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <div className="flex items-center mb-6">
              <FileText className="h-10 w-10 text-emerald-600 mr-4" />
              <h2 className="text-2xl font-bold">How It Works</h2>
            </div>
            <p className="text-gray-600 mb-4">
              DocSafeConverter uses modern JavaScript APIs to process your files directly in your browser:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-4">
              <li>
                <strong>PDF Processing:</strong> We use PDF.js and pdf-lib libraries to handle PDF operations like
                merging, splitting, and converting.
              </li>
              <li>
                <strong>Image Processing:</strong> We use the Canvas API to manipulate images, allowing for conversion,
                resizing, and compression.
              </li>
              <li>
                <strong>File Handling:</strong> We use the File API to read and write files directly on your device.
              </li>
            </ul>
            <p className="text-gray-600">
              Since all processing happens locally, you can even use DocSafeConverter offline after the initial page
              load.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <div className="flex items-center mb-6">
              <ImageIcon className="h-10 w-10 text-emerald-600 mr-4" />
              <h2 className="text-2xl font-bold">Our Tools</h2>
            </div>
            <p className="text-gray-600 mb-4">
              DocSafeConverter offers a variety of tools for working with PDFs and images:
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-semibold mb-2">PDF Tools</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-600">
                  <li>Merge PDFs</li>
                  <li>Split PDFs</li>
                  <li>Compress PDFs</li>
                  <li>Convert PDF to Images</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-semibold mb-2">Image Tools</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-600">
                  <li>Convert Images</li>
                  <li>Resize Images</li>
                  <li>Compress Images</li>
                  <li>Crop Images</li>
                </ul>
              </div>
            </div>
            <p className="text-gray-600">All our tools are designed to be simple, fast, and privacy-focused.</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center mb-6">
              <Github className="h-10 w-10 text-emerald-600 mr-4" />
              <h2 className="text-2xl font-bold">Open Source</h2>
            </div>
            <p className="text-gray-600 mb-4">
              DocSafeConverter is an open-source project. We believe in transparency and community collaboration.
            </p>
            <p className="text-gray-600 mb-4">By making our code open source, we allow anyone to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-4">
              <li>Verify that we're not collecting or transmitting your data</li>
              <li>Contribute improvements and new features</li>
              <li>Report bugs and security issues</li>
              <li>Learn from our implementation</li>
            </ul>
            <div className="flex justify-center">
              <Button className="bg-gray-800 hover:bg-gray-900">
                <Github className="mr-2 h-4 w-4" />
                View on GitHub
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
