import React, { useState, useEffect } from 'react';
import ProjectService from '../services/ProjectService';

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const loadProjects = () => {
    ProjectService.getProjects()
      .then((response) => {
        setProjects(response.data);
      })
      .catch((error) => {
        console.error('Ошибка при загрузке проектов:', error);
      });
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = () => {
    const projectData = {
      name,
      description,
    };
    ProjectService.createProject(projectData)
      .then(() => {
        loadProjects();
        setName('');
        setDescription('');
      })
      .catch((error) => {
        console.error('Ошибка при создании проекта:', error);
      });
  };

  const handleDeleteProject = async (projectId) => {
    const confirmDelete = window.confirm('Вы уверены, что хотите удалить этот проект? Все связанные задачи будут также удалены.');
    if (!confirmDelete) return;
  
    try {
      await ProjectService.deleteProject(projectId);
      setProjects(projects.filter(project => project.id !== projectId));
      alert('Проект успешно удален');
    } catch (error) {
      console.error('Ошибка при удалении проекта:', error);
      alert('Не удалось удалить проект');
    }
  };

  return (
    <div>
      <h2>Проекты</h2>
      <div>
        <h3>Создать новый проект</h3>
        <input
          type="text"
          placeholder="Название проекта"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Описание проекта"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button onClick={handleCreateProject}>Создать</button>
      </div>
      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            ID: {project.id} - {project.name}
            <p>{project.description}</p>
            {/* Кнопка удаления */}
            <button
              onClick={() => handleDeleteProject(project.id)}
              style={{ marginLeft: '10px', color: 'red' }}
            >
              Удалить
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProjectsPage;