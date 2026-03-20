import React, { useState } from 'react';
import Button from './Foundation/Button';
import Typography from './Foundation/Typography';
import Icon from './Foundation/Icon';
import Input from './Forms/Input';
import Select from './Forms/Select';
import Checkbox from './Forms/Checkbox';
import Radio from './Forms/Radio';
import Toggle from './Forms/Toggle';
import Textarea from './Forms/Textarea';
import Card from './Layout/Card';
import Table from './Layout/Table';
import Tabs from './Layout/Tabs';
import Accordion from './Layout/Accordion';
import Alert from './Feedback/Alert';
import Pagination from './Navigation/Pagination';
import Breadcrumbs from './Navigation/Breadcrumbs';

export default function DesignSystemDemo() {
  const [activeTab, setActiveTab] = useState('foundation');
  const [checkbox, setCheckbox] = useState(true);
  const [toggle, setToggle] = useState(true);

  const tabs = [
    { id: 'foundation', label: 'Foundation', content: (
      <div className="space-y-8 animate-in fade-in">
        <section className="space-y-4">
          <Typography variant="label">Typography</Typography>
          <div className="space-y-2">
            <Typography variant="h1">Heading 1: Design System</Typography>
            <Typography variant="h2">Heading 2: Typography Scale</Typography>
            <Typography variant="h3">Heading 3: Components Library</Typography>
            <Typography variant="p">Standard paragraph text for enterprise dashboards and tools. Highly readable and spacious.</Typography>
            <Typography variant="caption">Caption: Small auxiliary text for metadata.</Typography>
            <Typography variant="code">const system = new DesignSystem();</Typography>
          </div>
        </section>

        <section className="space-y-4">
          <Typography variant="label">Buttons & Variants</Typography>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary Action</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="danger" icon="delete">Danger Action</Button>
            <Button variant="primary" loading>Processing</Button>
          </div>
        </section>
      </div>
    )},
    { id: 'forms', label: 'Forms & Inputs', content: (
      <div className="grid grid-cols-2 gap-8 animate-in fade-in">
        <div className="space-y-6">
          <Input label="Server Name" placeholder="e.g. production-db-01" />
          <Select label="Region" options={['US East', 'EU West', 'AP South']} />
          <Textarea label="Notes" placeholder="Additional details..." />
        </div>
        <div className="space-y-6 pt-2">
          <div className="space-y-4">
            <Typography variant="label">Controls</Typography>
            <div className="space-y-3">
               <Checkbox label="Enable background processing" checked={checkbox} onChange={setCheckbox} />
               <Toggle label="Dark mode enabled" checked={toggle} onChange={setToggle} />
               <div className="flex gap-4">
                  <Radio label="Low" name="priority" value="low" checked />
                  <Radio label="High" name="priority" value="high" />
               </div>
            </div>
          </div>
          <Input label="Validation Error" error="This field is required" value="Invalid input" readOnly />
        </div>
      </div>
    )},
    { id: 'layout', label: 'Layout & Data', content: (
      <div className="space-y-8 animate-in fade-in">
        <Card title="Active Instances" subtitle="Real-time monitoring of your database nodes" headerAction={<Button size="sm" variant="outline">Refresh</Button>}>
          <Table 
             columns={[
               { header: 'Node', accessor: 'node' },
               { header: 'Status', accessor: 'status', render: (row) => (
                 <div className="flex items-center gap-1.5">
                   <div className={`w-1.5 h-1.5 rounded-full ${row.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`} />
                   {row.status}
                 </div>
               )},
               { header: 'Load', accessor: 'load' }
             ]}
             data={[
               { node: 'cubrid-prod-01', status: 'Active', load: '12%' },
               { node: 'cubrid-prod-02', status: 'Active', load: '85%' },
               { node: 'cubrid-test-01', status: 'Offline', load: '0%' },
             ]}
          />
        </Card>

        <Accordion items={[
            { id: 'acc1', title: 'What is CUBRID Manager?', content: 'CUBRID Manager is an enterprise-grade web interface for managing CUBRID RDBMS nodes efficiently.' },
            { id: 'acc2', title: 'How to update license?', content: 'Licenses can be updated via the host properties dialog or by contacting support.' }
        ]} />
      </div>
    )},
    { id: 'feedback', label: 'Feedback & Navigation', content: (
      <div className="space-y-8 animate-in fade-in">
        <div className="space-y-4">
           <Alert variant="info" title="System Maintenance">The server will undergo scheduled maintenance at midnight UTC.</Alert>
           <Alert variant="success" title="Backup Complete">Successfully exported 4.2GB of database contents.</Alert>
           <Alert variant="error" title="Connection Refused">Unable to reach the remote broker at 192.168.1.50.</Alert>
        </div>
        
        <div className="space-y-4">
           <Typography variant="label">Navigation</Typography>
           <Breadcrumbs items={[
               { label: 'Home', icon: 'home' },
               { label: 'Hosts', icon: 'dns' },
               { label: 'Properties', icon: 'settings' }
           ]} />
           <Pagination currentPage={1} totalPages={12} onPageChange={() => {}} />
        </div>
      </div>
    )}
  ];

  return (
    <div className="min-h-screen bg-background p-12 custom-scrollbar overflow-y-auto max-h-screen">
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="flex items-end justify-between border-b pb-8">
           <div className="space-y-2">
              <Typography variant="h1" className="text-5xl font-black">Design <span className="text-primary italic">System</span></Typography>
              <Typography variant="p" className="text-muted-foreground font-medium uppercase tracking-[0.2em] ml-1">The Single Source of Truth</Typography>
           </div>
           <div className="flex gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <div className="w-3 h-3 rounded-full bg-accent-blue bg-[#0ea5e9]" />
              <div className="w-3 h-3 rounded-full bg-destructive" />
           </div>
        </header>

        <Tabs 
          tabs={tabs} 
          activeTab={activeTab} 
          onChange={setActiveTab} 
          variant="pills" 
        />
        
        <footer className="pt-12 border-t text-center text-muted-foreground">
            <Typography variant="caption">© 2026 CUBRID Manager UI Component Library</Typography>
        </footer>
      </div>
    </div>
  );
}
