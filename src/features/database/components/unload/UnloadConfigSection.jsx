import React, { useState } from 'react';
import Input from '../../../../components/ui/Forms/Input';
import Typography from '../../../../components/ui/Foundation/Typography';
import Button from '../../../../components/ui/Foundation/Button';

export default function UnloadConfigSection({ formData, handleInputChange }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Typography variant="caption" className="font-black uppercase tracking-[0.2em] text-primary/60">Target Configuration</Typography>
        <div className="flex-1 h-[1px] bg-border/50"></div>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <Input 
          label="Database Name" 
          value={formData.targetDbName} 
          readOnly 
          disabled 
          variant="ghost" 
          icon="database" 
        />
        <Input 
          label="Target Directory" 
          name="targetDirectory"
          value={formData.targetDirectory}
          onChange={(val) => handleInputChange({ target: { name: 'targetDirectory', value: val } })}
          placeholder="e.g. /home/cubrid/backup"
          icon="folder_open"
        />
      </div>

      <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border/30">
        <Input 
          label="DB Username" 
          name="dbUsername"
          value={formData.dbUsername}
          onChange={(val) => handleInputChange({ target: { name: 'dbUsername', value: val } })}
          placeholder="dba"
          icon="person"
        />
        <Input 
          label="DB Password" 
          type={showPassword ? "text" : "password"} 
          name="dbPassword"
          value={formData.dbPassword}
          onChange={(val) => handleInputChange({ target: { name: 'dbPassword', value: val } })}
          placeholder="Password"
          icon="lock"
          suffix={
            <Button 
               variant="ghost" 
               className="p-1 h-auto min-w-0" 
               onClick={() => setShowPassword(!showPassword)}
            >
               <span className="material-symbols-outlined text-[18px]">
                 {showPassword ? 'visibility_off' : 'visibility'}
               </span>
            </Button>
          }
        />
      </div>
    </div>
  );
}
