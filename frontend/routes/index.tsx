import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { useData } from '../context/DataContext';

import DashboardPage from '../pages/DashboardPage';
import TimelinePage from '../pages/TimelinePage';
import MedicalRecordsPageWrapper from '../pages/MedicalRecordsPage';
import ExamsPageWrapper from '../pages/ExamsPage';
import VaccinesPage from '../pages/VaccinesPage';
import NutritionalCurvePage from '../pages/NutritionalCurvePage';
import TipsPage from '../pages/TipsPage';
import CommunityPage from '../pages/CommunityPage';
import SetupPage from '../pages/SetupPage';
import NotificationsPageWrapper from '../pages/NotificationsPage';
import Login from '../components/Login';
import Register from '../components/Register';

// Wrapper components to inject context data into pages
const DashboardWrapper = () => {
    const { pregnancyData, currentUser, consultations } = useData();
    const lastConsultation = consultations.length > 0 ? consultations[consultations.length - 1] : null;
    const currentWeight = lastConsultation ? lastConsultation.currentWeight : (pregnancyData?.initialWeight || 60);

    // Simple navigation placeholder
    const onViewTips = () => window.location.href = '/tips';

    if (!pregnancyData || !currentUser) return <div>Carregando...</div>;

    return <DashboardPage data={pregnancyData} user={currentUser} currentWeight={currentWeight} onViewTips={onViewTips} />;
};

const TimelineWrapper = () => {
    const { pregnancyData } = useData();
    // Re-calculating here or moving logic to hook
    const currentWeek = pregnancyData ? (new Date().getTime() - new Date(pregnancyData.dum).getTime()) / (1000 * 60 * 60 * 24 * 7) : 0; // Simplified
    return <TimelinePage currentWeek={Math.floor(currentWeek)} />;
};

const MedicalRecordsWrapper = () => {
    const { consultations, currentUser } = useData();
    if (!currentUser) return null;
    return <MedicalRecordsPageWrapper consultations={consultations} userRole={currentUser.role} />;
};

const ExamsWrapper = () => {
    const { currentUser } = useData();
    if (!currentUser) return null;
    return <ExamsPageWrapper userRole={currentUser.role} exams={[]} />;
};

const NotificationsWrapper = () => {
    return <NotificationsPageWrapper fullPage />;
};


// Auth Guard
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { currentUser } = useData();
    if (!currentUser) return <Navigate to="/login" replace />;
    return <MainLayout>{children}</MainLayout>;
};

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <LoginWrapper />
    },
    {
        path: "/register",
        element: <RegisterWrapper />
    },
    {
        path: "/",
        element: <ProtectedRoute><DashboardWrapper /></ProtectedRoute>
    },
    {
        path: "/timeline",
        element: <ProtectedRoute><TimelineWrapper /></ProtectedRoute>
    },
    {
        path: "/medical-records",
        element: <ProtectedRoute><MedicalRecordsWrapper /></ProtectedRoute>
    },
    {
        path: "/exams",
        element: <ProtectedRoute><ExamsWrapper /></ProtectedRoute>
    },
    {
        path: "/vaccines",
        element: <ProtectedRoute><VaccinesPage /></ProtectedRoute>
    },
    {
        path: "/nutritional-curve",
        element: <ProtectedRoute><NutritionalCurvePage /></ProtectedRoute>
    },
    {
        path: "/tips",
        element: <ProtectedRoute><TipsPage /></ProtectedRoute>
    },
    {
        path: "/community",
        element: <ProtectedRoute><CommunityPage /></ProtectedRoute>
    },
    {
        path: "/setup",
        element: <ProtectedRoute><SetupPage /></ProtectedRoute>
    },
    {
        path: "/notifications",
        element: <ProtectedRoute><NotificationsWrapper /></ProtectedRoute>
    }
]);

function LoginWrapper() {
    const { login } = useData();
    const { currentUser } = useData();
    if (currentUser) return <Navigate to="/" replace />;

    // We need to inject the navigation logic into Login component or handle it here
    // But Login component uses props. Since we act as "container", we provide the handler.
    // However, the original Login component calls a prop function 'onRegisterClick'.
    // We should probably refactor Login to use Links, but for now we wrap it.

    return <Login onRegisterClick={() => window.location.href = '/register'} />;
}

function RegisterWrapper() {
    const { register } = useData();
    return <Register onBack={() => window.location.href = '/login'} />;
}
