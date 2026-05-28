import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Home } from "@/pages/Home";
import { EventDetail } from "@/pages/EventDetail";
import { Search } from "@/pages/Search";
import { Settings } from "@/pages/Settings";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { Notifications } from "@/pages/Notifications";

function NotFound() {
  return (
    <div className="container py-24 text-center space-y-3">
      <div className="text-6xl">🎟️</div>
      <h1 className="text-2xl font-black">Page Not Found</h1>
      <a href="/" className="text-primary hover:underline text-sm">Back to home</a>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/search" element={<Search />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
