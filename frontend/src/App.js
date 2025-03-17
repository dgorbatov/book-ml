import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Upload from './components/Upload';
import PDFList from './components/PDFList';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="nav-menu">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/upload">Upload PDF</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
        </Routes>
      </div>
    </Router>
  );
}

// Home component now includes PDFList
function Home() {
  return (
    <div className="home">
      <h1>Welcome to PDF Analyzer</h1>
      <p>Use the navigation menu to upload and analyze PDFs.</p>
      <PDFList />
    </div>
  );
}

export default App;
