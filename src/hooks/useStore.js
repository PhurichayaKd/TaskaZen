import { useState, useEffect } from 'react';

export const useStore = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayDataMap, setDayDataMap] = useState({});
  
  // NEW Workspace State
  const [workspaceTasks, setWorkspaceTasks] = useState([]);
  const [activeTimerId, setActiveTimerId] = useState(null);

  // NEW Gamification State
  const [rewards, setRewards] = useState(() => {
    const saved = localStorage.getItem('taskazen_rewards');
    if (saved) return JSON.parse(saved);
    return {
      trophies: 0,
      bronzeCoins: 0,
      silverCoins: 0,
      goldCoins: 0,
      silverShields: 0,
      goldCrowns: 0,
      totalScore: 0,
      dailyScore: 0,
      yearlyScore: 0,
      history: []
    };
  });

  useEffect(() => {
    localStorage.setItem('taskazen_rewards', JSON.stringify(rewards));
  }, [rewards]);

  const addScore = (score) => {
    setRewards(prev => ({
      ...prev,
      totalScore: prev.totalScore + score,
      dailyScore: prev.dailyScore + score,
      yearlyScore: prev.yearlyScore + score,
      // Every 500 score gives a trophy now to make it faster to test
      trophies: prev.trophies + Math.floor((prev.totalScore + score) / 500) - Math.floor(prev.totalScore / 500)
    }));
  };

  const exchangeReward = (type) => {
    setRewards(prev => {
      const next = { ...prev };
      let success = false;
      let rewardItem = "";

      switch(type) {
        case 'bronzeCoin':
          if (prev.trophies >= 10) {
            next.trophies -= 10;
            next.bronzeCoins += 1;
            success = true;
            rewardItem = "เหรียญทองแดง";
          }
          break;
        case 'silverCoin':
          if (prev.bronzeCoins >= 3) {
            next.bronzeCoins -= 3;
            next.silverCoins += 1;
            success = true;
            rewardItem = "เหรียญเงิน";
          }
          break;
        case 'goldCoin':
          if (prev.silverCoins >= 5) {
            next.silverCoins -= 5;
            next.goldCoins += 1;
            success = true;
            rewardItem = "เหรียญทอง";
          }
          break;
        case 'silverShield':
          if (prev.goldCoins >= 7) {
            next.goldCoins -= 7;
            next.silverShields += 1;
            success = true;
            rewardItem = "โล่ดาวสีเงิน";
          }
          break;
        case 'goldCrown':
          if (prev.silverShields >= 3) {
            next.silverShields -= 3;
            next.goldCrowns += 1;
            success = true;
            rewardItem = "มงกุฏสีทอง";
          }
          break;
      }

      if (success) {
        next.history = [{
          id: Date.now().toString(),
          type: 'exchange',
          item: rewardItem,
          timestamp: new Date().toISOString()
        }, ...prev.history];
        return next;
      }
      return prev;
    });
  };

  // NEW Notes State
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('taskazen_notes');
    if (saved) return JSON.parse(saved);
    return [{ id: '1', content: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }];
  });

  const [images, setImages] = useState(() => {
    const saved = localStorage.getItem('taskazen_images');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('taskazen_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('taskazen_images', JSON.stringify(images));
  }, [images]);

  const addImage = (imageData) => {
    const newImage = { id: Date.now().toString(), url: imageData, createdAt: new Date().toISOString() };
    setImages(prev => [newImage, ...prev]);
  };

  const deleteImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const addNote = (template = 'blank') => {
    const newNote = {
      id: Date.now().toString(),
      content: '<h1>TASKAZEN NOTE</h1><p>เริ่มพิมพ์บันทึกอิสระที่นี่...</p>', // No fixed color, just standard H1
      template,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      style: {
        fontSize: '18px',
        align: 'left',
      },
      floatingBoxes: [], // { id, x, y, content, color, isLocked }
      arrows: [] 
    };
    setNotes(prev => [...prev, newNote]);
    return newNote.id;
  };

  const updateNote = (id, updates) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n));
  };

  const deleteNote = (id) => {
    setNotes(prev => {
      const filtered = prev.filter(n => n.id !== id);
      return filtered.length > 0 ? filtered : [{ id: Date.now().toString(), content: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }];
    });
  };

  const setMonth = (offset) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const setToday = () => setCurrentDate(new Date());

  const saveData = (dateStr, data) => {
    setDayDataMap(prev => ({ ...prev, [dateStr]: data }));
  };

  // NEW Workspace Actions
  const addWorkspaceTask = (task) => {
    const newTask = { ...task, id: Date.now().toString(), status: 'idle', xpEarned: 0 };
    setWorkspaceTasks(prev => [newTask, ...prev]);
    return newTask.id;
  };

  const startTimer = (id) => {
    setWorkspaceTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'running' } : t));
    setActiveTimerId(id);
  };

  const updateTaskTime = (id, newSeconds) => {
    setWorkspaceTasks(prev => prev.map(t => t.id === id ? { ...t, currentSeconds: newSeconds } : t));
  };

  const completeWorkspaceTask = (id, finalSeconds, earnedXp, status) => {
    setWorkspaceTasks(prev => prev.map(t => {
      if (t.id === id) {
        // No bonus XP, just use expectedXp
        let finalXp = t.expectedXp;
        if (status === 'failed') {
          finalXp = -t.expectedXp; // Subtract if failed
        }
        return { ...t, status, currentSeconds: finalSeconds, xpEarned: finalXp };
      }
      return t;
    }));
    setActiveTimerId(null);
    
    // Update Rewards
    if (status === 'success') {
      const task = workspaceTasks.find(t => t.id === id);
      const finalXp = task ? task.expectedXp : 0;
      
      addScore(finalXp);
      setRewards(prev => ({
        ...prev,
        trophies: prev.trophies + 1 // Gain 1 trophy for each successful mission
      }));
    } else if (status === 'failed') {
      const task = workspaceTasks.find(t => t.id === id);
      const finalXp = task ? task.expectedXp : 0;
      addScore(-finalXp); // Subtract score if failed
    }
  };

  return { 
    currentDate, selectedDate, setSelectedDate, setMonth, setToday, dayDataMap, saveData,
    workspaceTasks, activeTimerId, addWorkspaceTask, startTimer, updateTaskTime, completeWorkspaceTask,
    notes, addNote, updateNote, deleteNote,
    images, addImage, deleteImage,
    rewards, addScore, exchangeReward
  };
};
