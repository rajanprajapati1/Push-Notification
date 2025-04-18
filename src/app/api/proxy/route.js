import { NextResponse } from "next/server"
import { parse } from "node-html-parser"

// Headers that should be removed to allow iframe embedding
const HEADERS_TO_REMOVE = [
    "x-frame-options",
    "content-security-policy",
    "content-security-policy-report-only",
    "clear-site-data",
    "cross-origin-embedder-policy",
    "cross-origin-opener-policy",
    "cross-origin-resource-policy",
]

export async function GET(request) {
    const url = request.nextUrl.searchParams.get("url")

    if (!url) {
        return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
    }

    try {
        // Fetch the target URL
        const response = await fetch(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        })

        // Get the response content type
        const contentType = response.headers.get("content-type") || ""

        // Create a new response with modified headers
        const newHeaders = new Headers()

        // Copy original headers except those we want to remove
        response.headers.forEach((value, key) => {
            if (!HEADERS_TO_REMOVE.includes(key.toLowerCase())) {
                newHeaders.set(key, value)
            }
        })

        // Set CORS headers to allow embedding
        newHeaders.set("Access-Control-Allow-Origin", "*")

        // Process different content types
        if (contentType.includes("text/html")) {
            // For HTML content, we need to rewrite links
            const html = await response.text()
            const processedHtml = processHtml(html, url)

            return new NextResponse(processedHtml, {
                status: response.status,
                headers: newHeaders,
            })
        } else if (
            contentType.includes("text/css") ||
            contentType.includes("application/javascript") ||
            contentType.includes("text/javascript")
        ) {
            // For CSS and JS, we might need to rewrite URLs
            const text = await response.text()
            const processedText = processText(text, url)

            return new NextResponse(processedText, {
                status: response.status,
                headers: newHeaders,
            })
        } else {
            // For other content types (images, etc.), pass through
            const blob = await response.blob()

            return new NextResponse(blob, {
                status: response.status,
                headers: newHeaders,
            })
        }
    } catch (error) {
        console.error("Proxy error:", error)
        return NextResponse.json(
            { error: "Failed to proxy the request", details: (error).message },
            { status: 500 },
        )
    }
}

// Process HTML to rewrite links and resources
function processHtml(html, baseUrl) {
    try {
        const root = parse(html)

        // Rewrite all links
        root.querySelectorAll("a").forEach((link) => {
            const href = link.getAttribute("href")
            if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
                const absoluteUrl = new URL(href, baseUrl).toString()
                link.setAttribute("href", `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`)
                // Add target="_top" to break out of frames if needed
                link.setAttribute("target", "_top")
            }
        })

        // Rewrite all resources (img, script, link[rel=stylesheet])
        root.querySelectorAll("img, script, iframe").forEach((el) => {
            const srcAttr = el.getAttribute("src")
            if (srcAttr && !srcAttr.startsWith("data:")) {
                const absoluteUrl = new URL(srcAttr, baseUrl).toString()
                el.setAttribute("src", `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`)
            }

            // Handle srcset for images
            const srcsetAttr = el.getAttribute("srcset")
            if (srcsetAttr) {
                const newSrcset = srcsetAttr
                    .split(",")
                    .map((src) => {
                        const [url, size] = src.trim().split(" ")
                        if (url) {
                            const absoluteUrl = new URL(url, baseUrl).toString()
                            return `/api/proxy?url=${encodeURIComponent(absoluteUrl)} ${size || ""}`
                        }
                        return src
                    })
                    .join(", ")

                el.setAttribute("srcset", newSrcset)
            }
        })

        // Handle CSS links
        root.querySelectorAll('link[rel="stylesheet"]').forEach((el) => {
            const href = el.getAttribute("href")
            if (href) {
                const absoluteUrl = new URL(href, baseUrl).toString()
                el.setAttribute("href", `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`)
            }
        })

        // Add base target to handle links
        const head = root.querySelector("head")
        if (head) {
            const baseEl = parse('<base target="_top" />').firstChild
            head.appendChild(baseEl)
        }

        // Add a script to help with navigation
        const script = parse(`
      <script>
        // Intercept form submissions
        document.addEventListener('submit', function(e) {
          const form = e.target;
          if (form.tagName === 'FORM') {
            e.preventDefault();
            
            // Get the form action
            let action = form.action || window.location.href;
            
            // Handle relative URLs
            if (!action.startsWith('http')) {
              action = new URL(action, window.location.href).toString();
            }
            
            // Redirect through our proxy
            const proxyUrl = '/api/proxy?url=' + encodeURIComponent(action);
            
            // Handle different methods
            if (form.method.toLowerCase() === 'post') {
              // For POST, we'd need a more complex solution
              // This is simplified and won't work for all cases
              const formData = new FormData(form);
              fetch(proxyUrl, {
                method: 'POST',
                body: formData
              })
              .then(response => response.text())
              .then(html => {
                document.open();
                document.write(html);
                document.close();
              });
            } else {
              // For GET, just redirect
              window.location.href = proxyUrl;
            }
          }
        });
      </script>
    `).firstChild

        if (head) {
            head.appendChild(script)
        }

        return root.toString()
    } catch (error) {
        console.error("Error processing HTML:", error)
        return html // Return original if processing fails
    }
}

// Process CSS or JS to rewrite URLs
function processText(text, baseUrl) {
    // Simple regex to find URLs in CSS or JS
    // This is a basic implementation and might not catch all cases
    return text.replace(/url$$['"]?([^'")]+)['"]?$$/g, (match, url) => {
        if (url.startsWith("data:") || url.startsWith("#")) {
            return match // Don't modify data URLs or anchors
        }

        try {
            const absoluteUrl = new URL(url, baseUrl).toString()
            return `url("/api/proxy?url=${encodeURIComponent(absoluteUrl)}")`
        } catch (e) {
            return match // Return original on error
        }
    })
}

// Handle POST requests for form submissions
export async function POST(request) {
    const url = request.nextUrl.searchParams.get("url")

    if (!url) {
        return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
    }

    try {
        // Get the form data from the request
        const formData = await request.formData()

        // Forward the POST request to the target URL
        const response = await fetch(url, {
            method: "POST",
            body: formData,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        })

        // Process the response similar to GET
        const contentType = response.headers.get("content-type") || ""
        const newHeaders = new Headers()

        response.headers.forEach((value, key) => {
            if (!HEADERS_TO_REMOVE.includes(key.toLowerCase())) {
                newHeaders.set(key, value)
            }
        })

        newHeaders.set("Access-Control-Allow-Origin", "*")

        if (contentType.includes("text/html")) {
            const html = await response.text()
            const processedHtml = processHtml(html, url)

            return new NextResponse(processedHtml, {
                status: response.status,
                headers: newHeaders,
            })
        } else {
            const blob = await response.blob()

            return new NextResponse(blob, {
                status: response.status,
                headers: newHeaders,
            })
        }
    } catch (error) {
        console.error("Proxy error:", error)
        return NextResponse.json(
            { error: "Failed to proxy the request", details: (error).message },
            { status: 500 },
        )
    }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
    const headers = new Headers({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    })

    return new NextResponse(null, { status: 204, headers })
}
