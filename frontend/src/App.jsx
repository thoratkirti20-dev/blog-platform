import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Posts from "./pages/Posts";
import PostDetails from "./pages/PostDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Blog */}
        <Route
          path="/posts"
          element={<Posts />}
        />

        <Route
          path="/posts/:id"
          element={<PostDetails />}
        />

        {/* Default route */}
        <Route
          path="/"
          element={
            <Navigate
              to="/posts"
              replace
            />
          }
        />

        {/* Unknown route */}
        <Route
          path="*"
          element={
            <Navigate
              to="/posts"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;