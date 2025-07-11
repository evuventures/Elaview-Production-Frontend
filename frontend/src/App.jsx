// src/App.jsx
import './App.css'
import Pages from "@/pages/Index.jsx"
import { Toaster } from "@/components/ui/toaster"
import VerificationModal from '@/components/verification/VerificationModal' // ✅ ADDED: Global verification modal

function App() {
  return (
    <>
      <Pages />
      <Toaster />
      <VerificationModal /> {/* ✅ ADDED: Global verification modal that handles all verification across the app */}
    </>
  )
}

export default App