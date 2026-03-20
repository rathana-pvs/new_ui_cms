import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createDatabaseUser, updateDatabaseUser, fetchDatabaseUsers, clearUserError } from '../userSlice';
import { fetchDatabaseClasses } from '../../database/databaseSlice';

// Import New Design System Components
import Modal from '../../../components/ui/Layout/Modal';
import Button from '../../../components/ui/Foundation/Button';
import Typography from '../../../components/ui/Foundation/Typography';
import Icon from '../../../components/ui/Foundation/Icon';
import Input from '../../../components/ui/Forms/Input';
import Tabs from '../../../components/ui/Layout/Tabs';
import Card from '../../../components/ui/Layout/Card';
import Alert from '../../../components/ui/Feedback/Alert';
import Toggle from '../../../components/ui/Forms/Toggle';

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
  const { databaseUsers: allUsers, databaseUsersLoading, error: userError, actionLoading } = useSelector((state) => state.user);
  const databaseUsers = allUsers[dbname] || [];
  const loading = databaseUsersLoading[dbname];
  const { databaseClasses, databaseClassesLoading, activeDatabases } = useSelector((state) => state.database);
  const currentDbClasses = databaseClasses[dbname];
  const isClassesLoading = databaseClassesLoading[dbname];

  const [activeTab, setActiveTab] = useState('general');
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
  
  const [selectedObjectId, setSelectedObjectId] = useState('');
  const [objectSearchTerm, setObjectSearchTerm] = useState('');
  const [objectAuths, setObjectAuths] = useState({});

  useEffect(() => {
    if (isOpen && dbname && selectedHostUid) {
      dispatch(fetchDatabaseUsers({ hostUid: selectedHostUid, dbname }));
    }
    if (isOpen && databaseUsers.length > 0) {
      const publicGroup = databaseUsers.find(u => u.name === 'PUBLIC');
      if (publicGroup && !formData.groups.some(g => g.name === 'PUBLIC')) {
        setFormData(prev => ({
          ...prev,
          groups: [...prev.groups, publicGroup]
        }));
      }
    }
    
    if (isOpen && dbname && selectedHostUid) {
      const dbstatus = activeDatabases.includes(dbname) ? 'on' : 'off';
      dispatch(fetchDatabaseClasses({ hostUid: selectedHostUid, dbname, dbstatus }));
    }

    if (isOpen && isEditMode && databaseUsers.length > 0) {
      const userToEdit = databaseUsers.find(u => (u.name || u) === editingUser);
      if (userToEdit) {
        setFormData({
          name: userToEdit.name || userToEdit,
          password: '',
          confirmPassword: '',
          memo: userToEdit.comment || '',
          groups: userToEdit.groups || [],
          members: userToEdit.members || [],
        });
        
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
      setFormData({
        name: '', password: '', confirmPassword: '', memo: '', groups: [], members: [],
      });
    }
  }, [isOpen, dbname, selectedHostUid, dispatch, databaseUsers.length, activeDatabases, isEditMode, editingUser]);

  useEffect(() => {
    if (currentDbClasses && !selectedObjectId) {
      const firstClass = currentDbClasses.systemclass?.[0]?.class?.[0]?.classname;
      if (firstClass) setSelectedObjectId(firstClass);
    }
  }, [currentDbClasses, selectedObjectId]);

  useEffect(() => {
    if (editingUser === 'DBA' && activeTab !== 'general') {
      setActiveTab('general');
    }
  }, [editingUser, activeTab]);

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
  };

  const handleDragOver = (e) => {
    e.preventDefault();
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
    const allTrue = {};
    Object.keys(PERM_MAPPING).forEach(k => allTrue[k] = true);
    setObjectAuths(prev => ({ ...prev, [objId]: allTrue }));
  };

  const handleClearAll = (objId) => {
    const allFalse = {};
    Object.keys(PERM_MAPPING).forEach(k => allFalse[k] = false);
    setObjectAuths(prev => ({ ...prev, [objId]: allFalse }));
  };

  const handleSave = () => {
    if (!formData.name) return;

    const authList = Object.keys(objectAuths).map(objId => ({
      classname: objId,
      auth: encodeCUBRIDAuth(objectAuths[objId])
    }));

    const payload = {
      userpass: formData.password,
      groups: { group: formData.groups.map(g => g.name || g) },
      authorization: authList
    };

    if (isEditMode) {
      dispatch(updateDatabaseUser({ hostUid: selectedHostUid, dbname, userName: editingUser, payload }))
        .unwrap().then(() => dispatch(fetchDatabaseUsers({ hostUid: selectedHostUid, dbname })));
    } else {
      dispatch(createDatabaseUser({ hostUid: selectedHostUid, dbname, payload: { ...payload, username: formData.name } }))
        .unwrap().then(() => dispatch(fetchDatabaseUsers({ hostUid: selectedHostUid, dbname })));
    }
  };

  const availableUsers = databaseUsers
    .filter(u => !formData.groups.some(g => g.name === u.name) && !formData.members.some(m => m.name === u.name))
    .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const tabs = [
    { id: 'general', label: 'General Identity', icon: 'person' },
    editingUser !== 'DBA' && { id: 'auth', label: 'Resource Authorization', icon: 'shield_lock' }
  ].filter(Boolean);

  const footer = (
    <div className="flex justify-end gap-3 w-full">
      <Button variant="ghost" onClick={onClose} disabled={actionLoading}>Discard</Button>
      <Button variant="primary" onClick={handleSave} loading={actionLoading} icon="check_circle">
        {isEditMode ? 'Update User' : 'Create User'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Update database user' : 'Create database user'}
      subtitle={`Target Database: ${dbname}`}
      icon={isEditMode ? 'manage_accounts' : 'person_add'}
      footer={footer}
      maxWidth="max-w-[850px]"
    >
      <div className="space-y-6">
        {userError && <Alert variant="error" title="Submission Error" onClose={() => dispatch(clearUserError())}>{userError}</Alert>}

        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="line" />

        {activeTab === 'general' ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                 <Typography variant="caption" className="font-bold uppercase tracking-widest text-primary/60">Basic Identity</Typography>
                 <div className="flex-1 h-[1px] bg-border/50"></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="User name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} disabled={isEditMode} placeholder="e.g. cubrid_admin" />
                <Input label="Description" value={formData.memo} onChange={(e) => handleInputChange('memo', e.target.value)} placeholder="Account purpose" />
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3">
                 <Typography variant="caption" className="font-bold uppercase tracking-widest text-primary/60">Security Settings</Typography>
                 <div className="flex-1 h-[1px] bg-border/50"></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input type="password" label="Password" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} placeholder="••••••••" />
                <Input type="password" label="Verify Password" value={formData.confirmPassword} onChange={(e) => handleInputChange('confirmPassword', e.target.value)} error={formData.confirmPassword && formData.password !== formData.confirmPassword ? "Passwords don't match" : null} placeholder="••••••••" />
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3">
                 <Typography variant="caption" className="font-bold uppercase tracking-widest text-primary/60">Group Configuration</Typography>
                 <div className="flex-1 h-[1px] bg-border/50"></div>
              </div>
              <div className="grid grid-cols-12 gap-0 h-[320px] border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="col-span-5 flex flex-col bg-muted/5 border-r border-border" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'available')}>
                  <div className="px-4 py-2 border-b border-border bg-muted/10">
                    <Typography variant="caption" className="font-bold uppercase tracking-tight opacity-70">All Users</Typography>
                  </div>
                  <div className="p-2 border-b border-border bg-background/50">
                    <Input icon="search" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-8 text-[11px]" />
                  </div>
                  <div className="flex-1 overflow-y-auto p-1 custom-scrollbar space-y-0.5">
                    {loading ? (
                      <div className="h-full flex items-center justify-center opacity-30"><Icon name="sync" className="animate-spin" /></div>
                    ) : availableUsers.length > 0 ? (
                      availableUsers.map(user => (
                        <div 
                          key={user.name} draggable onDragStart={(e) => handleDragStart(e, user, 'available')}
                          onClick={() => { setSelectedAvailable(user); setSelectedInTarget(null); }}
                          onDoubleClick={() => handleMove(user, 'available', 'groups')}
                          className={`px-3 py-2 text-[11px] rounded-lg cursor-grab transition-all flex items-center gap-2 ${selectedAvailable?.name === user.name ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-muted/10'}`}
                        >
                          <Icon name={user.name === 'PUBLIC' || user.members ? 'groups' : 'person'} size="xs" className="opacity-50" />
                          <span className="font-medium">{user.name}</span>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex items-center justify-center opacity-20"><Typography variant="caption">Empty</Typography></div>
                    )}
                  </div>
                </div>

                <div className="col-span-1 flex flex-col items-center justify-center gap-3 bg-muted/5 border-r border-border">
                   <Button size="sm" variant="outline" className="p-1 h-7 w-7" disabled={!selectedAvailable} onClick={() => handleMove(selectedAvailable, 'available', 'groups')}><Icon name="chevron_right" /></Button>
                   <Button size="sm" variant="outline" className="p-1 h-7 w-7" disabled={!selectedInTarget} onClick={() => handleMove(selectedInTarget?.item, selectedInTarget?.target, 'available')}><Icon name="chevron_left" /></Button>
                </div>

                <div className="col-span-6 flex flex-col">
                  <div className="flex-1 flex flex-col border-b border-border" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'groups')}>
                    <div className="px-4 py-2 border-b border-border bg-muted/10">
                      <Typography variant="caption" className="font-bold uppercase tracking-tight opacity-70">Groups</Typography>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                      <div className="flex flex-wrap gap-2">
                        {formData.groups.map(group => (
                          <div key={group.name} draggable onDragStart={(e) => handleDragStart(e, group, 'groups')} onClick={() => setSelectedInTarget({ item: group, target: 'groups' })} onDoubleClick={() => handleMove(group, 'groups', 'available')} className={`flex items-center gap-2 pl-2 pr-1 py-1 rounded-md border text-[10px] font-bold cursor-grab ${selectedInTarget?.item?.name === group.name ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-background border-border hover:border-primary/50'}`}>
                            <Icon name="groups" size="xs" /> {group.name}
                            <button onClick={() => removeItem(group.name, 'groups')} className="hover:bg-black/10 rounded-full p-0.5 ml-1"><Icon name="close" size="xs" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'members')}>
                    <div className="px-4 py-2 border-b border-border bg-muted/10">
                      <Typography variant="caption" className="font-bold uppercase tracking-tight opacity-70">Members</Typography>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                      <div className="flex flex-wrap gap-2">
                        {formData.members.map(member => (
                          <div key={member.name} draggable onDragStart={(e) => handleDragStart(e, member, 'members')} onClick={() => setSelectedInTarget({ item: member, target: 'members' })} onDoubleClick={() => handleMove(member, 'members', 'available')} className={`flex items-center gap-2 pl-2 pr-1 py-1 rounded-md border text-[10px] font-bold cursor-grab ${selectedInTarget?.item?.name === member.name ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-background border-border hover:border-primary/50'}`}>
                            <Icon name="person" size="xs" /> {member.name}
                            <button onClick={() => removeItem(member.name, 'members')} className="hover:bg-black/10 rounded-full p-0.5 ml-1"><Icon name="close" size="xs" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="flex bg-background border border-border rounded-xl overflow-hidden h-[450px] animate-in fade-in slide-in-from-top-2">
            <div className="w-[260px] border-r border-border flex flex-col bg-muted/5">
              <div className="p-3 border-b border-border">
                <Input icon="search" placeholder="Search objects..." value={objectSearchTerm} onChange={(e) => setObjectSearchTerm(e.target.value)} className="h-8 text-[11px]" />
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                {isClassesLoading ? (
                  <div className="py-10 text-center opacity-20"><Icon name="sync" className="animate-spin mb-2" /><Typography variant="caption">Loading...</Typography></div>
                ) : (() => {
                  const systemClasses = currentDbClasses?.systemclass?.[0]?.class?.map(c => ({ name: c.classname, type: 'system' })) || [];
                  const allObjects = systemClasses.filter(o => o.name.toLowerCase().includes(objectSearchTerm.toLowerCase()));
                  if (allObjects.length === 0) return <Typography variant="caption" className="block text-center py-10 opacity-20">No objects found</Typography>;
                  return allObjects.map(obj => (
                    <button key={obj.name} onClick={() => setSelectedObjectId(obj.name)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${selectedObjectId === obj.name ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-primary/5 text-muted-foreground hover:text-primary'}`}>
                      <Icon name={obj.type === 'system' ? 'settings_suggest' : 'table_chart'} size="sm" />
                      <Typography variant="span" className="text-[11px] font-bold tracking-tight truncate">{obj.name}</Typography>
                    </button>
                  ));
                })()}
              </div>
            </div>

            <div className="flex-1 flex flex-col bg-muted/5 overflow-y-auto custom-scrollbar p-6">
              <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20"><Icon name="shield_lock" className="text-primary" /></div>
                    <div>
                      <Typography variant="h4" className="uppercase tracking-wider">{selectedObjectId}</Typography>
                      <Typography variant="caption" className="opacity-50">Configure individual access masks</Typography>
                    </div>
                  </div>
                  <div className="flex gap-2">
                     <Button size="sm" variant="ghost" className="text-[10px] uppercase font-black" onClick={() => handleSelectAll(selectedObjectId)}>Select All</Button>
                     <Button size="sm" variant="ghost" className="text-[10px] uppercase font-black text-destructive" onClick={() => handleClearAll(selectedObjectId)}>Clear All</Button>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Data Operations */}
                  <div className="space-y-4">
                    <Typography variant="caption" className="font-black uppercase text-primary tracking-widest flex items-center gap-2">
                       <Icon name="database" size="xs" /> Data Operations
                    </Typography>
                    <Card className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 border-dashed bg-muted/5">
                      {['Select', 'Insert', 'Update', 'Delete'].map(perm => (
                        <div key={perm} className="flex flex-col gap-2 p-2 rounded-lg border border-transparent hover:border-border hover:bg-background transition-all">
                          <div className="flex items-center justify-between">
                            <Typography variant="span" className={`text-[11px] font-bold ${objectAuths[selectedObjectId]?.[perm] ? 'text-primary' : 'text-muted-foreground'}`}>{perm}</Typography>
                            <Toggle checked={objectAuths[selectedObjectId]?.[perm]} onChange={() => togglePermission(selectedObjectId, perm)} />
                          </div>
                          <Typography variant="caption" className="opacity-40 leading-tight">Allow {perm.toLowerCase()} on this object.</Typography>
                        </div>
                      ))}
                    </Card>
                  </div>

                  {/* Structural Rights */}
                  <div className="space-y-4">
                    <Typography variant="caption" className="font-black uppercase text-secondary tracking-widest flex items-center gap-2">
                       <Icon name="architecture" size="xs" /> Structural Rights
                    </Typography>
                    <Card className="grid grid-cols-3 gap-4 p-4 border-dashed bg-muted/5">
                      {['Alter', 'Index', 'Execute'].map(perm => (
                        <div key={perm} className="flex items-center justify-between p-2 rounded-lg border border-transparent hover:border-border hover:bg-background transition-all">
                          <div className="flex flex-col">
                            <Typography variant="span" className={`text-[11px] font-bold ${objectAuths[selectedObjectId]?.[perm] ? 'text-primary' : 'text-muted-foreground'}`}>{perm}</Typography>
                            <Typography variant="caption" className="opacity-40">{perm === 'Execute' ? 'Logic run' : `Schema ${perm.toLowerCase()}`}</Typography>
                          </div>
                          <Toggle checked={objectAuths[selectedObjectId]?.[perm]} onChange={() => togglePermission(selectedObjectId, perm)} />
                        </div>
                      ))}
                    </Card>
                  </div>

                  {/* Delegation Rights */}
                  <div className="space-y-4 pb-4">
                    <Typography variant="caption" className="font-black uppercase text-primary/60 tracking-widest flex items-center gap-2">
                       <Icon name="assignment_ind" size="xs" /> Delegation (Grant)
                    </Typography>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {['G.Select', 'G.Insert', 'G.Update', 'G.Delete', 'G.Alter', 'G.Index', 'G.Execute'].map(perm => (
                        <div key={perm} className={`px-3 py-2 rounded-lg border transition-all flex items-center justify-between ${objectAuths[selectedObjectId]?.[perm] ? 'bg-primary/5 border-primary/30' : 'bg-background border-border opacity-50'}`}>
                          <Typography variant="span" className="text-[10px] font-bold">{perm}</Typography>
                          <Toggle checked={objectAuths[selectedObjectId]?.[perm]} onChange={() => togglePermission(selectedObjectId, perm)} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
