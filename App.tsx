
import React, { useState, useEffect } from 'react';
import { AuthMode, Can, CreditCard } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CardDashboard from './components/CardDashboard';
import CollectionMenu from './components/CollectionMenu';
import AchievementsView from './components/AchievementsView';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, query } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAaktjUPFaB1smtx1YMcteC8I49BiK9Ync",
  authDomain: "colecao-dfc2e.firebaseapp.com",
  projectId: "colecao-dfc2e",
  storageBucket: "colecao-dfc2e.firebasestorage.app",
  messagingSenderId: "643629773339",
  appId: "1:643629773339:web:b1f81ca42e8b125b067ebe",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [cans, setCans] = useState<Can[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [view, setView] = useState<'menu' | 'cans' | 'achievements' | 'cards'>('menu');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) setView('menu');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setCans([]);
      setCards([]);
      return;
    }

    setSyncStatus('syncing');
    
    // Listen for Cans
    const cansRef = collection(db, 'users', user.uid, 'cans');
    const unsubCans = onSnapshot(query(cansRef), (snapshot) => {
      setCans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Can)));
    });

    // Listen for Cards
    const cardsRef = collection(db, 'users', user.uid, 'cards');
    const unsubCards = onSnapshot(query(cardsRef), (snapshot) => {
      setCards(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CreditCard)));
      setSyncStatus('synced');
      setTimeout(() => setSyncStatus('idle'), 2000);
    });

    return () => { unsubCans(); unsubCards(); };
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen gradient-bg text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg font-bold tracking-widest uppercase">Iniciando...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Login auth={auth} />;

  return (
    <div className="min-h-screen">
      {view === 'menu' && (
        <CollectionMenu 
          user={user} 
          cans={cans} 
          cards={cards}
          onSelectCans={() => setView('cans')} 
          onSelectCards={() => setView('cards')}
          onViewAchievements={() => setView('achievements')}
          auth={auth}
        />
      )}
      {view === 'achievements' && (
        <AchievementsView 
          cans={cans} 
          onBack={() => setView('menu')} 
        />
      )}
      {view === 'cans' && (
        <Dashboard 
          user={user} 
          cans={cans} 
          db={db} 
          auth={auth} 
          syncStatus={syncStatus}
          onBack={() => setView('menu')}
        />
      )}
      {view === 'cards' && (
        <CardDashboard 
          user={user} 
          cards={cards} 
          db={db} 
          auth={auth} 
          syncStatus={syncStatus}
          onBack={() => setView('menu')}
        />
      )}
    </div>
  );
};

export default App;
