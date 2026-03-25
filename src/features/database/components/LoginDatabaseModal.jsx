import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginDatabase, registerDatabase, closeLoginDatabaseModal, fetchBackupSchedule, fetchQueryPlan } from '../databaseSlice';
import { fetchDatabaseUsers } from '../../user/userSlice';
import LoadingOverlay from '../../../components/common/LoadingOverlay';

import { Icon } from '../../../components/ds/foundation/Icon';
import { Modal } from '../../../components/ds/layout/Modal';
import { Button } from '../../../components/ds/foundation/Button';
import { Input } from '../../../components/ds/forms/Input';
import { Checkbox } from '../../../components/ds/forms/Checkbox';
import { Divider } from '../../../components/ds/layout/Divider';
import { Typography } from '../../../components/ds/foundation/Typography';

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
      setFormData({
        dbuser: 'dba',
        dbpasswd: ''
      });
      setRememberMe(true);
      setError(null);
    }
  }, [isLoginDatabaseModalOpen]);

  useEffect(() => {
    if (sliceError) {
      setError(sliceError);
    }
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
    
    // If rememberMe is checked, call register first
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
        // Pre-fetch nested data to "warm up" the tree
        dispatch(fetchDatabaseUsers({ hostUid: selectedHostUid, dbname: selectedDatabase }));
        dispatch(fetchBackupSchedule({ hostUid: selectedHostUid, dbname: selectedDatabase }));
        dispatch(fetchQueryPlan({ hostUid: selectedHostUid, dbname: selectedDatabase }));
      })
      .catch((err) => {
          setError(err || 'Failed to authenticate with database.');
      });
  };

  return (
    <Modal
      isOpen={isLoginDatabaseModalOpen}
      onClose={() => dispatch(closeLoginDatabaseModal())}
      title="Secure Database Login"
      icon="database_lock"
      maxWidth="400px"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="secondary" onClick={() => dispatch(closeLoginDatabaseModal())} disabled={actionLoading}>
            Discard
          </Button>
          <Button 
            variant="primary" 
            onClick={handleLogin} 
            loading={actionLoading}
            icon="login"
          >
            Sign In
          </Button>
        </div>
      }
    >
      <form onSubmit={handleLogin} className="space-y-6">
        <LoadingOverlay 
          isVisible={actionLoading} 
          title="Authenticating" 
          subtitle={`Connecting to ${selectedDatabase}...`} 
        />

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex gap-3 animate-in slide-in-from-top-2 duration-300">
            <Icon name="error" size="sm" weight={300} className="text-rose-500 shrink-0" />
            <Typography variant="p" className="text-rose-600 dark:text-rose-400 font-bold leading-relaxed">{error}</Typography>
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-4">
            <Divider label="TARGET DATABASE" />
            <div className="w-full h-10 px-4 flex items-center bg-bk-yellow/5 border border-bk-yellow/10 rounded-2xl shadow-sm">
              <Icon name="database" size="sm" weight={300} className="text-bk-yellow mr-2.5" />
              <Typography variant="label" className="text-bk-yellow font-bold tracking-wide uppercase">{selectedDatabase}</Typography>
            </div>
          </div>

          <div className="space-y-4">
            <Divider label="ADMINISTRATOR CREDENTIALS" />
            <div className="space-y-4">
              <Input 
                label="Username"
                value={formData.dbuser}
                onChange={(e) => handleInputChange('dbuser', e.target.value)}
                placeholder="dba"
                icon="person"
                autoFocus
              />
              <Input 
                type="password"
                label="Database Password"
                value={formData.dbpasswd}
                onChange={(e) => handleInputChange('dbpasswd', e.target.value)}
                placeholder="••••••••"
                icon="key"
              />
            </div>
          </div>

          <div className="p-4 bg-bk-yellow/5 border border-bk-yellow/10 rounded-2xl flex items-center gap-4 transition-all hover:bg-bk-yellow/10">
            <div className="w-10 h-10 rounded-xl bg-bk-yellow/10 flex items-center justify-center text-bk-yellow border border-bk-yellow/20">
              <Icon name="history" size="md" weight={300} />
            </div>
            <div className="flex-1">
              <Typography variant="label" className="text-slate-900 dark:text-white font-bold">Remember login info</Typography>
              <Typography variant="p" className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Store credentials for automatic connection.</Typography>
            </div>
            <Checkbox 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
          </div>
        </div>

        <div className="p-4 bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl flex gap-4 pr-6">
          <Icon name="info" size="sm" weight={300} className="text-slate-400 dark:text-slate-500 shrink-0" />
          <Typography variant="p" className="text-slate-400 dark:text-slate-500 italic font-medium leading-relaxed">
            Administrative privileges are required to perform operations such as schema modification, user management, and optimization tasks.
          </Typography>
        </div>
      </form>
    </Modal>
  );
}
