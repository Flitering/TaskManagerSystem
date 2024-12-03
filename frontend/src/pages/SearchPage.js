import React, { useState } from 'react';
import TaskService from '../services/TaskService';
import ProjectService from '../services/ProjectService';
import { Link } from 'react-router-dom';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [taskResults, setTaskResults] = useState([]);
  const [projectResults, setProjectResults] = useState([]);

  const handleSearch = () => {
    TaskService.searchTasks(query)
      .then((response) => setTaskResults(response.data))
      .catch((error) => console.error(error));

    ProjectService.searchProjects(query)
      .then((response) => setProjectResults(response.data))
      .catch((error) => console.error(error));
  };

  return (
    <div>
      <h2>Поиск</h2>
      <input
        type="text"
        placeholder="Введите запрос"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Искать</button>

      <h3>Результаты по задачам</h3>
      <ul>
        {taskResults.map((task) => (
          <li key={task.id}>
            <Link to={`/tasks/${task.id}`}>{task.description}</Link>
          </li>
        ))}
      </ul>

      <h3>Результаты по проектам</h3>
      <ul>
        {projectResults.map((project) => (
          <li key={project.id}>
            <Link to={`/projects/${project.id}`}>{project.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SearchPage;