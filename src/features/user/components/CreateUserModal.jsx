import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createDatabaseUser, updateDatabaseUser, fetchDatabaseUsers } from '../userSlice';
import { fetchDatabaseClasses } from '../../database/databaseSlice';

const PERM_MAPPING = {
  'Select': 1,
  'Insert': 2,
  'Update': 4,
  'Delete': 8,
  'Alter': 16,
  'Index': 32,
  'Execute': 64,
  'G.Select': 2048,   // Mapping for Grant bits
  'G.Insert': 4096,
  'G.Update': 8192,
  'G.Delete': 16384,
  'G.Alter': 32768,
  'G.Index': 65536,
  'G.Execute': 131072,
};

const decodeCUBRIDAuth = (maskStr) => {
  const mask = parseInt(maskStr || '0', 10);
  const result = {};
  Object.keys(PERM_MAPPING).forEach(key => {
    result[key] = !!(mask & PERM_MAPPING[key]);
  });
  return result;
};

const encodeCUBRIDAuth = (authObj) => {
  let mask = 0;
  Object.keys(PERM_MAPPING).forEach(key => {
    if (authObj[key]) mask |= PERM_MAPPING[key];
  });
  return String(mask);
};

export default function CreateUserModal({ isOpen, onClose, dbname, editingUser }) {
  const dispatch = useDispatch();
  const isEditMode = !!editingUser;
  const { selectedHostUid } = useSelector((state) => state.host);
  const databaseUsers = useSelector((state) => state.user.databaseUsers[dbname] || []);
  const loading = useSelector((state) => state.user.databaseUsersLoading[dbname]);
  
  const { databaseClasses, databaseClassesLoading, activeDatabases } = useSelector((state) => state.database);
  const currentDbClasses = databaseClasses[dbname];
  const isClassesLoading = databaseClassesLoading[dbname];

  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'auth'
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: '',
    memo: '',
    groups: [],
    members: [],
  });

  const [draggedItem, setDraggedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAvailable, setSelectedAvailable] = useState(null);
  const [selectedInTarget, setSelectedInTarget] = useState(null); // { item, target }
  
  // Resource Authorization States
  const [selectedObjectId, setSelectedObjectId] = useState('');
  const [objectSearchTerm, setObjectSearchTerm] = useState('');
  const [objectAuths, setObjectAuths] = useState({});

  useEffect(() => {
    if (isOpen && dbname && selectedHostUid) {
      dispatch(fetchDatabaseUsers({ hostUid: selectedHostUid, dbname }));
    }
    // Auto-populate PUBLIC if it exists in data
    if (isOpen && databaseUsers.length > 0) {
      const publicGroup = databaseUsers.find(u => u.name === 'PUBLIC');
      if (publicGroup && !formData.groups.some(g => g.name === 'PUBLIC')) {
        setFormData(prev => ({
          ...prev,
          groups: [...prev.groups, publicGroup]
        }));
      }
    }
    
    // Fetch real object data for auth tab
    if (isOpen && dbname && selectedHostUid) {
      const dbstatus = activeDatabases.includes(dbname) ? 'on' : 'off';
      dispatch(fetchDatabaseClasses({ hostUid: selectedHostUid, dbname, dbstatus }));
    }

    // If editing, find the user and populate form
    if (isOpen && isEditMode && databaseUsers.length > 0) {
      const userToEdit = databaseUsers.find(u => (u.name || u) === editingUser);
      if (userToEdit) {
        setFormData({
          name: userToEdit.name || userToEdit,
          password: '', // Don't show password
          confirmPassword: '',
          memo: userToEdit.comment || '',
          groups: userToEdit.groups || [],
          members: userToEdit.members || [],
        });
        
        // If the user has authorizations, populate objectAuths
        if (userToEdit.authorization && userToEdit.authorization[0]) {
          const authData = userToEdit.authorization[0];
          const newObjectAuths = {};
          Object.keys(authData).forEach(className => {
            if (className !== 'id' && className !== 'name') {
              newObjectAuths[className] = decodeCUBRIDAuth(authData[className]);
            }
          });
          setObjectAuths(newObjectAuths);
        }
      }
    } else if (isOpen && !isEditMode) {
      // Reset form for create mode
      setFormData({
        name: '',
        password: '',
        confirmPassword: '',
        memo: '',
        groups: [],
        members: [],
      });
    }
  }, [isOpen, dbname, selectedHostUid, dispatch, databaseUsers.length, activeDatabases, isEditMode, editingUser]);

  // Set initial selected object when classes load
  useEffect(() => {
    if (currentDbClasses && !selectedObjectId) {
      const firstClass = currentDbClasses.systemclass?.[0]?.class?.[0]?.classname;
      if (firstClass) setSelectedObjectId(firstClass);
    }
  }, [currentDbClasses, selectedObjectId]);

  // Force General tab for DBA user
  useEffect(() => {
    if (editingUser === 'DBA' && activeTab !== 'general') {
      setActiveTab('general');
    }
  }, [editingUser, activeTab]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const togglePermission = (objId, perm) => {
    setObjectAuths(prev => ({
      ...prev,
      [objId]: {
        ...(prev[objId] || {}),
        [perm]: !(prev[objId]?.[perm] || false)
      }
    }));
  };

  const handleDragStart = (e, item, source) => {
    setDraggedItem({ item, source });
    e.dataTransfer.setData('text/plain', item.name);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleMove = (item, source, target) => {
    if (!item || source === target) return;

    if (target === 'groups') {
      if (!formData.groups.some(g => g.name === item.name)) {
        setFormData(prev => ({
          ...prev,
          groups: [...prev.groups, item],
          members: prev.members.filter(m => m.name !== item.name)
        }));
      }
    } else if (target === 'members') {
      if (!formData.members.some(m => m.name === item.name)) {
        setFormData(prev => ({
          ...prev,
          members: [...prev.members, item],
          groups: prev.groups.filter(g => g.name !== item.name)
        }));
      }
    } else if (target === 'available') {
      setFormData(prev => ({
        ...prev,
        groups: prev.groups.filter(g => g.name !== item.name),
        members: prev.members.filter(m => m.name !== item.name)
      }));
    }
    
    // Clear selections
    setSelectedAvailable(null);
    setSelectedInTarget(null);
  };

  const handleDrop = (e, target) => {
    e.preventDefault();
    if (!draggedItem) return;
    handleMove(draggedItem.item, draggedItem.source, target);
    setDraggedItem(null);
  };

  const removeItem = (name, type) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter(i => i.name !== name)
    }));
  };

  const handleSelectAll = (objId) => {
    const allTrue = {
      Select: true, Insert: true, Update: true, Delete: true,
      Alter: true, Index: true, Execute: true,
      'G.Select': true, 'G.Insert': true, 'G.Update': true, 'G.Delete': true,
      'G.Alter': true, 'G.Index': true, 'G.Execute': true
    };
    setObjectAuths(prev => ({ ...prev, [objId]: allTrue }));
  };

  const handleClearAll = (objId) => {
    const allFalse = {
      Select: false, Insert: false, Update: false, Delete: false,
      Alter: false, Index: false, Execute: false,
      'G.Select': false, 'G.Insert': false, 'G.Update': false, 'G.Delete': false,
      'G.Alter': false, 'G.Index': false, 'G.Execute': false
    };
    setObjectAuths(prev => ({ ...prev, [objId]: allFalse }));
  };

  const handleSave = () => {
    if (!formData.name) return;

    // Format authorizations as a list of objects for the API
    const authList = Object.keys(objectAuths).map(objId => ({
      classname: objId,
      auth: encodeCUBRIDAuth(objectAuths[objId])
    }));

    if (isEditMode) {
      const updatePayload = {
        userpass: formData.password,
        groups: {
          group: formData.groups.map(g => g.name || g)
        },
        authorization: authList
      };

      dispatch(updateDatabaseUser({ 
        hostUid: selectedHostUid, 
        dbname, 
        userName: editingUser, 
        payload: updatePayload 
      })).unwrap().then(() => {
        dispatch(fetchDatabaseUsers({ hostUid: selectedHostUid, dbname }));
      });
    } else {
      const createPayload = {
        name: formData.name,
        password: formData.password,
        groups: formData.groups.map(g => g.name || g),
        members: formData.members.map(m => m.name || m),
        comment: formData.memo,
        auths: authList.reduce((acc, curr) => ({ ...acc, [curr.classname]: curr.auth }), {})
      };

      dispatch(createDatabaseUser({ 
        hostUid: selectedHostUid, 
        dbname, 
        payload: createPayload 
      })).unwrap().then(() => {
        dispatch(fetchDatabaseUsers({ hostUid: selectedHostUid, dbname }));
      });
    }
    // Note: unwrap().then() closing of modal is handled by the slice if needed, 
    // but usually it's better to keep it open if there's an error.
    // The slice currently closes it on fulfilled.
  };

  // Filter available users (exclude ones already in groups or members)
  const availableUsers = databaseUsers
    .filter(u => 
      !formData.groups.some(g => g.name === u.name) && 
      !formData.members.some(m => m.name === u.name)
    )
    .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bk-main/40 backdrop-blur-sm animate-in fade-in duration-300 font-sans text-left">
      <div className="bg-white dark:bg-bk-side w-full max-w-[840px] h-[680px] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col relative text-left">
        
        {/* Subtle Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-bk-yellow/60"></div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-bk-main/50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-bk-yellow/10 flex items-center justify-center border border-bk-yellow/20">
              <span className="material-symbols-outlined text-bk-yellow text-xl">
                {isEditMode ? 'manage_accounts' : 'person_add'}
              </span>
            </div>
            <div>
              <h3 className="text-[12px] font-medium text-slate-900 dark:text-white leading-none tracking-wide">
                {isEditMode ? 'Update database user' : 'Create database user'}
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium italic">Target Database: {dbname}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-md hover:bg-slate-200 dark:hover:bg-white/5 transition-all text-slate-400 dark:text-slate-500 flex items-center justify-center group"
          >
            <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-bk-main/30 flex gap-8">
          <button 
            onClick={() => setActiveTab('general')}
            className={`py-3 text-[11px] font-medium tracking-wide relative transition-all ${activeTab === 'general' ? 'text-bk-yellow' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            General identification
            {activeTab === 'general' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-bk-yellow animate-in slide-in-from-left-2"></div>}
          </button>
          {editingUser !== 'DBA' && (
            <button 
              onClick={() => setActiveTab('auth')}
              className={`py-3 text-[11px] font-medium tracking-wide relative transition-all ${activeTab === 'auth' ? 'text-bk-yellow' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              Resource authorization
              {activeTab === 'auth' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-bk-yellow animate-in slide-in-from-left-2"></div>}
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-5 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'general' ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-1 duration-300">
              {/* Basic Identity section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500 uppercase">Basic Identity</span>
                  <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5">User name</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full h-9 px-3 bg-white dark:bg-bk-main/20 border border-slate-200 dark:border-white/5 rounded text-[12px] font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-bk-yellow/50 transition-all placeholder:text-slate-400/50 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-bk-main/10"
                      placeholder="e.g. cubrid_admin"
                      disabled={isEditMode}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5">User description/memo</label>
                    <input 
                      type="text" 
                      name="memo"
                      value={formData.memo}
                      onChange={handleInputChange}
                      className="w-full h-9 px-3 bg-white dark:bg-bk-main/20 border border-slate-200 dark:border-white/5 rounded text-[12px] font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-bk-yellow/50 transition-all placeholder:text-slate-400/50"
                      placeholder="Account purpose"
                    />
                  </div>
                </div>
              </div>

              {/* Password Setting section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500 uppercase">Security Configuration</span>
                  <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5">Primary password</label>
                    <input 
                      type="password" 
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full h-9 px-3 bg-white dark:bg-bk-main/20 border border-slate-200 dark:border-white/5 rounded text-[12px] font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-bk-yellow/50 transition-all placeholder:text-slate-400/50"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5">Verify password</label>
                    <input 
                      type="password" 
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full h-9 px-3 bg-white dark:bg-bk-main/20 border border-slate-200 dark:border-white/5 rounded text-[12px] font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-bk-yellow/50 transition-all placeholder:text-slate-400/50"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Group Configuration with Drag and Drop - Refined per reference image */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500 uppercase">Group Configuration</span>
                  <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
                </div>
                
                <div className="grid grid-cols-12 gap-0 h-[300px] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                  {/* Panel 1: All Users */}
                  <div 
                    className="col-span-5 flex flex-col bg-white dark:bg-bk-side border-r border-slate-100 dark:border-slate-800"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'available')}
                  >
                    <div className="px-4 py-2 border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-bk-main/20">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">All users</label>
                    </div>
                    <div className="p-2 border-b border-slate-50 dark:border-white/5 bg-slate-50/20 dark:bg-bk-main/10">
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-[14px] text-slate-400">search</span>
                        <input 
                          type="text" 
                          placeholder="Search..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-white dark:bg-bk-main/40 border-none px-7 py-1 rounded text-[10px] h-7 focus:ring-0 focus:outline-none placeholder:text-slate-400/50" 
                        />
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-1 custom-scrollbar space-y-0.5">
                      {loading ? (
                        <div className="h-full flex items-center justify-center opacity-30">
                          <div className="w-4 h-4 border-2 border-bk-yellow/20 border-t-bk-yellow rounded-full animate-spin"></div>
                        </div>
                      ) : availableUsers.length > 0 ? (
                        availableUsers.map(user => (
                          <div 
                            key={user.name}
                            draggable
                            onDragStart={(e) => handleDragStart(e, user, 'available')}
                            onClick={() => {
                              setSelectedAvailable(user);
                              setSelectedInTarget(null);
                            }}
                            onDoubleClick={() => handleMove(user, 'available', 'groups')}
                            className={`px-3 py-1.5 text-[11px] text-slate-700 dark:text-slate-300 hover:bg-bk-yellow/5 rounded cursor-grab active:cursor-grabbing transition-all flex items-center justify-between group/item ${draggedItem?.item?.name === user.name ? 'opacity-40 select-none' : ''} ${selectedAvailable?.name === user.name ? 'bg-bk-yellow/20 border-l-2 border-bk-yellow' : 'border-l-2 border-transparent'}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`material-symbols-outlined text-[15px] ${user.name === 'PUBLIC' || user.members ? 'text-indigo-400' : 'text-slate-400'}`}>
                                {user.name === 'PUBLIC' || user.members ? 'groups' : 'person'}
                              </span>
                              <span className="tracking-tight">{user.name}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center opacity-20 py-8">
                           <span className="text-[10px] font-medium">Empty</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Middle: Small Control Buttons */}
                  <div className="col-span-1 flex flex-col items-center justify-center gap-2 bg-slate-50/30 dark:bg-bk-main/20 border-r border-slate-100 dark:border-slate-800">
                     <button 
                        onClick={() => handleMove(selectedAvailable, 'available', 'groups')}
                        disabled={!selectedAvailable}
                        className={`w-6 h-6 rounded border border-slate-200 dark:border-white/10 flex items-center justify-center transition-all shadow-sm active:scale-90 ${selectedAvailable ? 'text-bk-yellow bg-bk-yellow/10 border-bk-yellow/30 hover:bg-bk-yellow hover:text-bk-side' : 'text-slate-300 opacity-20 cursor-not-allowed'}`}
                     >
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                     </button>
                     <button 
                        onClick={() => handleMove(selectedInTarget?.item, selectedInTarget?.target, 'available')}
                        disabled={!selectedInTarget}
                        className={`w-6 h-6 rounded border border-slate-200 dark:border-white/10 flex items-center justify-center transition-all shadow-sm active:scale-90 ${selectedInTarget ? 'text-bk-yellow bg-bk-yellow/10 border-bk-yellow/30 hover:bg-bk-yellow hover:text-bk-side' : 'text-slate-300 opacity-20 cursor-not-allowed'}`}
                     >
                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                     </button>
                  </div>

                  {/* Right Column: Stacked Targets */}
                  <div className="col-span-6 flex flex-col">
                    {/* Top: Group List (Parent Groups) */}
                    <div 
                      className={`flex-1 flex flex-col border-b border-slate-100 dark:border-slate-800 transition-colors ${draggedItem?.source === 'available' ? 'bg-indigo-500/[0.02]' : 'bg-white dark:bg-bk-side'}`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, 'groups')}
                    >
                      <div className="px-4 py-2 border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-bk-main/20">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">Group list</label>
                      </div>
                      <div className="flex-1 overflow-y-auto p-1.5 custom-scrollbar">
                         {formData.groups.length > 0 ? (
                           <div className="flex flex-wrap gap-1.5 animate-in fade-in duration-300">
                             {formData.groups.map(group => (
                               <div 
                                 key={group.name} 
                                 draggable
                                 onDragStart={(e) => handleDragStart(e, group, 'groups')}
                                 onClick={() => {
                                   setSelectedInTarget({ item: group, target: 'groups' });
                                   setSelectedAvailable(null);
                                 }}
                                 onDoubleClick={() => handleMove(group, 'groups', 'available')}
                                 className={`flex items-center gap-1.5 pl-2 pr-1 py-1 rounded border text-[10.5px] font-medium transition-colors cursor-grab active:cursor-grabbing ${selectedInTarget?.item?.name === group.name ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-100' : 'bg-slate-100/50 dark:bg-white/5 border-indigo-500/10 text-slate-700 dark:text-slate-300 hover:border-indigo-500/30'}`}
                               >
                                 <span className="material-symbols-outlined text-[13px] text-indigo-400">groups</span>
                                 {group.name}
                                 <button 
                                   onClick={() => removeItem(group.name, 'groups')}
                                   className="w-4 h-4 rounded-full hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-center transition-colors ml-1"
                                 >
                                    <span className="material-symbols-outlined text-[11px]">close</span>
                                 </button>
                               </div>
                             ))}
                           </div>
                         ) : (
                           <div className="h-full flex items-center justify-center opacity-10 pointer-events-none">
                              <span className="text-[9px] font-bold tracking-widest">DRAG GROUPS HERE</span>
                           </div>
                         )}
                      </div>
                    </div>

                    {/* Bottom: Member List (Child Users) */}
                    <div 
                      className={`flex-1 flex flex-col transition-colors ${draggedItem?.source === 'available' ? 'bg-bk-yellow/[0.02]' : 'bg-white dark:bg-bk-side'}`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, 'members')}
                    >
                      <div className="px-4 py-2 border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-bk-main/20">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">Member list</label>
                      </div>
                      <div className="flex-1 overflow-y-auto p-1.5 custom-scrollbar">
                        {formData.members.length > 0 ? (
                           <div className="flex flex-wrap gap-1.5 animate-in fade-in duration-300">
                             {formData.members.map(member => (
                               <div 
                                 key={member.name}
                                 draggable
                                 onDragStart={(e) => handleDragStart(e, member, 'members')}
                                 onClick={() => {
                                   setSelectedInTarget({ item: member, target: 'members' });
                                   setSelectedAvailable(null);
                                 }}
                                 onDoubleClick={() => handleMove(member, 'members', 'available')}
                                 className={`flex items-center gap-1.5 pl-2 pr-1 py-1 rounded border text-[10.5px] font-medium transition-colors cursor-grab active:cursor-grabbing ${selectedInTarget?.item?.name === member.name ? 'bg-bk-yellow/20 border-bk-yellow/50 text-indigo-100' : 'bg-slate-100/50 dark:bg-white/5 border-bk-yellow/10 text-slate-700 dark:text-slate-300 hover:border-bk-yellow/30'}`}
                               >
                                 <span className="material-symbols-outlined text-[13px] text-bk-yellow/70">person</span>
                                 {member.name}
                                 <button 
                                   onClick={() => removeItem(member.name, 'members')}
                                   className="w-4 h-4 rounded-full hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-center transition-colors ml-1"
                                 >
                                    <span className="material-symbols-outlined text-[11px]">close</span>
                                 </button>
                               </div>
                             ))}
                           </div>
                         ) : (
                           <div className="h-full flex items-center justify-center opacity-10 pointer-events-none">
                              <span className="text-[9px] font-bold tracking-widest">DRAG MEMBERS HERE</span>
                           </div>
                         )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-1 duration-300">
              {/* Unauthorized section */}
              {/* Unauthorized section - Modern Master-Detail Dashboard */}
              <div className="flex bg-slate-50/50 dark:bg-bk-main/20 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden h-[450px]">
                
                {/* Left Panel: Searchable Objects List */}
                <div className="w-[240px] border-r border-slate-200 dark:border-white/5 flex flex-col bg-white dark:bg-bk-side">
                  <div className="p-3 border-b border-slate-100 dark:border-white/5">
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-[14px] text-slate-400">search</span>
                      <input 
                        type="text" 
                        placeholder="Search objects..." 
                        value={objectSearchTerm}
                        onChange={(e) => setObjectSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-bk-main/40 border-none px-7 py-2 rounded-lg text-[10px] h-8 focus:ring-0 focus:outline-none placeholder:text-slate-400/50" 
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {isClassesLoading ? (
                      <div className="py-10 text-center opacity-20">
                        <div className="w-5 h-5 border-2 border-bk-yellow border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <span className="text-[9px] font-bold">SYMBOLS...</span>
                      </div>
                    ) : (
                      (() => {
                        const systemClasses = currentDbClasses?.systemclass?.[0]?.class?.map(c => ({ name: c.classname, type: 'system' })) || [];
                        const allObjects = systemClasses.filter(o => o.name.toLowerCase().includes(objectSearchTerm.toLowerCase()));

                        if (allObjects.length === 0) return <div className="text-center py-10 opacity-20 text-[9px] font-bold">NO OBJECTS</div>;

                        return allObjects.map(obj => (
                          <button 
                            key={obj.name}
                            onClick={() => setSelectedObjectId(obj.name)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all group ${selectedObjectId === obj.name ? 'bg-bk-yellow text-bk-side shadow-lg shadow-bk-yellow/20' : 'text-slate-500 hover:bg-bk-yellow/10 hover:text-bk-yellow'}`}
                          >
                            <span className={`material-symbols-outlined text-[16px] ${selectedObjectId === obj.name ? 'text-bk-side' : obj.type === 'system' ? 'text-indigo-400/50' : 'text-slate-400'}`}>
                              {obj.type === 'system' ? 'settings_suggest' : 'table_chart'}
                            </span>
                            <span className="text-[10px] font-bold tracking-tight truncate">{obj.name}</span>
                          </button>
                        ));
                      })()
                    )}
                  </div>
                </div>

                {/* Right Panel: Permission Dashboard */}
                <div className="flex-1 flex flex-col bg-slate-50/30 dark:bg-bk-main/10 overflow-y-auto custom-scrollbar">
                  <div className="p-6 space-y-8">
                    {/* Object Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-bk-yellow/10 flex items-center justify-center border border-bk-yellow/20">
                          <span className="material-symbols-outlined text-bk-yellow">shield_lock</span>
                        </div>
                        <div>
                          <h4 className="text-[14px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">{selectedObjectId}</h4>
                          <p className="text-[10px] text-slate-400 font-medium">Configure individual access masks for this object</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                         <button 
                           onClick={() => handleSelectAll(selectedObjectId)}
                           className="px-3 py-1.5 bg-indigo-500/10 text-indigo-500 rounded-lg text-[9px] font-bold uppercase hover:bg-indigo-500 hover:text-white transition-all active:scale-95"
                         >
                           Select All
                         </button>
                         <button 
                           onClick={() => handleClearAll(selectedObjectId)}
                           className="px-3 py-1.5 bg-rose-500/10 text-rose-500 rounded-lg text-[9px] font-bold uppercase hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                         >
                           Clear All
                         </button>
                      </div>
                    </div>

                    {/* Permission Groups */}
                    <div className="grid grid-cols-1 gap-8">
                      {/* Data Group */}
                      <div className="space-y-4">
                         <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest pl-1">Data Operations</span>
                            <div className="flex-1 h-[1px] bg-blue-500/10"></div>
                         </div>
                         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {['Select', 'Insert', 'Update', 'Delete'].map(perm => (
                              <div key={perm} className={`p-3 rounded-2xl border transition-all flex flex-col gap-3 ${objectAuths[selectedObjectId]?.[perm] ? 'bg-blue-500/5 border-blue-500/30' : 'bg-white dark:bg-bk-side border-slate-200 dark:border-white/5'}`}>
                                <div className="flex items-center justify-between">
                                  <span className={`text-[10px] font-bold ${objectAuths[selectedObjectId]?.[perm] ? 'text-blue-500' : 'text-slate-400'}`}>{perm}</span>
                                  <button 
                                    onClick={() => togglePermission(selectedObjectId, perm)}
                                    className={`w-8 h-4 rounded-full relative transition-all duration-300 ${objectAuths[selectedObjectId]?.[perm] ? 'bg-blue-500' : 'bg-slate-200 dark:bg-white/10'}`}
                                  >
                                    <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all duration-300 ${objectAuths[selectedObjectId]?.[perm] ? 'left-5' : 'left-1'}`}></div>
                                  </button>
                                </div>
                                <span className="text-[8px] text-slate-400 font-medium leading-tight">Allow user to {perm.toLowerCase()} records in the table.</span>
                              </div>
                            ))}
                         </div>
                      </div>

                      {/* Schema Group */}
                      <div className="space-y-4">
                         <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest pl-1">Structure & Logic</span>
                            <div className="flex-1 h-[1px] bg-amber-500/20"></div>
                         </div>
                         <div className="grid grid-cols-3 gap-4">
                            {['Alter', 'Index', 'Execute'].map(perm => (
                              <div key={perm} className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${objectAuths[selectedObjectId]?.[perm] ? 'bg-amber-500/5 border-amber-500/30' : 'bg-white dark:bg-bk-side border-slate-200 dark:border-white/5'}`}>
                                <div className="flex flex-col">
                                  <span className={`text-[10px] font-bold ${objectAuths[selectedObjectId]?.[perm] ? 'text-amber-500' : 'text-slate-400'}`}>{perm}</span>
                                  <span className="text-[8px] text-slate-400 font-medium">{perm === 'Execute' ? 'Run stored procedures' : `Change table ${perm.toLowerCase()}`}</span>
                                </div>
                                <button 
                                  onClick={() => togglePermission(selectedObjectId, perm)}
                                  className={`w-8 h-4 rounded-full relative transition-all duration-300 ${objectAuths[selectedObjectId]?.[perm] ? 'bg-amber-500' : 'bg-slate-200 dark:bg-white/10'}`}
                                >
                                  <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all duration-300 ${objectAuths[selectedObjectId]?.[perm] ? 'left-5' : 'left-1'}`}></div>
                                </button>
                              </div>
                            ))}
                         </div>
                      </div>

                      {/* Grant Rights */}
                      <div className="space-y-4">
                         <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest pl-1">Delegation (Grant Rights)</span>
                            <div className="flex-1 h-[1px] bg-indigo-500/20"></div>
                         </div>
                         <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {['G.Select', 'G.Insert', 'G.Update', 'G.Delete', 'G.Alter', 'G.Index', 'G.Execute'].map(perm => (
                              <div key={perm} className={`px-3 py-2 rounded-xl border transition-all flex items-center justify-between ${objectAuths[selectedObjectId]?.[perm] ? 'bg-indigo-500/5 border-indigo-500/30 ring-1 ring-indigo-500/20' : 'bg-white dark:bg-bk-side border-slate-200 dark:border-white/5 opacity-50'}`}>
                                <span className={`text-[9px] font-bold ${objectAuths[selectedObjectId]?.[perm] ? 'text-indigo-500' : 'text-slate-400'}`}>{perm}</span>
                                <button 
                                  onClick={() => togglePermission(selectedObjectId, perm)}
                                  className={`w-7 h-3.5 rounded-full relative transition-all duration-300 ${objectAuths[selectedObjectId]?.[perm] ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-white/10'}`}
                                >
                                  <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-all duration-300 ${objectAuths[selectedObjectId]?.[perm] ? 'left-4' : 'left-0.5'}`}></div>
                                </button>
                              </div>
                            ))}
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-bk-main/80 backdrop-blur-sm flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <button 
            className="px-5 py-1.5 text-[11px] font-medium tracking-wide text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            onClick={onClose}
          >
            Discard
          </button>
          <button 
            className="px-8 py-1.5 bg-bk-yellow hover:bg-[#ffd700] active:scale-[0.98] text-bk-side text-[11px] font-medium tracking-wide rounded border border-bk-yellow/50 shadow-sm transition-all flex items-center justify-center gap-2 min-w-[120px]"
            onClick={handleSave}
          >
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>{isEditMode ? 'Update Account' : 'Create Account'}</span>
          </button>
        </div>
      </div>
      
      {/* Dynamic Keyframe Animations for DND Feedback */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .pulse-subtle {
          animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}} />
    </div>
  );
}
