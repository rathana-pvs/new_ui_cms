import React from 'react';
import Input from '../../../../components/ui/Forms/Input';
import Typography from '../../../../components/ui/Foundation/Typography';

export default function LoadConfigSection({ formData, handleInputChange }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Typography variant="caption" className="font-black uppercase tracking-[0.2em] text-primary/60">Profile context</Typography>
        <div className="flex-1 h-[1px] bg-border/50"></div>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <Input 
          label="Target Database" 
          value={formData.targetDbName} 
          readOnly 
          disabled 
          variant="ghost" 
          icon="database" 
        />
        <Input 
          label="DB Authority" 
          name="dbUsername"
          value={formData.dbUsername}
          onChange={(val) => handleInputChange({ target: { name: 'dbUsername', value: val } })}
          icon="person"
        />
      </div>
    </div>
  );
}
