// Defines the main frontend routes and animated page transitions.
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

import Login from './pages/Login'
import Register from './pages/Register'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Account from './pages/Account'
import Profile from './pages/Profile'
import Experiences from './pages/Experiences'
import Jobs from './pages/Jobs'
import GenerateCV from './pages/GenerateCV'
import Documents from './pages/Documents'
import Notifications from './pages/Notifications'
import Subscription from './pages/Subscription'

function AnimatedRoutes() {
	const location = useLocation()
	return (
		<AnimatePresence mode="wait">
			<Routes location={location} key={location.pathname}>
				<Route path="/" element={<Login />} />
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />

				<Route path="/" element={<DashboardLayout />}>
					<Route path="dashboard" element={<Dashboard />} />
					<Route path="account" element={<Account />} />
					<Route path="profile" element={<Profile />} />
					<Route path="experiences" element={<Experiences />} />
					<Route path="jobs" element={<Jobs />} />
					<Route path="generate" element={<GenerateCV />} />
					<Route path="documents" element={<Documents />} />
					<Route path="notifications" element={<Notifications />} />
					<Route path="subscription" element={<Subscription />} />
				</Route>
			</Routes>
		</AnimatePresence>
	)
}

export default function App() {
	return (
		<BrowserRouter>
			<AnimatedRoutes />
		</BrowserRouter>
	)
}
