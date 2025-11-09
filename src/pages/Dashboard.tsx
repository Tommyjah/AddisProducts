import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, Plus, Mail, Globe, Github, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ProfileEditModal } from '../components/Dashboard/ProfileEditModal';
import { ProjectForm } from '../components/Dashboard/ProjectForm';

interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  status: string;
  funding_goal: number;
  current_funding: number;
  website_url: string;
  github_url: string;
  created_at: string;
  tags: string[];
}

export function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadProjects();
  }, [user, navigate]);

  const loadProjects = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('user_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      const { error } = await supabase
        .from('user_projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  };

  const handleProjectSave = async (projectData: any) => {
    if (!user) return;

    try {
      if (editingProject) {
        const { error } = await supabase
          .from('user_projects')
          .update(projectData)
          .eq('id', editingProject.id);

        if (error) throw error;
        setProjects(projects.map(p => p.id === editingProject.id ? { ...p, ...projectData } : p));
      } else {
        const { data, error } = await supabase
          .from('user_projects')
          .insert([{ ...projectData, user_id: user.id }])
          .select();

        if (error) throw error;
        if (data) setProjects([data[0], ...projects]);
      }

      setIsProjectFormOpen(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
              <div className="flex flex-col items-center text-center">
                <img
                  src={user.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'}
                  alt={user.name}
                  className="w-24 h-24 rounded-full border-4 border-cyan-500 mb-4 object-cover"
                />
                <h1 className="text-2xl font-bold text-slate-900 mb-2">{user.name}</h1>
                <p className="text-sm font-medium text-cyan-600 mb-4 capitalize">{user.role}</p>

                {user.bio && (
                  <p className="text-slate-600 text-sm mb-6">{user.bio}</p>
                )}

                <div className="w-full space-y-3 mb-6">
                  <div className="flex items-center justify-center text-slate-600 text-sm">
                    <Mail className="w-4 h-4 mr-2" />
                    <span className="truncate">{user.email}</span>
                  </div>

                  {user.joinedAt && (
                    <div className="flex items-center justify-center text-slate-600 text-sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Joined {new Date(user.joinedAt).toLocaleDateString()}</span>
                    </div>
                  )}

                  {user.website && (
                    <a
                      href={user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center text-cyan-600 hover:text-cyan-700 text-sm"
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      <span className="truncate">{user.website}</span>
                    </a>
                  )}

                  {user.github && (
                    <a
                      href={`https://github.com/${user.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center text-cyan-600 hover:text-cyan-700 text-sm"
                    >
                      <Github className="w-4 h-4 mr-2" />
                      <span className="truncate">{user.github}</span>
                    </a>
                  )}
                </div>

                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-4 py-2 rounded-lg font-medium hover:from-cyan-600 hover:to-cyan-700 transition-all shadow-md"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-slate-900">My Projects</h2>
                <button
                  onClick={() => {
                    setEditingProject(null);
                    setIsProjectFormOpen(true);
                  }}
                  className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-4 py-2 rounded-lg font-medium hover:from-cyan-600 hover:to-cyan-700 transition-all shadow-md"
                >
                  <Plus className="w-5 h-5" />
                  <span>New Project</span>
                </button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                </div>
              ) : projects.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <p className="text-slate-500 text-lg mb-4">No projects yet</p>
                  <button
                    onClick={() => {
                      setEditingProject(null);
                      setIsProjectFormOpen(true);
                    }}
                    className="inline-flex items-center space-x-2 bg-cyan-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-cyan-600 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create your first project</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map((project) => (
                    <div key={project.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                      {project.image_url && (
                        <img
                          src={project.image_url}
                          alt={project.title}
                          className="w-full h-40 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">{project.title}</h3>
                        <p className="text-slate-600 text-sm mb-3 line-clamp-2">{project.description}</p>

                        {project.tags && project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {project.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="bg-cyan-100 text-cyan-700 text-xs px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                          <span className="capitalize">{project.status}</span>
                          {project.current_funding > 0 && (
                            <span>{project.current_funding} / {project.funding_goal}</span>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingProject(project);
                              setIsProjectFormOpen(true);
                            }}
                            className="flex-1 flex items-center justify-center space-x-1 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded-lg font-medium transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            className="flex-1 flex items-center justify-center space-x-1 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg font-medium transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ProfileEditModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <ProjectForm
        isOpen={isProjectFormOpen}
        onClose={() => {
          setIsProjectFormOpen(false);
          setEditingProject(null);
        }}
        project={editingProject}
        onSave={handleProjectSave}
      />
    </div>
  );
}
