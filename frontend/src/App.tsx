import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import ModernDashboard from '@/components/layout/ModernDashboard'

function App() {
  return (
    <TooltipProvider>
      <Router>
        <div className="min-h-screen bg-background font-sans antialiased">
          <ModernDashboard />
          <Toaster
            position="top-right"
            richColors
            theme="dark"
            toastOptions={{
              style: {
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--card-foreground))',
              },
            }}
          />
        </div>
      </Router>
    </TooltipProvider>
  )
}

export default App