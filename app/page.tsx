import Link from "next/link"
import { FileText, ImageIcon, Shield, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-emerald-600" />
            <span className="font-bold text-xl">DocSafeConverter</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/pdf-tools" className="text-gray-600 hover:text-gray-900 transition-colors">
              PDF Tools
            </Link>
            <Link href="/image-tools" className="text-gray-600 hover:text-gray-900 transition-colors">
              Image Tools
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
              About
            </Link>
          </nav>
          <Button variant="outline" className="md:hidden">
            Menu
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-emerald-50 to-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">DocSafeConverter: Privacy-First Document Tools</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Convert, compress, and edit your documents and images directly in your browser. No uploads, no tracking,
            100% private.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/pdf-tools">
                Get Started with PDF Tools
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/image-tools">
                Explore Image Tools
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">100% Private</h3>
              <p className="text-gray-600">
                All processing happens directly in your browser. Your files never leave your device.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">PDF Tools</h3>
              <p className="text-gray-600">
                Merge, split, compress, and convert PDFs without compromising your privacy.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Image Tools</h3>
              <p className="text-gray-600">Resize, convert, compress, and edit images directly in your browser.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Tools</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>PDF to Image</CardTitle>
                <CardDescription>Convert PDF pages to JPG, PNG or WebP images</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Extract and convert individual pages or the entire PDF to high-quality images.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/pdf-tools/pdf-to-image">Convert PDF to Image</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Merge PDFs</CardTitle>
                <CardDescription>Combine multiple PDF files into one document</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Easily merge multiple PDFs into a single document with custom ordering.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/pdf-tools/merge-pdf">Merge PDFs</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Image Converter</CardTitle>
                <CardDescription>Convert between JPG, PNG, WebP and more</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Convert images between different formats while preserving quality.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/image-tools/convert">Convert Images</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>PDF Compressor</CardTitle>
                <CardDescription>Reduce PDF file size while maintaining quality</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Compress PDF files to save storage space and make sharing easier.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/pdf-tools/compress-pdf">Compress PDF</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Image Resizer</CardTitle>
                <CardDescription>Resize images to your desired dimensions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Easily resize images by dimensions or percentage while maintaining aspect ratio.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/image-tools/resize">Resize Images</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Split PDF</CardTitle>
                <CardDescription>Extract pages or split PDF into multiple files</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Split large PDFs into smaller documents or extract specific pages.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/pdf-tools/split-pdf">Split PDF</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-emerald-50 rounded-xl p-8 md:p-12 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
              <h2 className="text-3xl font-bold mb-4">Your Privacy Is Our Priority</h2>
              <p className="text-gray-600 mb-4">
                DocSafeConverter processes all files directly in your browser. Your documents never leave your device,
                ensuring complete privacy and security.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Shield className="h-5 w-5 text-emerald-600 mr-2 mt-0.5" />
                  <span>No server uploads or processing</span>
                </li>
                <li className="flex items-start">
                  <Shield className="h-5 w-5 text-emerald-600 mr-2 mt-0.5" />
                  <span>Works offline after initial page load</span>
                </li>
                <li className="flex items-start">
                  <Shield className="h-5 w-5 text-emerald-600 mr-2 mt-0.5" />
                  <span>No tracking or analytics</span>
                </li>
              </ul>
            </div>
            <div className="md:w-1/2">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-4">How We Ensure Your Privacy</h3>
                <p className="text-gray-600 mb-4">Our tools use JavaScript APIs that run entirely in your browser:</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <div className="bg-emerald-100 rounded-full p-1 mr-2">
                      <FileText className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span>PDF processing with PDF.js and pdf-lib</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-emerald-100 rounded-full p-1 mr-2">
                      <ImageIcon className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span>Image processing with Canvas API</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-emerald-100 rounded-full p-1 mr-2">
                      <Shield className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span>File handling with File API</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-6 w-6 text-emerald-400" />
                <span className="font-bold text-xl">DocSafeConverter</span>
              </div>
              <p className="text-gray-400 max-w-md">
                Privacy-first document and image tools that work entirely in your browser. No uploads, no tracking, 100%
                private.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold text-lg mb-4">PDF Tools</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/pdf-tools/merge-pdf" className="text-gray-400 hover:text-white transition-colors">
                      Merge PDF
                    </Link>
                  </li>
                  <li>
                    <Link href="/pdf-tools/split-pdf" className="text-gray-400 hover:text-white transition-colors">
                      Split PDF
                    </Link>
                  </li>
                  <li>
                    <Link href="/pdf-tools/compress-pdf" className="text-gray-400 hover:text-white transition-colors">
                      Compress PDF
                    </Link>
                  </li>
                  <li>
                    <Link href="/pdf-tools/pdf-to-image" className="text-gray-400 hover:text-white transition-colors">
                      PDF to Image
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-4">Image Tools</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/image-tools/convert" className="text-gray-400 hover:text-white transition-colors">
                      Convert Images
                    </Link>
                  </li>
                  <li>
                    <Link href="/image-tools/resize" className="text-gray-400 hover:text-white transition-colors">
                      Resize Images
                    </Link>
                  </li>
                  <li>
                    <Link href="/image-tools/compress" className="text-gray-400 hover:text-white transition-colors">
                      Compress Images
                    </Link>
                  </li>
                  <li>
                    <Link href="/image-tools/crop" className="text-gray-400 hover:text-white transition-colors">
                      Crop Images
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-4">About</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} DocSafeConverter. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
