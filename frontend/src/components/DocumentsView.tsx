import React, { useState, useRef } from 'react';
import { Vehicle } from '../types';
import { 
  FileText, 
  Upload, 
  Trash2, 
  Download, 
  Search, 
  ShieldAlert, 
  FileCheck,
  CheckCircle2,
  X,
  Sparkles,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VehicleDocument {
  id: string;
  name: string;
  category: 'Insurance' | 'Permit' | 'Inspection' | 'Maintenance' | 'Receipt';
  vehicleId: string;
  uploadDate: string;
  fileSize: string;
}

interface DocumentsViewProps {
  vehicles: Vehicle[];
  userRole: string;
}

export default function DocumentsView({ vehicles, userRole }: DocumentsViewProps) {
  const [documents, setDocuments] = useState<VehicleDocument[]>(() => {
    try {
      const stored = localStorage.getItem('transitops_documents');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'DOC-01',
        name: 'commercial_fleet_insurance_2026.pdf',
        category: 'Insurance',
        vehicleId: 'TRK-901',
        uploadDate: '2026-01-15',
        fileSize: '2.4 MB'
      },
      {
        id: 'DOC-02',
        name: 'annual_dot_inspection_pass.pdf',
        category: 'Inspection',
        vehicleId: 'VAN-05',
        uploadDate: '2026-04-20',
        fileSize: '1.1 MB'
      },
      {
        id: 'DOC-03',
        name: 'ev_battery_warranty_certificate.pdf',
        category: 'Permit',
        vehicleId: 'EV-88',
        uploadDate: '2026-06-02',
        fileSize: '850 KB'
      }
    ];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('All');

  // Drag and Drop State
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [docCategory, setDocCategory] = useState<'Insurance' | 'Permit' | 'Inspection' | 'Maintenance' | 'Receipt'>('Insurance');
  const [docVehicleId, setDocVehicleId] = useState(vehicles[0]?.registrationNumber || '');
  const [uploadError, setUploadError] = useState('');
  const [tempFile, setTempFile] = useState<File | null>(null);

  const saveDocs = (newDocs: VehicleDocument[]) => {
    setDocuments(newDocs);
    localStorage.setItem('transitops_documents', JSON.stringify(newDocs));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFileSelection(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFileSelection(e.target.files[0]);
    }
  };

  const processFileSelection = (file: File) => {
    setTempFile(file);
    setUploadError('');
    setIsFormOpen(true);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempFile) return;

    if (!docVehicleId) {
      setUploadError('Associated Vehicle is required.');
      return;
    }

    const fileSizeStr = tempFile.size > 1024 * 1024
      ? `${(tempFile.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(tempFile.size / 1024)} KB`;

    const newDoc: VehicleDocument = {
      id: `DOC-${Math.floor(100 + Math.random() * 900)}`,
      name: tempFile.name,
      category: docCategory,
      vehicleId: docVehicleId,
      uploadDate: new Date().toISOString().split('T')[0],
      fileSize: fileSizeStr
    };

    saveDocs([newDoc, ...documents]);
    setIsFormOpen(false);
    setTempFile(null);
  };

  const handleDelete = (docId: string) => {
    if (confirm('Are you sure you want to delete this certified document?')) {
      const remaining = documents.filter(doc => doc.id !== docId);
      saveDocs(remaining);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Filter Docs
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVehicle = selectedVehicleId === 'All' || doc.vehicleId === selectedVehicleId;
    return matchesSearch && matchesVehicle;
  });

  const canManage = userRole === 'FleetManager' || userRole === 'SafetyOfficer';

  return (
    <div className="space-y-6">
      {/* Search and Upload Trigger */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 h-10 w-4.5" />
          <input
            type="text"
            placeholder="Search certified documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 bg-white"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
          >
            <option value="All">All Vehicles</option>
            {vehicles.map(v => (
              <option key={v.registrationNumber} value={v.registrationNumber}>
                {v.registrationNumber} ({v.name})
              </option>
            ))}
          </select>

          {canManage ? (
            <button
              onClick={triggerFileInput}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              Upload Document
            </button>
          ) : (
            <span className="text-xs text-slate-400 bg-slate-100 px-3 py-2 rounded-lg flex items-center gap-1.5 font-medium">
              <Info className="h-3.5 w-3.5" />
              Manager/Safety-Only Document Management
            </span>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xlsx"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Drag and Drop Area */}
        {canManage && (
          <div className="lg:col-span-1">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[300px] bg-white ${
                isDragging 
                  ? 'border-indigo-500 bg-indigo-50/20 scale-[0.98]' 
                  : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50'
              }`}
            >
              <Upload className={`h-12 w-12 mb-4 transition-colors ${isDragging ? 'text-indigo-600' : 'text-slate-300'}`} />
              <p className="font-bold text-slate-700 text-sm">Drag and drop file here</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px] leading-relaxed">
                Supports PDF, DOCX, XLSX or JPEG images up to 10 MB.
              </p>
              <span className="mt-4 px-3 py-1.5 bg-slate-100 text-indigo-600 font-bold text-xs rounded-lg border border-slate-200">
                Or browse computer files
              </span>
            </div>
          </div>
        )}

        {/* Right Side: Documents List Grid */}
        <div className={canManage ? 'lg:col-span-2 space-y-4' : 'lg:col-span-3 space-y-4'}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocs.map((doc) => {
              let catBadge = 'bg-slate-100 text-slate-700 border-slate-200';
              if (doc.category === 'Insurance') catBadge = 'bg-blue-50 text-blue-700 border-blue-100';
              if (doc.category === 'Inspection') catBadge = 'bg-emerald-50 text-emerald-700 border-emerald-100';
              if (doc.category === 'Permit') catBadge = 'bg-purple-50 text-purple-700 border-purple-100';
              if (doc.category === 'Receipt') catBadge = 'bg-amber-50 text-amber-700 border-amber-100';

              return (
                <motion.div
                  layout
                  key={doc.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-all flex gap-3 items-start relative overflow-hidden"
                >
                  <div className="p-2.5 bg-slate-50 text-indigo-600 border border-slate-200 rounded-lg shrink-0">
                    <FileText className="h-6 w-6" />
                  </div>

                  <div className="space-y-1 min-w-0 flex-1 pr-6">
                    <h4 className="text-xs font-bold text-slate-800 truncate" title={doc.name}>
                      {doc.name}
                    </h4>
                    
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                      <span className={`px-2 py-0.5 rounded-full border ${catBadge}`}>
                        {doc.category}
                      </span>
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                        Plate: {doc.vehicleId}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400 pt-1">
                      <span>Uploaded: {doc.uploadDate}</span>
                      <span>•</span>
                      <span>Size: {doc.fileSize}</span>
                    </div>
                  </div>

                  {/* Actions Drawer Top Right */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                    {canManage && (
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        title="Delete Document"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); alert(`Simulating safe secure download of certified file: ${doc.name}`); }}
                      className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                      title="Download Certified Copy"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                </motion.div>
              );
            })}

            {filteredDocs.length === 0 && (
              <div className="col-span-full py-12 bg-white rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                <FileCheck className="h-12 w-12 text-slate-300 mb-3" />
                <p className="text-slate-500 font-bold">No documents uploaded</p>
                <p className="text-slate-400 text-xs mt-1">Select a vehicle or upload a new certificate to start.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* METADATA ATTACHMENT DIALOG */}
      <AnimatePresence>
        {isFormOpen && tempFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  Certify Uploaded Document
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit}>
                <div className="p-6 space-y-4">
                  {uploadError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
                      <ShieldAlert className="h-4 w-4 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
                    <FileText className="h-8 w-8 text-indigo-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-700 truncate">{tempFile.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium font-mono">
                        {tempFile.size > 1024 * 1024
                          ? `${(tempFile.size / (1024 * 1024)).toFixed(1)} MB`
                          : `${Math.round(tempFile.size / 1024)} KB`}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Document Category */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Document Category
                      </label>
                      <select
                        value={docCategory}
                        onChange={(e) => setDocCategory(e.target.value as any)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500 bg-white"
                      >
                        <option value="Insurance">Insurance Policy</option>
                        <option value="Permit">Logistics Permit</option>
                        <option value="Inspection">DOT Safety Inspection</option>
                        <option value="Maintenance">Maintenance Invoice</option>
                        <option value="Receipt">Fuel Receipt</option>
                      </select>
                    </div>

                    {/* Associated Vehicle */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Associate to Fleet Vehicle
                      </label>
                      <select
                        value={docVehicleId}
                        onChange={(e) => setDocVehicleId(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500 bg-white"
                      >
                        <option value="">-- Choose Vehicle --</option>
                        {vehicles.map(v => (
                          <option key={v.registrationNumber} value={v.registrationNumber}>
                            {v.name} ({v.registrationNumber})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setIsFormOpen(false); setTempFile(null); }}
                    className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-medium cursor-pointer"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Certify & File Document
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
