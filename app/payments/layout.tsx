"use client";
import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function MonochromaticLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          inter.className,
          "min-h-screen bg-zinc-950 text-gray-200 antialiased selection:bg-zinc-950 selection:text-white"
        )}
      >
        <div className="relative flex min-h-screen flex-col bg-zinc-950">
          {/* Header */}
          <header className="sticky top-0 z-50 w-full border-b border-gray-800/40 bg-zinc-950 backdrop-blur supports-[backdrop-filter]:bg-zinc-950 ">
            <div className="container flex h-16 items-center justify-between">
              <div className="flex items-center space-x-4">
                <a 
                  href="/" 
                  className="text-xl font-semibold tracking-tighter text-white hover:text-gray-200 transition-colors"
                >
                  MWONYA
                </a>
              </div>
              
              {/* Header Navigation */}
              <nav className="hidden md:flex space-x-6">
                <a 
                  href="/features" 
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Features
                </a>
                <a 
                  href="/support" 
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Support
                </a>
                <a 
                  href="/account" 
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Account
                </a>
              </nav>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 mt-8 ">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="relative py-6">
                {children}
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t border-gray-800/40 bg-zinc-950  mt-auto">
            <div className="container py-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Company Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                    Company
                  </h3>
                  <div className="flex flex-col space-y-2">
                    <a href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">
                      About
                    </a>
                    <a href="/careers" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Careers
                    </a>
                    <a href="/press" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Press
                    </a>
                  </div>
                </div>

                {/* Legal */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                    Legal
                  </h3>
                  <div className="flex flex-col space-y-2">
                    <a href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Privacy
                    </a>
                    <a href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Terms
                    </a>
                    <a href="/cookies" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Cookies
                    </a>
                  </div>
                </div>

                {/* Support */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                    Support
                  </h3>
                  <div className="flex flex-col space-y-2">
                    <a href="/help" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Help Center
                    </a>
                    <a href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Contact Us
                    </a>
                    <a href="/status" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Status
                    </a>
                  </div>
                </div>

                {/* Social */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                    Connect
                  </h3>
                  <div className="flex flex-col space-y-2">
                    <a href="/twitter" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Twitter
                    </a>
                    <a href="/instagram" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Instagram
                    </a>
                    <a href="/facebook" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Facebook
                    </a>
                  </div>
                </div>
              </div>

              {/* Bottom Footer */}
              <div className="mt-8 pt-8 border-t border-gray-800/40">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <p className="text-sm text-gray-400">
                    © {new Date().getFullYear()} Mwonya. All rights reserved.
                  </p>
                  <div className="mt-4 md:mt-0">
                    <p className="text-sm text-gray-400">
                      Made with precision in Uganda
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}