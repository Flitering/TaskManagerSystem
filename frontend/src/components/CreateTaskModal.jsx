import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Box,
  Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import ProjectService from '../services/ProjectService';
import UserService from '../services/UserService';
import TaskService from '../services/TaskService';
import AuthService from '../services/AuthService';
import DashboardService from '../services/DashboardService'; // для добавления в избранное и т.д.

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const menuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

// Варианты для селектов
const ISSUE_TYPES = ['Задача', 'Ошибка', 'Эпик'];
const PRIORITIES = ['Низкий', 'Средний', 'Высокий'];

function CreateTaskModal({ open, onClose, onTaskCreated }) {
  const currentUserRole = AuthService.getUserRole();
  const canManage = (currentUserRole === 'admin' || currentUserRole === 'manager');

  // Списки проектов и пользователей
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  // Поля задачи
  const [description, setDescription] = useState('');
  const [details, setDetails] = useState('');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [priority, setPriority] = useState('Средний');
  const [issueType, setIssueType] = useState('Задача');
  const [labels, setLabels] = useState('');
  const [flagged, setFlagged] = useState(false);
  const [team, setTeam] = useState('');
  const [onlyForRoles, setOnlyForRoles] = useState('');
  const [watchers, setWatchers] = useState([]);

  // Доп.галочка: «Сразу добавить задачу в избранное»
  const [addToFavorites, setAddToFavorites] = useState(false);

  useEffect(() => {
    if (open) {
      // Загрузить проекты
      ProjectService.getProjects()
        .then(res => setProjects(res.data))
        .catch(err => console.error('Ошибка при загрузке проектов:', err));

      // Загрузить пользователей (для admin/manager)
      if (canManage) {
        UserService.getUsers()
          .then(res => setUsers(res.data))
          .catch(err => console.error('Ошибка при загрузке пользователей:', err));
      }
    }
  }, [open, canManage]);

  const resetFields = () => {
    setDescription('');
    setDetails('');
    setAssignedUserId('');
    setProjectId('');
    setEstimatedTime('');
    setPriority('Средний');
    setIssueType('Задача');
    setLabels('');
    setFlagged(false);
    setTeam('');
    setOnlyForRoles('');
    setWatchers([]);
    setAddToFavorites(false);
  };

  const handleCloseDialog = () => {
    resetFields();
    onClose();
  };

  const handleCreateTask = () => {
    if (!description.trim()) {
      alert('Поле «Описание задачи» обязательно.');
      return;
    }

    // Формируем payload для создания задачи
    const payload = {
      description,
      details,
      assigned_user_id: assignedUserId ? parseInt(assignedUserId, 10) : null,
      project_id: projectId ? parseInt(projectId, 10) : null,
      estimated_time: parseFloat(estimatedTime) || 0,
      priority,
      issue_type: issueType,
      labels,
      flagged,
      team,
      only_for_roles: onlyForRoles,
      watchers
    };

    // 1) Создаём задачу
    TaskService.createTask(payload)
      .then((resp) => {
        if (!resp.data) {
          // на случай, если TaskService не возвращает .data
          console.warn('Не вернулись данные задачи. resp=', resp);
          if (onTaskCreated) onTaskCreated();
          return;
        }

        const createdTask = resp.data;

        // 2) Если пользователь выбрал «Сразу добавить задачу в избранное»
        if (addToFavorites && createdTask.id) {
          // dashboardService.addToFavorites(...) — 
          // у нас есть эндпоинт /dashboard/favorites/add?task_id=...
          DashboardService.addToFavorites({ task_id: createdTask.id })
            .then(() => {
              console.log('Задача добавлена в избранное');
              // можно показать уведомление
            })
            .catch(err => {
              console.error('Ошибка при добавлении в избранное:', err);
            })
            .finally(() => {
              // Всё равно закрываем модалку
              if (onTaskCreated) onTaskCreated();
            });
        } else {
          // Если не добавляем в избранное — просто закрываем
          if (onTaskCreated) onTaskCreated();
        }
      })
      .catch(err => {
        console.error('Ошибка при создании задачи:', err);
        alert('Не удалось создать задачу');
      });
  };

  // множественный выбор наблюдателей
  const handleWatchersChange = (e) => {
    const { value } = e.target;
    setWatchers(typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <Dialog open={open} onClose={handleCloseDialog} fullWidth maxWidth="md">
      <DialogTitle>Создать новую задачу</DialogTitle>
      <DialogContent>
        {/* Тип задачи */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Тип задачи</InputLabel>
          <Select
            value={issueType}
            label="Тип задачи"
            onChange={(e) => setIssueType(e.target.value)}
          >
            {ISSUE_TYPES.map((it) => (
              <MenuItem key={it} value={it}>{it}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Проект */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Проект</InputLabel>
          <Select
            value={projectId}
            label="Проект"
            onChange={(e) => setProjectId(e.target.value)}
          >
            <MenuItem value="">
              <em>Не указано</em>
            </MenuItem>
            {projects.map((proj) => (
              <MenuItem key={proj.id} value={proj.id}>
                {proj.name} (ID: {proj.id})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Описание задачи */}
        <TextField
          label="Описание задачи (обязательное)"
          variant="outlined"
          fullWidth
          margin="normal"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Дополнительные детали */}
        <TextField
          label="Дополнительные детали"
          variant="outlined"
          fullWidth
          margin="normal"
          multiline
          rows={4}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />

        {/* Назначение пользователя (только admin/manager) */}
        {canManage && (
          <FormControl fullWidth margin="normal">
            <InputLabel>Назначить исполнителя</InputLabel>
            <Select
              value={assignedUserId}
              label="Назначить исполнителя"
              onChange={(e) => setAssignedUserId(e.target.value)}
            >
              <MenuItem value="">
                <em>Без назначения</em>
              </MenuItem>
              {users.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.username} (ID: {u.id})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Наблюдатели (только admin/manager) */}
        {canManage && (
          <FormControl fullWidth margin="normal">
            <InputLabel>Наблюдатели</InputLabel>
            <Select
              multiple
              value={watchers}
              onChange={handleWatchersChange}
              input={<OutlinedInput label="Наблюдатели" />}
              renderValue={(selected) => {
                const selectedUsers = users.filter(u => selected.includes(u.id));
                return selectedUsers.map(su => su.username).join(', ');
              }}
              MenuProps={menuProps}
            >
              {users.map((usr) => (
                <MenuItem key={usr.id} value={usr.id}>
                  <Checkbox checked={watchers.indexOf(usr.id) > -1} />
                  <ListItemText primary={usr.username} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Оценочное время */}
        <TextField
          label="Оценочное время (ч)"
          variant="outlined"
          type="number"
          fullWidth
          margin="normal"
          value={estimatedTime}
          onChange={(e) => setEstimatedTime(e.target.value)}
        />

        {/* Приоритет */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Приоритет</InputLabel>
          <Select
            value={priority}
            label="Приоритет"
            onChange={(e) => setPriority(e.target.value)}
          >
            {PRIORITIES.map(p => (
              <MenuItem key={p} value={p}>{p}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Метки */}
        <TextField
          label="Метки (через запятую)"
          variant="outlined"
          fullWidth
          margin="normal"
          value={labels}
          onChange={(e) => setLabels(e.target.value)}
        />

        {/* Блокирующая задача (flagged) */}
        <Box sx={{ display:'flex', alignItems:'center', mt:1 }}>
          <Checkbox
            checked={flagged}
            onChange={e => setFlagged(e.target.checked)}
          />
          <Typography>Является блокирующей (Impediment)</Typography>
        </Box>

        {/* Команда */}
        <TextField
          label="Команда (строка)"
          variant="outlined"
          fullWidth
          margin="normal"
          value={team}
          onChange={(e) => setTeam(e.target.value)}
        />

        {/* only_for_roles */}
        <TextField
          label="Доступно только для ролей (через запятую)"
          variant="outlined"
          fullWidth
          margin="normal"
          value={onlyForRoles}
          onChange={(e) => setOnlyForRoles(e.target.value)}
        />

        {/* Галочка «Добавить задачу в избранное» */}
        <Box sx={{ display:'flex', alignItems:'center', mt:2 }}>
          <Checkbox
            checked={addToFavorites}
            onChange={(e) => setAddToFavorites(e.target.checked)}
          />
          <Typography>Сразу добавить задачу в избранное</Typography>
        </Box>

      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog}>Отмена</Button>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateTask}>
          Создать
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateTaskModal;
