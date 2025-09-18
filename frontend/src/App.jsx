// src/App.jsx

import Pages from "@/pages/Pages.js"
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