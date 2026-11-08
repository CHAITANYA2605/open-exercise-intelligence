import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Docs from './pages/Docs'
import Explore from './pages/Explore'
import ExerciseDetail from './pages/ExerciseDetail'
import Playground from './pages/Playground'
import MediaContribution from './pages/MediaContribution'
import Community from './pages/Community'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/exercise/:slug" element={<ExerciseDetail />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/contribute/media" element={<MediaContribution />} />
          <Route path="/community" element={<Community />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
