import React, { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Plus, Link as LinkIcon, Github, Globe, Image, DollarSign, Users, Tag, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export function Submit() {
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
    tags: [] as string[],
    website: '',
    github: '',
    image: '',
    gallery: [] as string[],
    fundingGoal: '',
    isFunding: false,
    timeline: '',
    teamSize: '1',
    lookingForCollaborators: false,
    collaboratorRoles: [] as string[],
    techStack: [] as string[],
    targetAudience: '',
    businessModel: '',
    currentStage: 'idea',
    launchDate: '',
    socialLinks: {
      twitter: '',
      linkedin: '',
      telegram: '',
      youtube: ''
    }
  });

  const [newTag, setNewTag] = useState('');
  const [newTechStack, setNewTechStack] = useState('');
  const [newCollaboratorRole, setNewCollaboratorRole] = useState('');
  const [dragActive, setDragActive] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const categories = [
    'Mobile App',
    'Web Application',
    'AI/ML',
    'Blockchain',
    'FinTech',
    'HealthTech',
    'EdTech',
    'AgTech',
    'E-commerce',
    'SaaS',
    'Gaming',
    'IoT',
    'DevTools',
    'Other'
  ];

  const stages = [
    { value: 'idea', label: 'Idea Stage' },
    { value: 'prototype', label: 'Prototype' },
    { value: 'mvp', label: 'MVP' },
    { value: 'beta', label: 'Beta Testing' },
    { value: 'launched', label: 'Launched' },
    { value: 'scaling', label: 'Scaling' }
  ];

  const businessModels = [
    'Freemium',
    'Subscription',
    'One-time Purchase',
    'Advertising',
    'Commission',
    'Enterprise',
    'Open Source',
    'Non-profit',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Redirect to products page after successful submission
    navigate('/products');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checkbox.checked }));
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent as keyof typeof prev], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const addTechStack = () => {
    if (newTechStack.trim() && !formData.techStack.includes(newTechStack.trim())) {
      setFormData(prev => ({ ...prev, techStack: [...prev.techStack, newTechStack.trim()] }));
      setNewTechStack('');
    }
  };

  const removeTechStack = (techToRemove: string) => {
    setFormData(prev => ({ ...prev, techStack: prev.techStack.filter(tech => tech !== techToRemove) }));
  };

  const addCollaboratorRole = () => {
    if (newCollaboratorRole.trim() && !formData.collaboratorRoles.includes(newCollaboratorRole.trim())) {
      setFormData(prev => ({ ...prev, collaboratorRoles: [...prev.collaboratorRoles, newCollaboratorRole.trim()] }));
      setNewCollaboratorRole('');
    }
  };

  const removeCollaboratorRole = (roleToRemove: string) => {
    setFormData(prev => ({ ...prev, collaboratorRoles: prev.collaboratorRoles.filter(role => role !== roleToRemove) }));
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
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
            step <= currentStep 
              ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white' 
              : 'bg-slate-700 text-slate-400'
          }`}>
            {step}
          </div>
          {step < 4 && (
            <div className={`w-16 h-1 mx-2 ${
              step < currentStep ? 'bg-gradient-to-r from-cyan-500 to-purple-500' : 'bg-slate-700'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Basic Information</h2>
      
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
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
            placeholder="Enter your project title"
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
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
            placeholder="የፕሮጀክት ስም"
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
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
            placeholder="Describe your project, its purpose, and key features"
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
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
            placeholder="የፕሮጀክት መግለጫ"
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
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Current Stage *
          </label>
          <select
            name="currentStage"
            required
            value={formData.currentStage}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
          >
            {stages.map(stage => (
              <option key={stage.value} value={stage.value}>{stage.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Team Size
          </label>
          <input
            type="number"
            name="teamSize"
            value={formData.teamSize}
            onChange={handleInputChange}
            min="1"
            max="100"
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">
          Target Audience
        </label>
        <input
          type="text"
          name="targetAudience"
          value={formData.targetAudience}
          onChange={handleInputChange}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
          placeholder="Who is your target audience? (e.g., Small businesses, Students, Farmers)"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Links & Media</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            <Globe className="w-4 h-4 inline mr-2" />
            Website URL
          </label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
            placeholder="https://your-project.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            <Github className="w-4 h-4 inline mr-2" />
            GitHub Repository
          </label>
          <input
            type="text"
            name="github"
            value={formData.github}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
            placeholder="username/repository"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Twitter
          </label>
          <input
            type="text"
            name="socialLinks.twitter"
            value={formData.socialLinks.twitter}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
            placeholder="@username"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            LinkedIn
          </label>
          <input
            type="url"
            name="socialLinks.linkedin"
            value={formData.socialLinks.linkedin}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
            placeholder="https://linkedin.com/in/username"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Telegram
          </label>
          <input
            type="text"
            name="socialLinks.telegram"
            value={formData.socialLinks.telegram}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
            placeholder="@username"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            YouTube
          </label>
          <input
            type="url"
            name="socialLinks.youtube"
            value={formData.socialLinks.youtube}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
            placeholder="https://youtube.com/channel/..."
          />
        </div>
      </div>

      {/* Main Project Image */}
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">
          <Image className="w-4 h-4 inline mr-2" />
          Main Project Image *
        </label>
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-cyan-500 bg-cyan-500/10' 
              : 'border-slate-600 bg-slate-800'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-300 mb-2">Upload main project image or enter URL</p>
          <p className="text-sm text-slate-500 mb-4">Drag and drop files here, or click to select</p>
          <input
            type="url"
            name="image"
            value={formData.image}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>

      {/* Launch Date */}
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">
          <Calendar className="w-4 h-4 inline mr-2" />
          Expected/Actual Launch Date
        </label>
        <input
          type="date"
          name="launchDate"
          value={formData.launchDate}
          onChange={handleInputChange}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Technical Details & Tags</h2>
      
      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">
          <Tag className="w-4 h-4 inline mr-2" />
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.tags.map((tag) => (
            <span
              key={tag}
              className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 px-3 py-1 rounded-full text-sm border border-cyan-500/30 flex items-center space-x-2"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(tag)}
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
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
            placeholder="Add a tag (e.g., react, mobile, ai)"
          />
          <button
            type="button"
            onClick={addTag}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-3 rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tech Stack */}
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">
          Technology Stack
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.techStack.map((tech) => (
            <span
              key={tech}
              className="bg-slate-700 text-slate-200 px-3 py-1 rounded-full text-sm border border-slate-600 flex items-center space-x-2"
            >
              <span>{tech}</span>
              <button
                type="button"
                onClick={() => removeTechStack(tech)}
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
            value={newTechStack}
            onChange={(e) => setNewTechStack(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechStack())}
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
            placeholder="Add technology (e.g., React, Node.js, MongoDB)"
          />
          <button
            type="button"
            onClick={addTechStack}
            className="bg-slate-700 text-white px-4 py-3 rounded-lg hover:bg-slate-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Business Model */}
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">
          Business Model
        </label>
        <select
          name="businessModel"
          value={formData.businessModel}
          onChange={handleInputChange}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
        >
          <option value="">Select business model</option>
          {businessModels.map(model => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>
      </div>

      {/* Timeline */}
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">
          Development Timeline
        </label>
        <input
          type="text"
          name="timeline"
          value={formData.timeline}
          onChange={handleInputChange}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
          placeholder="e.g., 6 months, 1 year, Ongoing"
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Collaboration & Funding</h2>
      
      {/* Looking for Collaborators */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="flex items-center space-x-3 mb-4">
          <input
            type="checkbox"
            name="lookingForCollaborators"
            id="lookingForCollaborators"
            checked={formData.lookingForCollaborators}
            onChange={handleInputChange}
            className="w-5 h-5 text-cyan-600 focus:ring-cyan-500 border-slate-600 rounded bg-slate-700"
          />
          <label htmlFor="lookingForCollaborators" className="text-lg font-medium text-white">
            <Users className="w-5 h-5 inline mr-2" />
            Looking for Collaborators
          </label>
        </div>
        
        {formData.lookingForCollaborators && (
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Roles Needed
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.collaboratorRoles.map((role) => (
                <span
                  key={role}
                  className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm border border-emerald-500/30 flex items-center space-x-2"
                >
                  <span>{role}</span>
                  <button
                    type="button"
                    onClick={() => removeCollaboratorRole(role)}
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
                value={newCollaboratorRole}
                onChange={(e) => setNewCollaboratorRole(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCollaboratorRole())}
                className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                placeholder="e.g., Frontend Developer, UI/UX Designer, Marketing"
              />
              <button
                type="button"
                onClick={addCollaboratorRole}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-3 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Funding */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="flex items-center space-x-3 mb-4">
          <input
            type="checkbox"
            name="isFunding"
            id="isFunding"
            checked={formData.isFunding}
            onChange={handleInputChange}
            className="w-5 h-5 text-cyan-600 focus:ring-cyan-500 border-slate-600 rounded bg-slate-700"
          />
          <label htmlFor="isFunding" className="text-lg font-medium text-white">
            <DollarSign className="w-5 h-5 inline mr-2" />
            Enable Funding/Pledges
          </label>
        </div>
        
        {formData.isFunding && (
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Funding Goal (USD)
            </label>
            <input
              type="number"
              name="fundingGoal"
              value={formData.fundingGoal}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
              placeholder="50000"
              min="1000"
            />
            <p className="text-sm text-slate-400 mt-2">
              Set a realistic funding goal to help bring your project to life
            </p>
          </div>
        )}
      </div>

      {/* Project Summary */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg p-6 border border-slate-600">
        <h3 className="text-lg font-semibold text-white mb-4">Project Summary</h3>
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
            <span className="text-slate-400">Stage:</span>
            <span className="text-white ml-2">{stages.find(s => s.value === formData.currentStage)?.label}</span>
          </div>
          <div>
            <span className="text-slate-400">Team Size:</span>
            <span className="text-white ml-2">{formData.teamSize} member{formData.teamSize !== '1' ? 's' : ''}</span>
          </div>
          <div>
            <span className="text-slate-400">Tags:</span>
            <span className="text-white ml-2">{formData.tags.length} tag{formData.tags.length !== 1 ? 's' : ''}</span>
          </div>
          <div>
            <span className="text-slate-400">Funding:</span>
            <span className="text-white ml-2">{formData.isFunding ? `$${formData.fundingGoal || '0'}` : 'Not enabled'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Submit Your Project
          </h1>
          <p className="text-slate-300 text-lg">
            Share your innovation with the Ethiopian tech community
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
                onClick={() => navigate('/products')}
                className="px-6 py-3 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all shadow-lg"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 shadow-lg font-semibold"
                >
                  {isLoading ? 'Submitting...' : 'Submit Project'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}