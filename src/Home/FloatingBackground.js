"use client"

const FloatingBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Large floating circles */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-purple-200/30 rounded-full animate-float"></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-purple-300/40 rounded-full animate-float-slow"></div>
      <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-purple-100/25 rounded-full animate-float-reverse"></div>
      <div className="absolute bottom-20 right-10 w-28 h-28 bg-purple-400/35 rounded-full animate-float"></div>

      {/* Medium floating elements */}
      <div className="absolute top-1/3 left-1/3 w-16 h-16 bg-purple-300/30 rounded-full animate-float-slow"></div>
      <div className="absolute top-2/3 right-1/3 w-20 h-20 bg-purple-200/40 rounded-full animate-float-reverse"></div>
      <div className="absolute top-1/2 left-20 w-12 h-12 bg-purple-400/25 rounded-full animate-float"></div>

      {/* Small floating dots */}
      <div className="absolute top-60 right-1/4 w-8 h-8 bg-purple-500/30 rounded-full animate-float-slow"></div>
      <div className="absolute bottom-60 left-1/2 w-6 h-6 bg-purple-300/40 rounded-full animate-float"></div>
      <div className="absolute top-80 left-3/4 w-10 h-10 bg-purple-200/35 rounded-full animate-float-reverse"></div>

      {/* Geometric shapes */}
      <div className="absolute top-1/4 right-1/2 w-14 h-14 bg-purple-300/25 rotate-45 animate-float-slow"></div>
      <div className="absolute bottom-1/4 left-1/2 w-18 h-18 bg-purple-400/30 rotate-12 animate-float"></div>
    </div>
  )
}

export default FloatingBackground
