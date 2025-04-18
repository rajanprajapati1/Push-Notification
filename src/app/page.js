
export default function page (){
  return <>Push Notification Example
  <br/>
  step 1 . subscribe the fcm token by calling home page. token get registered temporary ;
  step 2 . for testing purpose just hit the localhost:3000/api/Push
  </>
}
// "use client"
// import { useState, useRef, useEffect } from "react"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { Card } from "@/components/ui/card"
// import { Loader2 } from "lucide-react"

// export default function Home() {
//   const [url, setUrl] = useState("")
//   const [proxyUrl, setProxyUrl] = useState("")
//   const [loading, setLoading] = useState(false)
//   const iframeRef = useRef(null)
//   const [iframeHeight, setIframeHeight] = useState("600px")

//   const handleSubmit = (e) => {
//     e.preventDefault()
//     if (!url) return

//     setLoading(true)

//     // Ensure URL has protocol
//     let processedUrl = url
//     if (!url.startsWith("http://") && !url.startsWith("https://")) {
//       processedUrl = "https://" + url
//     }

//      /tProxyUrl(`/api/proxy?url=${encodeURIComponent(processedUrl)}`)
//   }

//   useEffect(() => {
//     // Adjust iframe height to window size
//     const updateHeight = () => {
//       const headerHeight = 200 // Approximate header height
//       setIframeHeight(`${window.innerHeight - headerHeight}px`)
//     }

//     updateHeight()
//     window.addEventListener("resize", updateHeight)

//     return () => window.removeEventListener("resize", updateHeight)
//   }, [])

//   useEffect(() => {
//     if (proxyUrl && iframeRef.current) {
//       const iframe = iframeRef.current

//       // Handle iframe load event
//       const handleLoad = () => {
//         setLoading(false)

//         // Try to access iframe content (may fail due to same-origin policy)
//         try {
//           const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
//           if (iframeDoc) {
//             // Successfully accessed iframe content
//             console.log("Iframe loaded successfully")
//           }
//         } catch (error) {
//           console.log("Cannot access iframe content due to same-origin policy")
//         }
//       }

//       iframe.addEventListener("load", handleLoad)
//       return () => iframe.removeEventListener("load", handleLoad)
//     }
//   }, [proxyUrl])

//   return (
//     <main className="flex min-h-screen flex-col items-center p-4 sm:p-8">
//       <Card className="w-full max-w-4xl p-6 shadow-lg">
//         <h1 className="text-2xl font-bold mb-6 text-center">Dynamic Web Proxy</h1>

//         <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mb-6">
//           <Input
//             type="text"
//             value={url}
//             onChange={(e) => setUrl(e.target.value)}
//             placeholder="Enter URL (e.g., example.com)"
//             className="flex-grow"
//           />
//           <Button type="submit" disabled={loading}>
//             {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Proxy"}
//           </Button>
//         </form>

//         {loading && (
//           <div className="flex justify-center my-4">
//             <Loader2 className="h-8 w-8 animate-spin text-primary" />
//           </div>
//         )}

//         {proxyUrl && (
//           <div className="w-full border rounded-md overflow-hidden bg-gray-50">
//             <div className="p-2 bg-gray-100 border-b flex justify-between items-center">
//               <span className="text-sm truncate">{url}</span>
//               <Button variant="outline" size="sm" onClick={() => window.open(proxyUrl, "_blank")}>
//                 Open in New Tab
//               </Button>
//             </div>
//             <iframe
//               ref={iframeRef}
//               src={proxyUrl}
//               className="w-full border-0"
//               style={{ height: iframeHeight }}
//               sandbox="allow-same-origin allow-scripts allow-forms"
//             />
//           </div>
//         )}
//       </Card>
//     </main>
//   )
// }
