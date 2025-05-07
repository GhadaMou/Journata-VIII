import { BrowserRouter, Route, Routes } from "react-router-dom"
import HomePage from "./pages/HomePage"
import AppLayout from "./pages/AppLayout"
import { MyContextProvider } from "./contexts/MyContext";
import ProfileDashboard from "./pages/ProfileDashboard";
import MyInbox from "./components/MyInbox";
import ResetPassword from "./components/ResetPassword";
import LoginForm from "./components/LoginForm";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <MyContextProvider>
    <BrowserRouter>
      <Routes>
        <Route index element={ <HomePage /> } />
        <Route path="app" element={ <AppLayout /> } />
        <Route path="profile" element={ <ProfileDashboard /> } />
        <Route path="/inbox" element={<MyInbox />} />
        <Route path="/reset-password" element={<ResetPassword />} />

      </Routes>
      <ToastContainer />
    </BrowserRouter>
    </MyContextProvider>
  )
}

export default App;
