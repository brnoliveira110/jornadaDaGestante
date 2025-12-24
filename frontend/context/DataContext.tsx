import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User, PregnancyData, Consultation, Vaccine, ExamResult, Post, Alert, UserRole, BloodType, Comment, Tip
} from '../types';
import {
  INITIAL_TIPS,
  MOCK_VACCINES
} from '../constants';
import { api } from '../services/api';
import Cookies from 'js-cookie';

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
  updateConsultation: (consultation: Consultation) => Promise<void>;
  addExamRequest: (name: string, date?: string) => Promise<void>;
  addVaccine: (vaccine: Vaccine) => Promise<void>;
  addExamResult: (exam: ExamResult) => Promise<void>;

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

  // Notificações
  requestNotificationPermission: () => Promise<void>;
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
    // 1. Tenta recuperar sessão salva dos Cookies
    const savedUser = Cookies.get('currentUser');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
      } catch (e) {
        console.error("Erro ao recuperar sessão", e);
        Cookies.remove('currentUser');
      }
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadUserData(currentUser.id);
    } else {
      // Clear data regardless of method
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
      const found = users.find(u =>
        u.name.trim().toLowerCase() === username.trim().toLowerCase() ||
        u.name.trim().toLowerCase().includes(username.trim().toLowerCase())
      );

      if (found) {
        setCurrentUser(found);
        // Salva nos Cookies por 7 dias
        Cookies.set('currentUser', JSON.stringify(found), { expires: 7, sameSite: 'Strict' });
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
        weightGoalMax: 12,
        theme: 'NEUTRAL'
      };

      await api.createPregnancyData(initialPregnancyData);

      setCurrentUser(createdUser);
      // Salva nos Cookies por 7 dias
      Cookies.set('currentUser', JSON.stringify(createdUser), { expires: 7, sameSite: 'Strict' });
      return true; // Success
    } catch (e) {
      console.error("Register failed", e);
      return false; // Failed
    }
  };

  const logout = () => {
    setCurrentUser(null);
    Cookies.remove('currentUser');
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

  const updateConsultation = async (consultation: Consultation) => {
    if (!currentUser) return;
    consultation.patientId = currentUser.id;
    await api.updateConsultation(consultation);
    setConsultations(consultations.map(c => c.id === consultation.id ? consultation : c));
  };

  const addExamRequest = async (name: string, date?: string) => {
    if (!currentUser) return;
    // ensure date is ISO string if provided, else use current time
    let validDate = new Date().toISOString();
    if (date) {
      try {
        validDate = new Date(date).toISOString();
      } catch (e) { console.error('Invalid date, using now'); }
    }

    const newExam: ExamResult = {
      id: crypto.randomUUID(),
      patientId: currentUser.id,
      name,
      date: validDate,
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

  // --- Notificações ---
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert("Este navegador não suporta notificações.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      new Notification("Jornada da Gestante", { body: "Notificações ativadas! Te avisaremos sobre seus exames." });
    }
  };

  useEffect(() => {
    const checkReminders = () => {
      if (!exams || exams.length === 0) return;

      exams.forEach(exam => {
        if (exam.status === 'REQUESTED') {
          const examDate = new Date(exam.date);
          const today = new Date();
          const diffTime = examDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays >= 0 && diffDays <= 2) {
            const title = "Lembrete de Exame";
            const body = `O exame ${exam.name} está agendado para ${new Date(exam.date).toLocaleDateString()}.`;

            if (Notification.permission === 'granted') {
              // Tag prevents duplicate notifications
              new Notification(title, { body, tag: `exam-${exam.id}` });
            }
          }
        }
      });
    };

    // Check on load and periodically
    checkReminders();
    const interval = setInterval(checkReminders, 4 * 60 * 60 * 1000); // 4 hours
    return () => clearInterval(interval);
  }, [exams]);

  return (
    <DataContext.Provider value={{
      currentUser, login, register, logout,
      pregnancyData,
      consultations,
      vaccines,
      exams,
      alerts, tips, posts,
      updatePregnancyData,
      addConsultation, updateConsultation, addExamRequest, addVaccine, addExamResult,
      markAlertRead,
      toggleConsultationStatus, toggleVaccineStatus, toggleExamRealized,
      addPost, addComment, likePost, requestNotificationPermission
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