export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-space-950">
      {/* Gradient Mesh Background */}
      <div className="absolute inset-0">
        {/* Blob 1 - Top left cosmic purple */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-cosmic-500 rounded-full blur-[150px] opacity-20 animate-blob" />

        {/* Blob 2 - Top right nebula */}
        <div className="absolute -top-20 -right-40 w-[500px] h-[500px] bg-nebula-500 rounded-full blur-[150px] opacity-15 animate-blob animation-delay-2000" />

        {/* Blob 3 - Bottom center */}
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-cosmic-400 rounded-full blur-[150px] opacity-15 animate-blob animation-delay-4000" />

        {/* Blob 4 - Mid left accent */}
        <div className="absolute top-1/2 -left-20 w-[400px] h-[400px] bg-nebula-400 rounded-full blur-[120px] opacity-10" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(124,58,237,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(124,58,237,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
