import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';

export const useStore = (session) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayDataMap, setDayDataMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  // NEW Workspace State
  const [workspaceTasks, setWorkspaceTasks] = useState([]);
  const [activeTimerId, setActiveTimerId] = useState(null);

  // Profile & Settings
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('zen_profile');
    return saved ? JSON.parse(saved) : { fullName: '', theme: 'light' };
  });

  // Effect to apply theme immediately and persist profile
  useEffect(() => {
    if (profile.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('zen_profile', JSON.stringify(profile));
  }, [profile]);

  // NEW Gamification State
  const [rewards, setRewards] = useState({
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
  });

  // NEW Notes State
  const [notes, setNotes] = useState([]);
  const [images, setImages] = useState([]);

  // FETCH ALL DATA FROM SUPABASE
  const fetchAllData = useCallback(async () => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    try {
      // 1. Fetch Profile/Rewards
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profileData) {
        // Only update if we have meaningful data from Supabase
        // Otherwise keep the one from localStorage (already in state)
        const supProfile = {
          fullName: profileData.full_name || profile.fullName || session.user.user_metadata?.full_name || '',
          theme: profileData.theme || profile.theme || 'light'
        };
        
        // Update state and localStorage
        setProfile(supProfile);
        localStorage.setItem('zen_profile', JSON.stringify(supProfile));
        setRewards(prev => ({
          ...prev,
          trophies: profileData.trophies,
          bronzeCoins: profileData.bronze_coins,
          silverCoins: profileData.silver_coins,
          goldCoins: profileData.gold_coins,
          silverShields: profileData.silver_shields,
          goldCrowns: profileData.gold_crowns,
          totalScore: profileData.total_score,
          dailyScore: profileData.daily_score,
          yearlyScore: profileData.yearly_score
        }));
      }

      // 2. Fetch Reward History
      const { data: history } = await supabase
        .from('reward_history')
        .select('*')
        .eq('user_id', session.user.id)
        .order('timestamp', { ascending: false });
      
      if (history) {
        setRewards(prev => ({ ...prev, history }));
      }

      // 3. Fetch Notes
      const { data: notesData } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false });
      
      if (notesData && notesData.length > 0) {
        setNotes(notesData);
      } else {
        // Create initial note
        const initialNote = {
          user_id: session.user.id,
          content: '<h1>ยินดีต้อนรับสู่ TaskaZen</h1><p>จดบันทึกของคุณที่นี่...</p>',
          template: 'blank',
          style: { fontSize: '18px', align: 'left' },
          floating_boxes: [],
          arrows: []
        };
        const { data } = await supabase.from('notes').insert(initialNote).select().single();
        if (data) setNotes([data]);
      }

      // 4. Fetch Images
      const { data: imagesData } = await supabase
        .from('images')
        .select('*')
        .eq('user_id', session.user.id);
      
      if (imagesData) setImages(imagesData);

      // 5. Fetch Days & Tasks (Simplify for initial load, maybe fetch only current month)
      const { data: daysData } = await supabase
        .from('days')
        .select('*, tasks(*)')
        .eq('user_id', session.user.id);
      
      if (daysData && daysData.length > 0) {
        const map = {};
        daysData.forEach(day => {
          map[day.date] = {
            notes: day.notes,
            category: day.category,
            tasks: day.tasks || []
          };
        });
        setDayDataMap(map);
      } else {
        // Initialize empty day for today if not found
        const todayStr = new Date().toISOString().split('T')[0];
        setDayDataMap({ [todayStr]: { notes: '', category: 'work', tasks: [] } });
      }

      // 6. Fetch Workspace Tasks
      const { data: wsTasks } = await supabase
        .from('workspace_tasks')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (wsTasks) {
        setWorkspaceTasks(wsTasks.map(t => ({
          ...t,
          totalSeconds: t.total_seconds,
          currentSeconds: t.current_seconds,
          expectedXp: t.expected_xp,
          xpEarned: t.xp_earned
        })));
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchAllData();
    }
  }, [session, fetchAllData]);

  const addScore = async (score) => {
    const newTotal = rewards.totalScore + score;
    const newTrophies = rewards.trophies + Math.floor((rewards.totalScore + score) / 500) - Math.floor(rewards.totalScore / 500);
    
    setRewards(prev => ({
      ...prev,
      totalScore: newTotal,
      dailyScore: prev.dailyScore + score,
      yearlyScore: prev.yearlyScore + score,
      trophies: newTrophies
    }));

    if (session) {
      await supabase.from('profiles').update({
        total_score: newTotal,
        daily_score: rewards.dailyScore + score,
        yearly_score: rewards.yearlyScore + score,
        trophies: newTrophies,
        updated_at: new Date().toISOString()
      }).eq('id', session.user.id);
    }
  };

  const exchangeReward = async (type) => {
    let success = false;
    let rewardItem = "";
    let updates = {};

    switch(type) {
      case 'bronzeCoin':
        if (rewards.trophies >= 10) {
          updates = { trophies: rewards.trophies - 10, bronze_coins: rewards.bronzeCoins + 1 };
          rewardItem = "เหรียญทองแดง";
          success = true;
        }
        break;
      case 'silverCoin':
        if (rewards.bronzeCoins >= 3) {
          updates = { bronze_coins: rewards.bronzeCoins - 3, silver_coins: rewards.silverCoins + 1 };
          rewardItem = "เหรียญเงิน";
          success = true;
        }
        break;
      case 'goldCoin':
        if (rewards.silverCoins >= 5) {
          updates = { silver_coins: rewards.silverCoins - 5, gold_coins: rewards.goldCoins + 1 };
          rewardItem = "เหรียญทอง";
          success = true;
        }
        break;
      case 'silverShield':
        if (rewards.goldCoins >= 7) {
          updates = { gold_coins: rewards.goldCoins - 7, silver_shields: rewards.silverShields + 1 };
          rewardItem = "โล่ดาวสีเงิน";
          success = true;
        }
        break;
      case 'goldCrown':
        if (rewards.silverShields >= 3) {
          updates = { silver_shields: rewards.silverShields - 3, gold_crowns: rewards.goldCrowns + 1 };
          rewardItem = "มงกุฏสีทอง";
          success = true;
        }
        break;
    }

    if (success && session) {
      const { data: newHistory } = await supabase.from('reward_history').insert({
        user_id: session.user.id,
        type: 'exchange',
        item: rewardItem
      }).select().single();

      await supabase.from('profiles').update({
        ...updates,
        updated_at: new Date().toISOString()
      }).eq('id', session.user.id);

      setRewards(prev => ({
        ...prev,
        trophies: updates.trophies ?? prev.trophies,
        bronzeCoins: updates.bronze_coins ?? prev.bronzeCoins,
        silverCoins: updates.silver_coins ?? prev.silverCoins,
        goldCoins: updates.gold_coins ?? prev.goldCoins,
        silverShields: updates.silver_shields ?? prev.silverShields,
        goldCrowns: updates.gold_crowns ?? prev.goldCrowns,
        history: [newHistory, ...prev.history]
      }));
    }
  };

  const addImage = async (imageData) => {
    if (!session) return;
    // In a real app, you should upload to Supabase Storage and get URL
    // For now, we continue with Base64 but save to DB
    const { data } = await supabase.from('images').insert({
      user_id: session.user.id,
      url: imageData
    }).select().single();
    
    if (data) setImages(prev => [data, ...prev]);
  };

  const deleteImage = async (id) => {
    if (!session) return;
    await supabase.from('images').delete().eq('id', id);
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const addNote = async (template = 'blank') => {
    if (!session) return;
    const newNote = {
      user_id: session.user.id,
      content: '<h1>TASKAZEN NOTE</h1><p>เริ่มพิมพ์บันทึกอิสระที่นี่...</p>',
      template,
      style: { fontSize: '18px', align: 'left' },
      floating_boxes: [],
      arrows: []
    };
    
    const { data } = await supabase.from('notes').insert(newNote).select().single();
    if (data) {
      setNotes(prev => [data, ...prev]);
      return data.id;
    }
  };

  const updateNote = async (id, updates) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
    if (session) {
      // Map camelCase to snake_case if necessary for complex objects
      const dbUpdates = { ...updates, updated_at: new Date().toISOString() };
      if (updates.floatingBoxes) {
        dbUpdates.floating_boxes = updates.floatingBoxes;
        delete dbUpdates.floatingBoxes;
      }
      await supabase.from('notes').update(dbUpdates).eq('id', id);
    }
  };

  const deleteNote = async (id) => {
    if (session) {
      await supabase.from('notes').delete().eq('id', id);
    }
    setNotes(prev => {
      const filtered = prev.filter(n => n.id !== id);
      return filtered;
    });
  };

  const setMonth = (offset) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const setToday = () => setCurrentDate(new Date());

  const updateUserProfile = async (updates) => {
    if (!session) return;
    
    // Convert camelCase to snake_case for DB
    const dbUpdates = {};
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.theme !== undefined) dbUpdates.theme = updates.theme;
    
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    localStorage.setItem('zen_profile', JSON.stringify(newProfile));
    
    await supabase
      .from('profiles')
      .update({ ...dbUpdates, updated_at: new Date().toISOString() })
      .eq('id', session.user.id);
  };

  const saveData = async (dateStr, data) => {
    setDayDataMap(prev => ({ ...prev, [dateStr]: data }));
    
    if (session) {
      // 1. Upsert Day
      const { data: dayRecord } = await supabase.from('days').upsert({
        user_id: session.user.id,
        date: dateStr,
        notes: data.notes,
        category: data.category,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,date' }).select().single();

      if (dayRecord && data.tasks) {
        // 2. Sync Tasks (Delete old, insert new for simplicity in this version)
        await supabase.from('tasks').delete().eq('day_id', dayRecord.id);
        if (data.tasks.length > 0) {
          const tasksToInsert = data.tasks.map(t => ({
            day_id: dayRecord.id,
            text: t.text,
            time: t.time,
            priority: t.priority,
            difficulty: t.difficulty,
            level: t.level,
            color: t.color,
            category: t.category,
            completed: t.completed,
            subtasks: t.subtasks
          }));
          await supabase.from('tasks').insert(tasksToInsert);
        }
      }
    }
  };

  const addWorkspaceTask = async (task) => {
    if (!session) return;
    const newTask = {
      user_id: session.user.id,
      text: task.text,
      total_seconds: task.totalSeconds,
      current_seconds: task.totalSeconds,
      expected_xp: task.expectedXp,
      status: 'idle'
    };
    
    const { data } = await supabase.from('workspace_tasks').insert(newTask).select().single();
    if (data) {
      // Map back to camelCase for UI
      const uiTask = {
        ...data,
        totalSeconds: data.total_seconds,
        currentSeconds: data.current_seconds,
        expectedXp: data.expected_xp,
        xpEarned: data.xp_earned || 0
      };
      setWorkspaceTasks(prev => [uiTask, ...prev]);
      return uiTask.id;
    }
  };

  const startTimer = async (id) => {
    setWorkspaceTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'running' } : t));
    setActiveTimerId(id);
    if (session) {
      await supabase.from('workspace_tasks').update({ status: 'running' }).eq('id', id);
    }
  };

  const updateTaskTime = (id, newSeconds) => {
    setWorkspaceTasks(prev => prev.map(t => t.id === id ? { ...t, currentSeconds: newSeconds } : t));
    // Optional: Sync time to DB every few seconds or on pause
  };

  const completeWorkspaceTask = async (id, finalSeconds, earnedXp, status) => {
    setWorkspaceTasks(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, status, currentSeconds: finalSeconds, xpEarned: earnedXp };
      }
      return t;
    }));
    setActiveTimerId(null);
    
    if (session) {
      await supabase.from('workspace_tasks').update({
        status,
        current_seconds: finalSeconds,
        xp_earned: earnedXp
      }).eq('id', id);

      if (status === 'success') {
        await addScore(earnedXp);
        // Bonus trophy logic
        await supabase.from('profiles').update({
          trophies: rewards.trophies + 1
        }).eq('id', session.user.id);
        setRewards(prev => ({ ...prev, trophies: prev.trophies + 1 }));
      } else if (status === 'failed') {
        await addScore(-earnedXp);
      }
    }
  };

  return { 
    isLoading,
    currentDate, setCurrentDate, selectedDate, setSelectedDate, setMonth, setToday, dayDataMap, saveData,
    workspaceTasks, activeTimerId, addWorkspaceTask, startTimer, updateTaskTime, completeWorkspaceTask,
    notes, addNote, updateNote, deleteNote,
    images, addImage, deleteImage,
    rewards, addScore, exchangeReward,
    profile, updateUserProfile,
    session // Add session to returned object
  };
};

