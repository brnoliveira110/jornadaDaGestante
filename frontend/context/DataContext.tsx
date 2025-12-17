import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User, PregnancyData, Consultation, Vaccine, ExamResult, Post, Alert, UserRole, BloodType, Comment, Tip
} from '../types';
import {
  INITIAL_TIPS,
  MOCK_VACCINES
} from '../constants';
import { api } from '../services/api';

// Interfaces do Contexto Simplificadas
interface DataContextType {
  currentUser: User | null;
  login: (username: string) => Promise<boolean>;
  register: (name: string, email: string) => Promise<boolean>;
  logout: () => void;

  // Dados da Gestante Logada
  pregnancyData: PregnancyData | null;
  consultations: Consultation[];
  vaccines: Vaccine[];
  exams: ExamResult[];
  alerts: Alert[];
  tips: Tip[];

  // Ações de Autogestão
  updatePregnancyData: (data: Partial<PregnancyData>) => Promise<void>;
  addConsultation: (consultation: Consultation) => Promise<void>;
  addExamRequest: (name: string) => Promise<void>;
  addVaccine: (vaccine: Vaccine) => Promise<void>;
  addExamResult: (exam: ExamResult) => Promise<void>;
  uploadExamResult: (file: File, name: string) => Promise<void>;
  markAlertRead: (id: string) => Promise<void>;

  // Toggles
  toggleConsultationStatus: (id: string) => Promise<void>;
  toggleVaccineStatus: (id: string) => Promise<void>;
  toggleExamRealized: (id: string) => Promise<void>;

  // Comunidade
  posts: Post[];
  addPost: (content: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Estados de Dados
  const [pregnancyData, setPregnancyData] = useState<PregnancyData | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [exams, setExams] = useState<ExamResult[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [tips, setTips] = useState<Tip[]>(INITIAL_TIPS);

  // Load tips from API or keep static if preferred? 
  // We'll keep static INITIAL_TIPS for now but fetch others.

  useEffect(() => {
    if (currentUser) {
      loadUserData(currentUser.id);
    } else {
      // Clear data
      setPregnancyData(null);
      setConsultations([]);
      setVaccines([]);
      setExams([]);
      setAlerts([]);
    }
    loadCommunityPosts();
  }, [currentUser]);

  const loadUserData = async (userId: string) => {
    try {
      const pData = await api.getPregnancyData(userId).catch(() => null);
      if (pData) setPregnancyData(pData);

      const consults = await api.getConsultations(userId).catch(() => []);
      setConsultations(consults);

      const vacs = await api.getVaccines(userId).catch(() => []);
      setVaccines(vacs);

      const exms = await api.getExams(userId).catch(() => []);
      setExams(exms);

      const alrts = await api.getAlerts(userId).catch(() => []);
      setAlerts(alrts);

    } catch (error) {
      console.error("Failed to load user data", error);
    }
  };

  const loadCommunityPosts = async () => {
    try {
      const allPosts = await api.getPosts().catch(() => []);
      setPosts(allPosts);
    } catch (error) {
      console.error("Failed to load posts", error);
    }
  };

  // --- Autenticação ---
  const login = async (username: string) => {
    try {
      const users = await api.getUsers();
      // Simple logic: find by name
      const found = users.find(u => u.name.toLowerCase() === username.toLowerCase() || u.name.toLowerCase().includes(username.toLowerCase()));

      if (found) {
        setCurrentUser(found);
        return true;
      }
      return false;
    } catch (e) {
      console.error("Login failed", e);
      return false;
    }
  };

  const register = async (name: string, email: string) => {
    try {
      const newUser: User = {
        id: crypto.randomUUID(),
        name: name,
        role: UserRole.PATIENT,
        avatarUrl: `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=F43F5E&color=fff`
      };

      const createdUser = await api.createUser(newUser);

      // Create initial empty pregnancy data
      const initialPregnancyData: PregnancyData = {
        id: crypto.randomUUID(),
        patientId: createdUser.id,
        dum: new Date().toISOString(), // Placeholder
        dpp: new Date().toISOString(),
        initialWeight: 60,
        preGestationalHeight: 165,
        preGestationalBMI: 22,
        bloodType: BloodType.A_POS,
        weightGoalMin: 9,
        weightGoalMax: 12
      };

      await api.createPregnancyData(initialPregnancyData);



      setCurrentUser(createdUser);
      return true; // Success
    } catch (e) {
      console.error("Register failed", e);
      return false; // Failed
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // --- Actions ---

  const updatePregnancyData = async (data: Partial<PregnancyData>) => {
    if (!pregnancyData) return;
    const updated = { ...pregnancyData, ...data };
    await api.updatePregnancyData(updated);
    setPregnancyData(updated);
  };

  const addConsultation = async (consultation: Consultation) => {
    consultation.patientId = currentUser?.id!;
    const saved = await api.createConsultation(consultation);
    setConsultations([...consultations, saved]);
  };

  const addExamRequest = async (name: string) => {
    if (!currentUser) return;
    const newExam: ExamResult = {
      id: crypto.randomUUID(),
      patientId: currentUser.id,
      name,
      date: new Date().toISOString(),
      type: 'PDF' as any,
      status: 'REQUESTED' as any,
      doctorName: 'Autogestão',
    };
    const saved = await api.createExam(newExam);
    setExams([saved, ...exams]);
  };

  const addVaccine = async (vaccine: Vaccine) => {
    if (!currentUser) return;
    vaccine.patientId = currentUser.id;
    const saved = await api.createVaccine(vaccine);
    setVaccines([...vaccines, saved]);
  };

  const addExamResult = async (exam: ExamResult) => {
    if (!currentUser) return;
    exam.patientId = currentUser.id;
    const saved = await api.createExam(exam);
    setExams([...exams, saved]);
  };

  const uploadExamResult = async (file: File, name: string) => {
    if (!currentUser) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('patientId', currentUser.id);
    formData.append('name', name);

    const saved = await api.uploadExam(formData);
    setExams([...exams, saved]);
  };

  const toggleConsultationStatus = async (id: string) => {
    const consultation = consultations.find(c => c.id === id);
    if (!consultation) return;

    // Toggle
    const newStatus = consultation.status === 'COMPLETED' ? 'SCHEDULED' : 'COMPLETED';
    const updated = { ...consultation, status: newStatus as any };
    await api.updateConsultation(updated);

    setConsultations(consultations.map(c => c.id === id ? updated : c));
  };

  const toggleVaccineStatus = async (id: string) => {
    const vaccine = vaccines.find(v => v.id === id);
    if (!vaccine) return;

    const newStatus = vaccine.status === 'DONE' ? 'PENDING' : 'DONE';
    const updated: Vaccine = {
      ...vaccine,
      status: newStatus as any,
      dateAdministered: newStatus === 'DONE' ? new Date().toISOString() : undefined
    };
    await api.updateVaccine(updated);
    setVaccines(vaccines.map(v => v.id === id ? updated : v));
  };

  const toggleExamRealized = async (id: string) => {
    const exam = exams.find(e => e.id === id);
    if (!exam) return;
    if (exam.status !== 'REQUESTED') return;

    const updated = { ...exam, status: 'REALIZED' as any };
    await api.updateExam(updated);
    setExams(exams.map(e => e.id === id ? updated : e));
  };

  const markAlertRead = async (id: string) => {
    await api.markAlertRead(id);
    setAlerts(alerts.map(a => a.id === id ? { ...a, read: true } : a));
  };

  // Community
  const addPost = async (content: string) => {
    if (!currentUser) return;
    const newPost: Post = {
      id: crypto.randomUUID(),
      authorName: currentUser.name,
      content,
      likes: 0,
      comments: [],
      timestamp: new Date().toISOString()
    };
    const saved = await api.createPost(newPost);
    saved.comments = []; // Ensure initialized
    setPosts([saved, ...posts]);
  };

  const addComment = async (postId: string, content: string) => {
    if (!currentUser) return;
    const newComment: Comment = {
      id: crypto.randomUUID(),
      postId,
      authorName: currentUser.name,
      content,
      timestamp: new Date().toISOString()
    };
    await api.addComment(postId, newComment);

    // Refresh posts/comments or manually update state
    const updatedPosts = posts.map(p => {
      if (p.id === postId) {
        return { ...p, comments: [...(p.comments || []), newComment] };
      }
      return p;
    });
    setPosts(updatedPosts);
  };

  const likePost = async (postId: string) => {
    await api.likePost(postId);
    setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
  };

  return (
    <DataContext.Provider value={{
      currentUser, login, register, logout,
      pregnancyData,
      consultations,
      vaccines,
      exams,
      alerts, tips, posts,
      updatePregnancyData,
      addConsultation, addExamRequest, addVaccine, addExamResult, uploadExamResult,
      markAlertRead,
      toggleConsultationStatus, toggleVaccineStatus, toggleExamRealized,
      addPost, addComment, likePost
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) throw new Error('useData must be used within a DataProvider');
  return context;
};