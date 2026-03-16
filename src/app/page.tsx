import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="inline-block px-4 py-1.5 mb-4 text-sm font-medium tracking-wide text-blue-400 uppercase bg-blue-400/10 border border-blue-400/20 rounded-full">
          Agency Management Platform
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
          AgencyOS
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
          Gestiona tus proyectos, clientes y tareas con Inteligencia Artificial. 
          Reportes ejecutivos en segundos con OpenRouter.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link 
            href="/signup" 
            className="w-full sm:w-auto px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-all text-center shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            Comenzar gratis
          </Link>
          <Link 
            href="/login" 
            className="w-full sm:w-auto px-8 py-4 bg-transparent border border-white/10 hover:bg-white/5 rounded-lg font-semibold transition-all text-center"
          >
            Iniciar sesión
          </Link>
        </div>

        <div className="pt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
            <h3 className="text-lg font-semibold mb-2">IA Integrada</h3>
            <p className="text-gray-400 text-sm">Genera reportes para tus clientes automáticamente usando los mejores modelos a través de OpenRouter.</p>
          </div>
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
            <h3 className="text-lg font-semibold mb-2">Gestión de Roles</h3>
            <p className="text-gray-400 text-sm">Control de acceso granular para Owner, Project Manager, Developers y Clientes.</p>
          </div>
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
            <h3 className="text-lg font-semibold mb-2">Aislamiento Total</h3>
            <p className="text-gray-400 text-sm">Tus datos están seguros en un esquema dedicado, fuera de la vista de otros proyectos.</p>
          </div>
        </div>
      </div>
    </main>
  )
}
