import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addHost, clearHostError } from '../hostSlice';
import { Modal } from '../../../components/ds/layout/Modal';
import { Input } from '../../../components/ds/forms/Input';
import { Button } from '../../../components/ds/foundation/Button';
import { Typography } from '../../../components/ds/foundation/Typography';
import { Divider } from '../../../components/ds/layout/Divider';

export default function AddHostModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    id: '',
    address: '',
    port: '8001',
    password: '',
    alias: '',
  });
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const { loading, error: apiError } = useSelector((state) => state.host);

  useEffect(() => {
    if (isOpen) {
      setFormData({ id: '', address: '', port: '8001', password: '', alias: '' });
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (apiError) dispatch(clearHostError());
  };

  const validate = () => {
    const errs = {};
    if (!formData.alias.trim()) errs.alias = 'Host Name is required';
    if (!formData.address.trim()) errs.address = 'Address is required';
    if (!formData.port.trim()) errs.port = 'Port is required';
    if (!formData.id.trim()) errs.id = 'User is required';
    if (!formData.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    
    const payload = {
      ...formData,
      port: Number(formData.port)
    };
    
    dispatch(addHost(payload));
  };

  const handleClose = () => {
    onClose();
    dispatch(clearHostError());
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="New connection"
      icon="add_link"
      maxWidth="max-w-[480px]"
      loading={loading}
      footer={
        <>
          <Button 
            variant="secondary" 
            onClick={handleClose}
            disabled={loading}
          >
            Discard
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            loading={loading}
            icon="bolt"
            className="min-w-[120px]"
          >
            Connect
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {apiError && (
          <div className="flex items-center gap-2 px-3 py-2 bg-rose-500/5 border border-rose-500/10 rounded animate-in fade-in slide-in-from-top-1">
            <span className="material-symbols-outlined text-[16px] text-rose-500">error</span>
            <Typography variant="caption" className="text-rose-500 font-medium">{apiError}</Typography>
            <button onClick={() => dispatch(clearHostError())} className="ml-auto text-rose-500/50 hover:text-rose-500">
               <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}

        <div className="space-y-5">
          <div className="space-y-3">
            <Divider label="Credentials" />
            <Input 
              label="Host friendly name"
              name="alias"
              value={formData.alias}
              onChange={handleChange}
              error={errors.alias}
              placeholder="My server" 
              disabled={loading}
            />
          </div>

          <div className="space-y-3">
            <Divider label="Host identity" />
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-3">
                <Input 
                  label="IP address / domain"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  error={errors.address}
                  placeholder="localhost" 
                  disabled={loading}
                />
              </div>
              <Input 
                label="Port"
                name="port"
                value={formData.port}
                onChange={handleChange}
                error={errors.port}
                placeholder="8001" 
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Divider label="Manager access" />
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Admin username"
                name="id"
                value={formData.id}
                onChange={handleChange}
                error={errors.id}
                placeholder="admin" 
                disabled={loading}
              />
              <Input 
                label="Passcode"
                labelExtra="(optional)"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="••••••••" 
                disabled={loading}
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
