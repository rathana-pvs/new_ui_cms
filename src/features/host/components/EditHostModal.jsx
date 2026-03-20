import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { editHost, closeEditHostModal, clearHostError } from '../hostSlice';

// Import New Design System & Common Wrappers
import Modal from '../../../components/ui/Layout/Modal';
import Input from '../../../components/ui/Forms/Input';
import Button from '../../../components/ui/Foundation/Button';
import Typography from '../../../components/ui/Foundation/Typography';
import LoadingOverlay from '../../../components/ui/Feedback/LoadingOverlay';
import ErrorOverlay from '../../../components/ui/Feedback/StatusModal'; // Using StatusModal for error overlay mapping

export default function EditHostModal() {
  const dispatch = useDispatch();
  const { isEditHostModalOpen, hostToEditUid, hosts, loading, error: apiError } = useSelector((state) => state.host);

  const [formData, setFormData] = useState({
    id: '',
    address: '',
    port: '8001',
    password: '',
    alias: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditHostModalOpen && hostToEditUid) {
      const hostToEdit = hosts.find((h) => h.uid === hostToEditUid);
      if (hostToEdit) {
        setFormData({
          id: hostToEdit.id || '',
          address: hostToEdit.address || '',
          port: hostToEdit.port ? String(hostToEdit.port) : '8001',
          password: '',
          alias: hostToEdit.alias || '',
        });
      }
      setErrors({});
    }
  }, [isEditHostModalOpen, hostToEditUid, hosts]);

  if (!isEditHostModalOpen) return null;

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
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    
    const payload = {
      id: formData.id,
      address: formData.address,
      port: Number(formData.port),
      alias: formData.alias,
    };
    
    if (formData.password) {
      payload.password = formData.password;
    }
    
    dispatch(editHost({ hostUid: hostToEditUid, payload }));
  };
  
  const handleClose = () => {
    dispatch(closeEditHostModal());
  };

  const footer = (
    <div className="flex justify-end gap-3 w-full">
      <Button 
        variant="ghost" 
        onClick={handleClose} 
        disabled={loading}
      >
        Discard
      </Button>
      <Button 
        variant="primary" 
        onClick={handleSubmit} 
        loading={loading}
        icon="save_as"
        className="min-w-[120px]"
      >
        Save
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isEditHostModalOpen}
      onClose={handleClose}
      title="Modify host"
      icon="settings_input_component"
      footer={footer}
      maxWidth="max-w-[480px]"
    >
      <div className="relative">
        <LoadingOverlay isVisible={loading} title="Updating" subtitle="Saving changes..." />
        
        <ErrorOverlay 
          isVisible={!!apiError} 
          error={apiError} 
          onRetry={handleSubmit} 
          onClose={() => dispatch(clearHostError())} 
        />

        <div className="space-y-8">
          {/* Section 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Typography variant="caption" className="font-bold uppercase tracking-widest text-primary/60">
                Credentials
              </Typography>
              <div className="flex-1 h-[1px] bg-border/50"></div>
            </div>
            
            <Input 
              label="Host friendly name"
              name="alias"
              value={formData.alias}
              onChange={handleChange}
              placeholder="My server"
              error={errors.alias}
              disabled={loading}
            />
          </div>

          {/* Section 2 */}
          <div className="space-y-4">
             <div className="flex items-center gap-3">
              <Typography variant="caption" className="font-bold uppercase tracking-widest text-primary/60">
                Host identity
              </Typography>
              <div className="flex-1 h-[1px] bg-border/50"></div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3">
                <Input 
                  label="IP address / domain"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="localhost"
                  error={errors.address}
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-4">
             <div className="flex items-center gap-3">
              <Typography variant="caption" className="font-bold uppercase tracking-widest text-primary/60">
                Manager access
              </Typography>
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
                disabled={loading}
              />
              <Input 
                label="Passcode (optional)"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                error={errors.password}
                disabled={loading}
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
