import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeUnloadDBModal, openUnloadResultModal } from '../databaseSlice';
import { databaseApi } from '../databaseApi';

// Import New Design System Components
import Modal from '../../../components/ui/Layout/Modal';
import Button from '../../../components/ui/Foundation/Button';
import Typography from '../../../components/ui/Foundation/Typography';
import Icon from '../../../components/ui/Foundation/Icon';
import Alert from '../../../components/ui/Feedback/Alert';

import UnloadConfigSection from './unload/UnloadConfigSection';
import UnloadContentSection from './unload/UnloadContentSection';
import UnloadAdvancedOptions from './unload/UnloadAdvancedOptions';

export default function UnloadDatabaseModal() {
  const dispatch = useDispatch();
  const { isUnloadDBModalOpen, selectedDatabase, databases, activeDatabases } = useSelector((state) => state.database);
  const { selectedHostUid } = useSelector((state) => state.host);
  
  const currentDb = databases.find(db => db.dbname === selectedDatabase);

  const [formData, setFormData] = useState({
    targetDbName: '',
    targetDirectory: '',
    dbUsername: '',
    dbPassword: '',
    schemaOption: 'All', // All, Selected tables, Not include
    dataOption: 'Selected tables', // Selected tables, Not include
    selectedTables: [],
    asDba: false,
    splitSchema: false,
    classOnly: false,
    skipIndex: false,
    useDelimitedIdentifier: false,
    includeReferencedTables: false,
    usePrefixOutputFile: false,
    prefixOutputFile: '',
    useFileForHash: false,
    fileForHash: '',
    useCachedPages: false,
    cachedPages: '',
    useEstimateInstances: false,
    estimateInstances: '',
    useLoFileDirectory: false,
    loFileDirectory: ''
  });

  const [dynamicTables, setDynamicTables] = useState([]);
  const [isTablesLoading, setIsTablesLoading] = useState(false);
  const [isUnloading, setIsUnloading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTables = useCallback(async () => {
    if (!selectedHostUid || !selectedDatabase) return;
    setIsTablesLoading(true);
    try {
      const status = activeDatabases.includes(selectedDatabase) ? 'on' : 'off';
      const res = await databaseApi.getClassInfo(selectedHostUid, selectedDatabase, status);
      const userTables = res.userclass?.[0]?.class?.map(c => c.classname) || [];
      setDynamicTables(userTables);
      setFormData(prev => prev.schemaOption === 'All' ? { ...prev, selectedTables: userTables } : prev);
    } catch (err) {
      console.error('Failed to fetch tables:', err);
    } finally {
      setIsTablesLoading(false);
    }
  }, [selectedHostUid, selectedDatabase, activeDatabases]);

  useEffect(() => {
    if (isUnloadDBModalOpen && selectedDatabase) {
      setFormData(prev => ({
        ...prev,
        targetDbName: selectedDatabase,
        targetDirectory: currentDb?.dbdir || `/home/cubrid/databases/${selectedDatabase}`,
        dbUsername: 'dba',
        fileForHash: currentDb?.dbdir ? `${currentDb.dbdir}/hashfile` : `/home/cubrid/databases/${selectedDatabase}/hashfile`
      }));
      fetchTables();
    }
  }, [isUnloadDBModalOpen, selectedDatabase, currentDb, fetchTables]);

  if (!isUnloadDBModalOpen) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSchemaChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      schemaOption: value,
      selectedTables: value === 'All' ? [...dynamicTables] : []
    }));
  };

  const handleTableToggle = (table) => {
    setFormData(prev => ({
      ...prev,
      selectedTables: prev.selectedTables.includes(table)
        ? prev.selectedTables.filter(t => t !== table)
        : [...prev.selectedTables, table]
    }));
  };

  const handleUnloadDatabase = async () => {
    if (!selectedHostUid || !selectedDatabase) return;
    setIsUnloading(true);
    setError(null);
    try {
      const payload = {
        targetdir: formData.targetDirectory,
        isSchemaIncluded: formData.schemaOption !== 'Not include',
        isDataIncluded: formData.dataOption !== 'Not include',
        dbuser: formData.dbUsername,
        dbpasswd: formData.dbPassword,
        usehash: formData.useFileForHash ? 'yes' : 'no',
        hashdir: formData.useFileForHash ? formData.fileForHash : '',
        class: formData.selectedTables.map(t => ({ classname: t })),
        ref: formData.includeReferencedTables ? 'yes' : 'no',
        classonly: formData.classOnly ? 'yes' : 'no',
        "as-dba": formData.asDba ? 'yes' : 'no',
        "skip-index-detail": formData.skipIndex ? 'yes' : 'no',
        "split-schema-files": formData.splitSchema ? 'yes' : 'no',
        delimit: formData.useDelimitedIdentifier ? 'yes' : 'no',
        estimate: formData.useEstimateInstances ? String(formData.estimateInstances) : '',
        prefix: formData.usePrefixOutputFile ? formData.prefixOutputFile : '',
        cach: formData.useCachedPages ? String(formData.cachedPages) : '',
        lofile: formData.useLoFileDirectory ? String(formData.loFileDirectory) : ''
      };

      const response = await databaseApi.unloadDatabase(selectedHostUid, selectedDatabase, payload);
      dispatch(closeUnloadDBModal());
      dispatch(openUnloadResultModal(response));
    } catch (err) {
      setError(err.response?.data?.note || err.response?.data?.message || 'The unload operation failed.');
    } finally {
      setIsUnloading(false);
    }
  };

  const footer = (
    <div className="flex justify-end gap-3 w-full">
      <Button variant="ghost" onClick={() => dispatch(closeUnloadDBModal())} disabled={isUnloading}>Discard</Button>
      <Button variant="primary" onClick={handleUnloadDatabase} loading={isUnloading} icon="play_circle">Run Unload</Button>
    </div>
  );

  return (
    <Modal
      isOpen={isUnloadDBModalOpen}
      onClose={() => dispatch(closeUnloadDBModal())}
      title="Unload Database"
      subtitle={`${selectedDatabase} @ ${selectedHostUid}`}
      icon="upload"
      footer={footer}
      maxWidth="max-w-[620px]"
    >
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
        {error && <Alert variant="error" title="Dump failure" onClose={() => setError(null)}>{error}</Alert>}

        <div className="space-y-10">
           <UnloadConfigSection 
             formData={formData} 
             handleInputChange={handleInputChange} 
           />

           <UnloadContentSection 
             formData={formData}
             handleInputChange={handleInputChange}
             handleSchemaChange={handleSchemaChange}
             handleTableToggle={handleTableToggle}
             dynamicTables={dynamicTables}
             isTablesLoading={isTablesLoading}
           />

           <UnloadAdvancedOptions 
             formData={formData}
             handleInputChange={handleInputChange}
           />
        </div>
      </div>
    </Modal>
  );
}
