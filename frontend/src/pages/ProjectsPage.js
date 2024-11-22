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
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProjectsPage;