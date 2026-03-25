import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeUnloadDBModal, openUnloadResultModal } from '../databaseSlice';
import { databaseApi } from '../databaseApi';

import UnloadConfigSection from './unload/UnloadConfigSection';
import UnloadContentSection from './unload/UnloadContentSection';
import UnloadAdvancedOptions from './unload/UnloadAdvancedOptions';

import { Icon } from '../../../components/ds/foundation/Icon';
import { Modal } from '../../../components/ds/layout/Modal';
import { Button } from '../../../components/ds/foundation/Button';

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
      
      setFormData(prev => {
        if (prev.schemaOption === 'All') {
          return { ...prev, selectedTables: userTables };
        }
        return prev;
      });
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
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSchemaChange = (e) => {
    const { value } = e.target;
    setFormData(prev => {
      let newSelectedTables = prev.selectedTables;
      if (value === 'All') {
        newSelectedTables = [...dynamicTables];
      } else if (value === 'Selected tables' || value === 'Not include') {
        newSelectedTables = [];
      }
      
      return {
        ...prev,
        schemaOption: value,
        selectedTables: newSelectedTables
      };
    });
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
      console.error('Failed to unload database:', err);
      setError(err.response?.data?.note || err.response?.data?.message || 'The unload operation failed. Check the target directory permissions and database state.');
    } finally {
      setIsUnloading(false);
    }
  };

  const footer = (
    <>
      <Button 
        variant="ghost" 
        onClick={() => dispatch(closeUnloadDBModal())}
      >
        Discard
      </Button>
      <Button 
        onClick={handleUnloadDatabase}
        loading={isUnloading}
        icon="play_circle"
        className="min-w-[130px]"
      >
        Proceed unload
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isUnloadDBModalOpen}
      onClose={() => dispatch(closeUnloadDBModal())}
      title="Unload database"
      icon="upload"
      footer={footer}
      loading={isUnloading}
      error={error}
      onErrorClose={() => setError(null)}
      onErrorRetry={handleUnloadDatabase}
      maxWidth="max-w-[720px]"
    >
      <div className="space-y-6">
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
    </Modal>
  );
}
