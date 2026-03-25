import { Input } from '../../../../components/ds/forms/Input';
import { Typography } from '../../../../components/ds/foundation/Typography';

export default function UnloadConfigSection({ formData, handleInputChange }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Typography variant="caption" className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Target configuration</Typography>
        <div className="flex-1 h-[1px] bg-slate-100 dark:bg-white/5"></div>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <Input 
          label="Database name"
          value={formData.targetDbName}
          disabled
        />
        <Input 
          label="Target directory"
          name="targetDirectory"
          value={formData.targetDirectory}
          onChange={handleInputChange}
          placeholder="/home/cubrid/backup"
          icon="folder"
        />
      </div>

      <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-white/5">
        <Input 
          label="DB Username"
          name="dbUsername"
          value={formData.dbUsername}
          onChange={handleInputChange}
          placeholder="dba"
          icon="person"
        />
        <Input 
          label="DB Password"
          type="password"
          name="dbPassword"
          value={formData.dbPassword}
          onChange={handleInputChange}
          placeholder="••••••••••••"
        />
      </div>
    </div>
  );
}
