import React, { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, Plus, DollarSign, Clock, FileText, Building, Users, Shield, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export function GovernmentSubmit() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    titleAm: '',
    description: '',
    descriptionAm: '',
    category: '',
    budget: '',
    timeline: '',
    priority: 'medium',
    department: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    requirements: [] as string[],
    technicalSpecs: [] as string[],
    deliverables: [] as string[],
    successCriteria: [] as string[],
    constraints: [] as string[],
    targetUsers: '',
    expectedBenefits: '',
    riskAssessment: '',
    maintenanceNeeds: '',
    integrationRequirements: '',
    securityRequirements: '',
    complianceNeeds: '',
    supportDocuments: [] as string[],
    proposalType: 'new_system',
    implementationPhases: [] as string[],
    stakeholders: [] as string[]
  });

  const [newRequirement, setNewRequirement] = useState('');
  const [newTechnicalSpec, setNewTechnicalSpec] = useState('');
  const [newDeliverable, setNewDeliverable] = useState('');
  const [newSuccessCriteria, setNewSuccessCriteria] = useState('');
  const [newConstraint, setNewConstraint] = useState('');
  const [newPhase, setNewPhase] = useState('');
  const [newStakeholder, setNewStakeholder] = useState('');
  const [dragActive, setDragActive] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const categories = [
    'Digital Identity & Authentication',
    'E-Government Services',
    'Healthcare Management',
    'Education Technology',
    'Transportation Systems',
    'Agricultural Technology',
    'Financial Systems',
    'Public Safety & Security',
    'Environmental Monitoring',
    'Infrastructure Management',
    'Data Analytics & BI',
    'Communication Systems',
    'Document Management',
    'Citizen Services',
    'Other'
  ];

  const departments = [
    'Ministry of Innovation and Technology',
    'Ministry of Health',
    'Ministry of Education',
    'Ministry of Transport',
    'Ministry of Agriculture',
    'Ministry of Finance',
    'Ministry of Defense',
    'Ministry of Justice',
    'Ethiopian Revenue and Customs Authority',
    'National Bank of Ethiopia',
    'Ethiopian Electric Power',
    'Addis Ababa City Administration',
    'Regional Governments',
    'Other Government Entity'
  ];

  const proposalTypes = [
    { value: 'new_system', label: 'New System Development' },
    { value: 'system_upgrade', label: 'System Upgrade/Enhancement' },
    { value: 'integration', label: 'System Integration' },
    { value: 'maintenance', label: 'Maintenance & Support' },
    { value: 'consulting', label: 'Technical Consulting' },
    { value: 'training', label: 'Training & Capacity Building' }
  ];

  const priorities = [
    { value: 'low', label: 'Low Priority', color: 'text-slate-400' },
    { value: 'medium', label: 'Medium Priority', color: 'text-yellow-400' },
    { value: 'high', label: 'High Priority', color: 'text-orange-400' },
    { value: 'critical', label: 'Critical/Urgent', color: 'text-red-400' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Redirect to government page after successful submission
    navigate('/government');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addToArray = (arrayName: keyof typeof formData, value: string, setValue: (value: string) => void) => {
    if (value.trim()) {
      const currentArray = formData[arrayName] as string[];
      if (!currentArray.includes(value.trim())) {
        setFormData(prev => ({ 
          ...prev, 
          [arrayName]: [...currentArray, value.trim()] 
        }));
        setValue('');
      }
    }
  };

  const removeFromArray = (arrayName: keyof typeof formData, valueToRemove: string) => {
    const currentArray = formData[arrayName] as string[];
    setFormData(prev => ({ 
      ...prev, 
      [arrayName]: currentArray.filter(item => item !== valueToRemove) 
    }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    // Handle file drop logic here
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <React.Fragment key={step}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold ${
            step <= currentStep 
              ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg' 
              : 'bg-slate-700 text-slate-400'
          }`}>
            {step}
          </div>
          {step < 4 && (
            <div className={`w-16 h-1 mx-2 ${
              step < currentStep ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : 'bg-slate-700'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Building className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Project Overview</h2>
        <p className="text-slate-300">Provide basic information about your government technology proposal</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Project Title (English) *
          </label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            placeholder="Digital Identity Management System"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Project Title (Amharic)
          </label>
          <input
            type="text"
            name="titleAm"
            value={formData.titleAm}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            placeholder="ዲጂታል የመታወቂያ አስተዳደር ስርዓት"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Description (English) *
          </label>
          <textarea
            name="description"
            required
            value={formData.description}
            onChange={handleInputChange}
            rows={5}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            placeholder="Detailed description of the proposed system, its purpose, and expected outcomes..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Description (Amharic)
          </label>
          <textarea
            name="descriptionAm"
            value={formData.descriptionAm}
            onChange={handleInputChange}
            rows={5}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            placeholder="የተጠቆመው ስርዓት፣ ዓላማው እና የሚጠበቁ ውጤቶች ዝርዝር መግለጫ..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Category *
          </label>
          <select
            name="category"
            required
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Proposal Type *
          </label>
          <select
            name="proposalType"
            required
            value={formData.proposalType}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          >
            {proposalTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Priority Level *
          </label>
          <select
            name="priority"
            required
            value={formData.priority}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          >
            {priorities.map(priority => (
              <option key={priority.value} value={priority.value}>{priority.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            <DollarSign className="w-4 h-4 inline mr-2" />
            Estimated Budget (USD) *
          </label>
          <input
            type="number"
            name="budget"
            required
            value={formData.budget}
            onChange={handleInputChange}
            min="1000"
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            placeholder="500000"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            <Clock className="w-4 h-4 inline mr-2" />
            Timeline *
          </label>
          <input
            type="text"
            name="timeline"
            required
            value={formData.timeline}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            placeholder="18 months"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">
          Target Users/Beneficiaries
        </label>
        <input
          type="text"
          name="targetUsers"
          value={formData.targetUsers}
          onChange={handleInputChange}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          placeholder="Government employees, Citizens, Specific departments..."
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Users className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Contact & Department Information</h2>
        <p className="text-slate-300">Provide contact details and department information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Requesting Department *
          </label>
          <select
            name="department"
            required
            value={formData.department}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          >
            <option value="">Select department</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Contact Person *
          </label>
          <input
            type="text"
            name="contactPerson"
            required
            value={formData.contactPerson}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            placeholder="Full name of the contact person"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Contact Email *
          </label>
          <input
            type="email"
            name="contactEmail"
            required
            value={formData.contactEmail}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            placeholder="contact@ministry.gov.et"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Contact Phone
          </label>
          <input
            type="tel"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            placeholder="+251-11-xxx-xxxx"
          />
        </div>
      </div>

      {/* Stakeholders */}
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">
          Key Stakeholders
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.stakeholders.map((stakeholder) => (
            <span
              key={stakeholder}
              className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm border border-emerald-500/30 flex items-center space-x-2"
            >
              <span>{stakeholder}</span>
              <button
                type="button"
                onClick={() => removeFromArray('stakeholders', stakeholder)}
                className="text-emerald-300 hover:text-red-400"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newStakeholder}
            onChange={(e) => setNewStakeholder(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('stakeholders', newStakeholder, setNewStakeholder))}
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            placeholder="Add stakeholder (e.g., IT Department, Citizens, Regional Offices)"
          />
          <button
            type="button"
            onClick={() => addToArray('stakeholders', newStakeholder, setNewStakeholder)}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-3 rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">
          Expected Benefits
        </label>
        <textarea
          name="expectedBenefits"
          value={formData.expectedBenefits}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          placeholder="Describe the expected benefits and impact of this project..."
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Zap className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Technical Requirements</h2>
        <p className="text-slate-300">Define technical specifications and requirements</p>
      </div>

      {/* Requirements */}
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">
          Functional Requirements *
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.requirements.map((req) => (
            <span
              key={req}
              className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 px-3 py-1 rounded-full text-sm border border-cyan-500/30 flex items-center space-x-2"
            >
              <span>{req}</span>
              <button
                type="button"
                onClick={() => removeFromArray('requirements', req)}
                className="text-cyan-300 hover:text-red-400"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newRequirement}
            onChange={(e) => setNewRequirement(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('requirements', newRequirement, setNewRequirement))}
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            placeholder="Add functional requirement"
          />
          <button
            type="button"
            onClick={() => addToArray('requirements', newRequirement, setNewRequirement)}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-3 rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Technical Specifications */}
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">
          Technical Specifications
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.technicalSpecs.map((spec) => (
            <span
              key={spec}
              className="bg-slate-700 text-slate-200 px-3 py-1 rounded-full text-sm border border-slate-600 flex items-center space-x-2"
            >
              <span>{spec}</span>
              <button
                type="button"
                onClick={() => removeFromArray('technicalSpecs', spec)}
                className="text-slate-400 hover:text-red-400"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newTechnicalSpec}
            onChange={(e) => setNewTechnicalSpec(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('technicalSpecs', newTechnicalSpec, setNewTechnicalSpec))}
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            placeholder="Add technical specification"
          />
          <button
            type="button"
            onClick={() => addToArray('technicalSpecs', newTechnicalSpec, setNewTechnicalSpec)}
            className="bg-slate-700 text-white px-4 py-3 rounded-lg hover:bg-slate-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Deliverables */}
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">
          Expected Deliverables *
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.deliverables.map((deliverable) => (
            <span
              key={deliverable}
              className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm border border-emerald-500/30 flex items-center space-x-2"
            >
              <span>{deliverable}</span>
              <button
                type="button"
                onClick={() => removeFromArray('deliverables', deliverable)}
                className="text-emerald-300 hover:text-red-400"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newDeliverable}
            onChange={(e) => setNewDeliverable(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('deliverables', newDeliverable, setNewDeliverable))}
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            placeholder="Add expected deliverable"
          />
          <button
            type="button"
            onClick={() => addToArray('deliverables', newDeliverable, setNewDeliverable)}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-3 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Integration Requirements
          </label>
          <textarea
            name="integrationRequirements"
            value={formData.integrationRequirements}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            placeholder="Describe integration needs with existing systems..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            <Shield className="w-4 h-4 inline mr-2" />
            Security Requirements
          </label>
          <textarea
            name="securityRequirements"
            value={formData.securityRequirements}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            placeholder="Specify security and compliance requirements..."
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <FileText className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Implementation & Review</h2>
        <p className="text-slate-300">Final details and project summary</p>
      </div>

      {/* Implementation Phases */}
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">
          Implementation Phases
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.implementationPhases.map((phase) => (
            <span
              key={phase}
              className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm border border-yellow-500/30 flex items-center space-x-2"
            >
              <span>{phase}</span>
              <button
                type="button"
                onClick={() => removeFromArray('implementationPhases', phase)}
                className="text-yellow-300 hover:text-red-400"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newPhase}
            onChange={(e) => setNewPhase(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('implementationPhases', newPhase, setNewPhase))}
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            placeholder="Add implementation phase"
          />
          <button
            type="button"
            onClick={() => addToArray('implementationPhases', newPhase, setNewPhase)}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-3 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Success Criteria */}
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">
          Success Criteria
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.successCriteria.map((criteria) => (
            <span
              key={criteria}
              className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 px-3 py-1 rounded-full text-sm border border-green-500/30 flex items-center space-x-2"
            >
              <span>{criteria}</span>
              <button
                type="button"
                onClick={() => removeFromArray('successCriteria', criteria)}
                className="text-green-300 hover:text-red-400"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newSuccessCriteria}
            onChange={(e) => setNewSuccessCriteria(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('successCriteria', newSuccessCriteria, setNewSuccessCriteria))}
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            placeholder="Add success criteria"
          />
          <button
            type="button"
            onClick={() => addToArray('successCriteria', newSuccessCriteria, setNewSuccessCriteria)}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Risk Assessment
          </label>
          <textarea
            name="riskAssessment"
            value={formData.riskAssessment}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            placeholder="Identify potential risks and mitigation strategies..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Maintenance & Support Needs
          </label>
          <textarea
            name="maintenanceNeeds"
            value={formData.maintenanceNeeds}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            placeholder="Describe ongoing maintenance and support requirements..."
          />
        </div>
      </div>

      {/* Supporting Documents */}
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">
          Supporting Documents
        </label>
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-emerald-500 bg-emerald-500/10' 
              : 'border-slate-600 bg-slate-800'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-300 mb-2">Upload supporting documents</p>
          <p className="text-sm text-slate-500 mb-4">Drag and drop files here, or click to select</p>
          <button
            type="button"
            className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors"
          >
            Choose Files
          </button>
        </div>
      </div>

      {/* Proposal Summary */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg p-6 border border-slate-600">
        <h3 className="text-lg font-semibold text-white mb-4">Proposal Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-400">Title:</span>
            <span className="text-white ml-2">{formData.title || 'Not set'}</span>
          </div>
          <div>
            <span className="text-slate-400">Category:</span>
            <span className="text-white ml-2">{formData.category || 'Not set'}</span>
          </div>
          <div>
            <span className="text-slate-400">Department:</span>
            <span className="text-white ml-2">{formData.department || 'Not set'}</span>
          </div>
          <div>
            <span className="text-slate-400">Budget:</span>
            <span className="text-white ml-2">${formData.budget ? parseInt(formData.budget).toLocaleString() : '0'}</span>
          </div>
          <div>
            <span className="text-slate-400">Timeline:</span>
            <span className="text-white ml-2">{formData.timeline || 'Not set'}</span>
          </div>
          <div>
            <span className="text-slate-400">Priority:</span>
            <span className={`ml-2 ${priorities.find(p => p.value === formData.priority)?.color || 'text-white'}`}>
              {priorities.find(p => p.value === formData.priority)?.label || 'Medium'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/government')}
          className="inline-flex items-center space-x-2 text-slate-300 hover:text-emerald-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Government Proposals</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            Submit Government Proposal
          </h1>
          <p className="text-slate-300 text-lg">
            Submit a comprehensive technology proposal for government consideration
          </p>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-700 p-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-8 border-t border-slate-700 mt-8">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-3 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => navigate('/government')}
                className="px-6 py-3 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-lg"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 shadow-lg font-semibold"
                >
                  {isLoading ? 'Submitting...' : 'Submit Proposal'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}