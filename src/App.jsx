import { BrowserRouter, Route, Routes } from "react-router-dom";
import TopNav from "./components/TopNav";
import ClaimLookupPage from "./pages/ClaimLookupPage";
import DonorPage from "./pages/DonorPage";
import HomePage from "./pages/HomePage";
import ResponderPage from "./pages/ResponderPage";

function App() {
  return (
    <BrowserRouter>
      <main className="midnight-shell min-h-screen text-slate-100">
        <div className="three-bg pointer-events-none fixed inset-0 -z-20" />
        <div className="grid-floor pointer-events-none fixed inset-0 -z-10" />
        <TopNav />
        <div className="main-shell">
          <Routes>
            <Route element={<HomePage />} path="/" />
            <Route element={<DonorPage />} path="/donor" />
            <Route element={<ResponderPage />} path="/responder" />
            <Route element={<ClaimLookupPage />} path="/claim-lookup" />
          </Routes>
        </div>
      </main>
    </BrowserRouter>
  );
}

export default App;
