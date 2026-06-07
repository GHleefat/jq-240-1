import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Levels from "@/pages/Levels";
import Learn from "@/pages/Learn";
import Quiz from "@/pages/Quiz";
import Practice from "@/pages/Practice";
import RandomQuiz from "@/pages/RandomQuiz";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/levels" element={<Levels />} />
        <Route path="/learn/:type/:row" element={<Learn />} />
        <Route path="/quiz/:type/:row" element={<Quiz />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/random-quiz" element={<RandomQuiz />} />
      </Routes>
    </Router>
  );
}
