import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginDatabase, registerDatabase, closeLoginDatabaseModal, fetchBackupSchedule, fetchQueryPlan } from '../databaseSlice';
import { fetchDatabaseUsers } from '../../user/userSlice';

// Import New Design System Components
import Modal from '../../../components/ui/Layout/Modal';
import Button from '../../../components/ui/Foundation/Button';
import Typography from '../../../components/ui/Foundation/Typography';
import Icon from '../../../components/ui/Foundation/Icon';
import Input from '../../../components/ui/Forms/Input';
import Alert from '../../../components/ui/Feedback/Alert';
import Card from '../../../components/ui/Layout/Card';
import Checkbox from '../../../components/ui/Forms/Checkbox';

export default function LoginDatabaseModal() {
  const dispatch = useDispatch();
  const { isLoginDatabaseModalOpen, selectedDatabase, actionLoading, error: sliceError } = useSelector((state) => state.database);
  const { selectedHostUid } = useSelector((state) => state.host);
  
  const [formData, setFormData] = useState({
    dbuser: 'dba',
    dbpasswd: ''
  });
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isLoginDatabaseModalOpen) {
      setFormData({ dbuser: 'dba', dbpasswd: '' });
      setRememberMe(true);
      setError(null);
    }
  }, [isLoginDatabaseModalOpen]);

  useEffect(() => {
    if (sliceError) setError(sliceError);
  }, [sliceError]);

  if (!isLoginDatabaseModalOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    if (!formData.dbuser) {
      setError("Database user is required.");
      return;
    }
    
    if (rememberMe) {
        dispatch(registerDatabase({ 
            hostUid: selectedHostUid, 
            dbname: selectedDatabase, 
            payload: { id: formData.dbuser, password: formData.dbpasswd } 
        }));
    }

    dispatch(loginDatabase({ 
      hostUid: selectedHostUid, 
      dbname: selectedDatabase, 
      payload: formData 
    })).unwrap()
      .then(() => {
        dispatch(fetchDatabaseUsers({ hostUid: selectedHostUid, dbname: selectedDatabase }));
        dispatch(fetchBackupSchedule({ hostUid: selectedHostUid, dbname: selectedDatabase }));
        dispatch(fetchQueryPlan({ hostUid: selectedHostUid, dbname: selectedDatabase }));
      })
      .catch((err) => setError(err || 'Failed to authenticate with database.'));
  };

  const footer = (
    <div className="flex justify-end gap-3 w-full">
      <Button variant="ghost" onClick={() => dispatch(closeLoginDatabaseModal())} disabled={actionLoading}>Discard</Button>
      <Button type="submit" variant="primary" onClick={handleLogin} loading={actionLoading} icon="login" className="min-w-[140px]">Sign in</Button>
    </div>
  );

  return (
    <Modal
      isOpen={isLoginDatabaseModalOpen}
      onClose={() => dispatch(closeLoginDatabaseModal())}
      title="Database login"
      subtitle="Establish an authorized session"
      icon="database_lock"
      footer={footer}
      maxWidth="max-w-[420px]"
    >
      <form onSubmit={handleLogin} className="space-y-6">
        {error && <Alert variant="error" title="Auth failed" onClose={() => setError(null)}>{error}</Alert>}

        <section className="space-y-4">
          <div className="flex items-center gap-3">
             <Typography variant="caption" className="font-bold uppercase tracking-widest text-primary/60">Target Database</Typography>
             <div className="flex-1 h-[1px] bg-border/50"></div>
          </div>
          <Card className="bg-muted/10 border-border/50 py-3 px-4 flex items-center justify-between">
             <Typography variant="h4" className="text-primary font-black">{selectedDatabase}</Typography>
             <Icon name="dns" size="sm" className="opacity-20" />
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
             <Typography variant="caption" className="font-bold uppercase tracking-widest text-primary/60">Credentials</Typography>
             <div className="flex-1 h-[1px] bg-border/50"></div>
          </div>
          <Input 
            label="User name" 
            value={formData.dbuser} 
            onChange={(e) => handleInputChange('dbuser', e.target.value)} 
            placeholder="dba" 
            icon="person"
            autoFocus 
          />
          <Input 
            type="password" 
            label="Database password" 
            value={formData.dbpasswd} 
            onChange={(e) => handleInputChange('dbpasswd', e.target.value)} 
            placeholder="••••••••" 
            icon="lock"
          />

          <div className="p-4 border border-border rounded-xl flex items-center justify-between group cursor-pointer hover:border-primary/50 transition-all" onClick={() => setRememberMe(!rememberMe)}>
             <div className="flex flex-col">
                <Typography variant="span" className="font-bold block tracking-tight">Remember login info</Typography>
                <Typography variant="caption" className="opacity-50 block leading-tight">Securely cache credentials for auto-login.</Typography>
             </div>
             <Checkbox checked={rememberMe} onChange={setRememberMe} />
          </div>
        </section>

        <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl flex gap-3">
           <Icon name="info" className="text-primary" />
           <Typography variant="caption" className="opacity-70 leading-relaxed font-medium">
             An authenticated session is required to perform administrative tasks and access system catalogs.
           </Typography>
        </div>
      </form>
    </Modal>
  );
}
