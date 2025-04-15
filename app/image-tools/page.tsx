import Link from "next/link"
import { ImageIcon, ImagePlus, Crop, FileOutput, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ImageTools() {
  const imageTools = [
    {
      id: "convert",
      title: "Image Converter",
      description: "Convert between JPG, PNG, WebP and more",
      icon: <FileOutput className="h-8 w-8 text-emerald-600" />,
      content: "Convert images between different formats while preserving quality.",
    },
    {
      id: "resize",
      title: "Image Resizer",
      description: "Resize images to your desired dimensions",
      icon: <ImagePlus className="h-8 w-8 text-emerald-600" />,
      content: "Easily resize images by dimensions or percentage while maintaining aspect ratio.",
    },
    {
      id: "compress",
      title: "Image Compressor",
      description: "Reduce image file size while maintaining quality",
      icon: <ImageIcon className="h-8 w-8 text-emerald-600" />,
      content: "Compress images to save storage space and make sharing easier.",
    },
    {
      id: "crop",
      title: "Image Cropper",
      description: "Crop and adjust images to your needs",
      icon: <Crop className="h-8 w-8 text-emerald-600" />,
      content: "Crop images to specific dimensions or aspect ratios.",
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
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Image Tools</h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            Process your images directly in your browser. No uploads, no tracking, 100% private.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
          {imageTools.map((tool) => (
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
                  <Link href={`/image-tools/${tool.id}`}>Use {tool.title}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 bg-emerald-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">How Our Image Tools Work</h2>
          <p className="text-gray-600 mb-6">
            All our image tools work entirely in your browser using the Canvas API. Your files never leave your device,
            ensuring complete privacy and security.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <span className="font-bold text-emerald-600">1</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Select Images</h3>
              <p className="text-gray-600">Choose the images you want to process from your device.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <span className="font-bold text-emerald-600">2</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Process Locally</h3>
              <p className="text-gray-600">
                Your browser processes the images using Canvas API, with no server uploads.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <span className="font-bold text-emerald-600">3</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Download Result</h3>
              <p className="text-gray-600">Download your processed images directly to your device.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
