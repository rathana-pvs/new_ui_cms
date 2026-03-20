import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addHost, clearHostError } from '../hostSlice';

// Import New Design System Components
import Modal from '../../../components/ui/Layout/Modal';
import Button from '../../../components/ui/Foundation/Button';
import Typography from '../../../components/ui/Foundation/Typography';
import Icon from '../../../components/ui/Foundation/Icon';
import Input from '../../../components/ui/Forms/Input';
import Alert from '../../../components/ui/Feedback/Alert';

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
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
    dispatch(addHost({ ...formData, port: Number(formData.port) }));
  };

  const footer = (
    <div className="flex justify-end gap-3 w-full">
      <Button variant="ghost" onClick={onClose} disabled={loading}>Discard</Button>
      <Button variant="primary" onClick={handleSubmit} loading={loading} icon="bolt">Connect</Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New connection"
      subtitle="Establish a new link to a CUBRID Manager server"
      icon="add_link"
      footer={footer}
      maxWidth="max-w-[500px]"
    >
      <div className="space-y-6">
        {apiError && <Alert variant="error" title="Connection error" onClose={() => dispatch(clearHostError())}>{apiError}</Alert>}

        <section className="space-y-4">
          <div className="flex items-center gap-3">
             <Typography variant="caption" className="font-bold uppercase tracking-widest text-primary/60">Credentials</Typography>
             <div className="flex-1 h-[1px] bg-border/50"></div>
          </div>
          <Input 
            label="Host friendly name" 
            name="alias" 
            value={formData.alias} 
            onChange={handleChange} 
            placeholder="e.g. Production Cluster" 
            error={errors.alias} 
            icon="label"
          />
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
             <Typography variant="caption" className="font-bold uppercase tracking-widest text-primary/60">Host Identity</Typography>
             <div className="flex-1 h-[1px] bg-border/50"></div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3">
              <Input 
                label="IP address / domain" 
                name="address" 
                value={formData.address} 
                onChange={handleChange} 
                placeholder="10.0.0.1" 
                error={errors.address} 
                icon="dns"
              />
            </div>
            <div>
              <Input 
                label="Port" 
                name="port" 
                value={formData.port} 
                onChange={handleChange} 
                placeholder="8001" 
                error={errors.port} 
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 pb-4">
          <div className="flex items-center gap-3">
             <Typography variant="caption" className="font-bold uppercase tracking-widest text-primary/60">Manager Access</Typography>
             <div className="flex-1 h-[1px] bg-border/50"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Admin username" 
              name="id" 
              value={formData.id} 
              onChange={handleChange} 
              placeholder="admin" 
              error={errors.id} 
              icon="account_circle"
            />
            <Input 
              type="password" 
              label="Passcode" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              placeholder="••••••••" 
              error={errors.password} 
              icon="lock"
            />
          </div>
        </section>
      </div>
    </Modal>
  );
}
