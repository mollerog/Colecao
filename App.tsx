
import React, { useState, useEffect } from 'react';
import { AuthMode, Can, CreditCard, CarMiniature } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CardDashboard from './components/CardDashboard';
import CarDashboard from './components/CarDashboard';
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
  const [carMiniatures, setCarMiniatures] = useState<CarMiniature[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [view, setView] = useState<'menu' | 'cans' | 'achievements' | 'cards' | 'cars'>('menu');
  const [triggerAdd, setTriggerAdd] = useState(0);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // If the state has a 'modal' flag, we let the component handle it
      if (event.state && event.state.modal) return;

      if (event.state && event.state.view) {
        setView(event.state.view);
      } else {
        setView('menu');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (newView: typeof view) => {
    if (newView !== view) {
      window.history.pushState({ view: newView }, '');
      setView(newView);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        // Reset history on login to menu
        window.history.replaceState({ view: 'menu' }, '');
        setView('menu');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setCans([]);
      setCards([]);
      setCarMiniatures([]);
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
    });

    // Listen for Cars
    const carsRef = collection(db, 'users', user.uid, 'cars');
    const unsubCars = onSnapshot(query(carsRef), (snapshot) => {
      setCarMiniatures(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CarMiniature)));
      setSyncStatus('synced');
      setTimeout(() => setSyncStatus('idle'), 2000);
    });

    return () => { unsubCans(); unsubCards(); unsubCars(); };
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
          cars={carMiniatures}
          onSelectCans={() => navigateTo('cans')} 
          onSelectCards={() => navigateTo('cards')}
          onSelectCars={() => navigateTo('cars')}
          onViewAchievements={() => navigateTo('achievements')}
          auth={auth}
        />
      )}
      {view === 'achievements' && (
        <AchievementsView 
          cans={cans} 
          onBack={() => window.history.back()} 
        />
      )}
      {view === 'cans' && (
        <Dashboard 
          user={user} 
          cans={cans} 
          db={db} 
          auth={auth} 
          syncStatus={syncStatus}
          onBack={() => window.history.back()}
          externalAddTrigger={triggerAdd}
        />
      )}
      {view === 'cards' && (
        <CardDashboard 
          user={user} 
          cards={cards} 
          db={db} 
          auth={auth} 
          syncStatus={syncStatus}
          onBack={() => window.history.back()}
          externalAddTrigger={triggerAdd}
        />
      )}
      {view === 'cars' && (
        <CarDashboard 
          user={user} 
          cars={carMiniatures} 
          db={db} 
          auth={auth} 
          syncStatus={syncStatus}
          onBack={() => window.history.back()}
          externalAddTrigger={triggerAdd}
        />
      )}
    </div>
  );
};

export default App;
