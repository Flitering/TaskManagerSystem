import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  Button,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Divider,
  Menu
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import TaskService from '../services/TaskService';
import AuthService from '../services/AuthService';
// Если нужно логировать «просмотр задачи»:
import DashboardService from '../services/DashboardService'; // для log_view, favorites и т.п.

function TaskDetailPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();

  // ======== STATES ========
  const [task, setTask] = useState(null);
  const [parentTask, setParentTask] = useState(null);

  // Основные поля задачи
  const [description, setDescription] = useState('');
  const [details, setDetails] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [timeSpent, setTimeSpent] = useState('');

  // Дополнительные поля
  const [issueType, setIssueType] = useState('Задача');
  const [labels, setLabels] = useState('');
  const [flagged, setFlagged] = useState(false);
  const [team, setTeam] = useState('');
  const [onlyForRoles, setOnlyForRoles] = useState('');
  const [watchers, setWatchers] = useState([]); // список user_id наблюдателей

  // Комментарии
  const [commentContent, setCommentContent] = useState('');

  // Вложения
  const [file, setFile] = useState(null);

  // Snackbar
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Флаг редактирования «Описание»
  const [isEditingDetails, setIsEditingDetails] = useState(false);

  // Вкладка активности: 0 = «Все», 1 = «Комментарии», 2 = «История»
  const [activityTab, setActivityTab] = useState(0);

  // Роль текущего пользователя (admin/manager/executor)
  const currentUserRole = AuthService.getUserRole();
  const canEdit = (currentUserRole === 'admin' || currentUserRole === 'manager');

  // Для меню «Действия»
  const [anchorActions, setAnchorActions] = useState(null);
  const handleActionsMenuOpen = (e) => setAnchorActions(e.currentTarget);
  const handleActionsMenuClose = () => setAnchorActions(null);

  // ===============================
  // LOAD TASK
  // ===============================
  useEffect(() => {
    loadTask();
  }, [taskId]);

  const loadTask = async () => {
    try {
      const res = await TaskService.getTask(taskId);
      const data = res.data;

      // Подстраховка от пустых массивов
      data.comments = data.comments || [];
      data.attachments = data.attachments || [];
      data.subtasks = data.subtasks || [];

      // Заполним локальный state
      setTask(data);
      setDescription(data.description || '');
      setDetails(data.details || '');
      setStatus(data.status || 'Новая');
      setPriority(data.priority || 'Средний');
      setEstimatedTime(String(data.estimated_time || '0'));
      setTimeSpent(String(data.time_spent || '0'));
      setIssueType(data.issue_type || 'Задача');
      setLabels(data.labels || '');
      setFlagged(!!data.flagged);
      setTeam(data.team || '');
      setOnlyForRoles(data.only_for_roles || '');
      setWatchers(data.watchers?.map(u => u.id) || []);

      // Родительская задача
      if (data.parent_task_id) {
        const parentRes = await TaskService.getTask(data.parent_task_id);
        setParentTask(parentRes.data);
      } else {
        setParentTask(null);
      }

      // Если хотите логировать «просмотр задачи»:
      // DashboardService.logView({ task_id: data.id }) 
      //   .then(() => console.log('Просмотр задачи залогирован'))
      //   .catch(err => console.error('Ошибка log_view:', err));

    } catch (err) {
      console.error('Ошибка при загрузке задачи:', err);
      showSnackbar('Не удалось загрузить задачу', 'error');
    }
  };

  // ===============================
  // UPDATE TASK
  // ===============================
  const handleUpdateTask = async () => {
    const payload = {
      description,
      details,
      status,
      priority,
      estimated_time: parseFloat(estimatedTime) || 0,
      time_spent: parseFloat(timeSpent) || 0,
      issue_type: issueType,
      labels,
      flagged,
      team,
      only_for_roles: onlyForRoles,
      watchers,
    };
    try {
      await TaskService.updateTask(taskId, payload);
      showSnackbar('Задача успешно обновлена');
      setIsEditingDetails(false);
      loadTask();
    } catch (err) {
      console.error('Ошибка при обновлении задачи:', err);
      showSnackbar('Не удалось обновить задачу', 'error');
    }
  };

  // ===============================
  // DELETE TASK
  // ===============================
  const handleDeleteTask = async () => {
    const conf = window.confirm('Вы действительно хотите удалить эту задачу?');
    if (!conf) return;
    try {
      await TaskService.deleteTask(taskId);
      showSnackbar('Задача удалена', 'success');
      navigate('/tasks');
    } catch (err) {
      console.error('Ошибка при удалении задачи:', err);
      showSnackbar('Не удалось удалить задачу', 'error');
    }
  };

  // ===============================
  // COMMENTS
  // ===============================
  const handleAddComment = async () => {
    if (!commentContent.trim()) return;
    try {
      await TaskService.addComment(taskId, { content: commentContent });
      setCommentContent('');
      showSnackbar('Комментарий добавлен', 'success');
      loadTask();
    } catch (err) {
      console.error('Ошибка при добавлении комментария:', err);
      showSnackbar('Не удалось добавить комментарий', 'error');
    }
  };

  // ===============================
  // ATTACHMENTS
  // ===============================
  const handleUploadAttachment = async () => {
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      await TaskService.uploadAttachment(taskId, formData);
      setFile(null);
      showSnackbar('Файл загружен', 'success');
      loadTask();
    } catch (err) {
      console.error('Ошибка при загрузке файла:', err);
      showSnackbar('Не удалось загрузить файл', 'error');
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    const conf = window.confirm('Удалить этот файл?');
    if (!conf) return;
    try {
      await TaskService.deleteAttachment(taskId, attachmentId);
      showSnackbar('Файл удалён', 'success');
      loadTask();
    } catch (err) {
      console.error('Ошибка при удалении файла:', err);
      showSnackbar('Не удалось удалить файл', 'error');
    }
  };

  // ===============================
  // ACTIVITY TABS
  // ===============================
  const handleActivityTabChange = (e, newValue) => {
    setActivityTab(newValue);
  };

  // Подготовка контента вкладок «Активность»
  let activityContent = null;
  if (!task) {
    // Если задача ещё не загружена
    activityContent = <Typography>Загрузка...</Typography>;
  } else {
    switch (activityTab) {
      case 0:
        // Все (комментарии + история)
        activityContent = (
          <Box>
            <Typography variant="body2" sx={{ mb:2 }}>
              Все записи активности (комментарии + история).
            </Typography>
            {task.comments.length > 0 ? (
              <List sx={{ mb:2 }}>
                {task.comments.map(c => (
                  <ListItem key={c.id}>
                    <ListItemText
                      primary={c.content}
                      secondary={`Автор: ${c.user?.username || '—'}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography>Нет комментариев.</Typography>
            )}
            <Divider sx={{ my:2 }} />
            <Typography variant="body2">
              История (здесь могла бы быть лента изменений: статус, исполнитель и т.д.).
            </Typography>
          </Box>
        );
        break;
      case 1:
        // Комментарии
        activityContent = (
          <Box>
            {task.comments.length > 0 ? (
              <List>
                {task.comments.map((c) => (
                  <ListItem key={c.id} alignItems="flex-start">
                    <ListItemText
                      primary={c.content}
                      secondary={`Автор: ${c.user?.username || '—'}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography>Нет комментариев</Typography>
            )}
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Добавить комментарий"
                multiline
                rows={3}
                fullWidth
                variant="outlined"
                size="small"
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
              />
              <Button
                variant="contained"
                sx={{ mt: 1 }}
                startIcon={<AddIcon />}
                onClick={handleAddComment}
              >
                Добавить комментарий
              </Button>
            </Box>
          </Box>
        );
        break;
      case 2:
      default:
        // История (заглушка)
        activityContent = (
          <Box>
            <Typography variant="body2">
              Здесь могла бы быть история изменений задачи.
            </Typography>
          </Box>
        );
        break;
    }
  }

  // Хелперы
  const showSnackbar = (msg, severity='success') => {
    setSnackbarMessage(msg);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpenSnackbar(false);
  };
  const formatDateTime = (dtString) => {
    if (!dtString) return '-';
    return new Date(dtString).toLocaleString();
  };

  // Если ещё не успели загрузить (task=null):
  if (!task) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>Загрузка задачи...</Typography>
      </Container>
    );
  }

  // Выясняем название проекта (если есть)
  const projectName = task.project ? task.project.name : '';

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      {/* Верхняя часть: Название задачи, кнопки */}
      <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        {/* Слева */}
        <Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {description || 'Без названия'}
            </Typography>
            {/* Вместо (KAN-{task.id}) пишем: (Проект: {projectName}) */}
            {projectName && (
              <Typography variant="body2" color="text.secondary">
                (Проект: {projectName})
              </Typography>
            )}
          </Box>

          {/* Пример «доп.кнопок»: */}
          <Box display="flex" alignItems="center" gap={1} sx={{ mt:1 }}>
            <Button variant="outlined" size="small" onClick={() => alert('Добавить эпик (не реализовано)')}>
              + Добавить Эпик
            </Button>
            <Button variant="outlined" size="small" onClick={() => alert('Приложения (не реализовано)')}>
              Приложения
            </Button>
          </Box>
        </Box>

        {/* Справа */}
        <Box display="flex" alignItems="center" gap={2}>
          {/* Select «Статус» */}
          <FormControl variant="outlined" size="small">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              onBlur={handleUpdateTask}
            >
              <MenuItem value="Новая">Новая</MenuItem>
              <MenuItem value="В процессе">В процессе</MenuItem>
              <MenuItem value="Завершена">Завершена</MenuItem>
            </Select>
          </FormControl>

          {/* Кнопка «Действия» */}
          <Button
            variant="outlined"
            size="small"
            startIcon={<MoreVertIcon />}
            onClick={handleActionsMenuOpen}
          >
            Действия
          </Button>
          <Menu
            anchorEl={anchorActions}
            open={Boolean(anchorActions)}
            onClose={handleActionsMenuClose}
          >
            <MenuItem
              onClick={() => {
                handleActionsMenuClose();
                setFlagged(!flagged);
                setTimeout(handleUpdateTask, 0);
              }}
            >
              {flagged ? 'Убрать флажок (Impediment)' : 'Добавить флажок (Impediment)'}
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleActionsMenuClose();
                alert('Клонировать задачу (не реализовано)');
              }}
            >
              Клонировать
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleActionsMenuClose();
                handleDeleteTask();
              }}
            >
              Удалить
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                handleActionsMenuClose();
                alert('Настроить задачу (не реализовано)');
              }}
            >
              Настроить
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={2}>
        {/* Левая колонка */}
        <Grid item xs={12} md={8}>

          {/* Параметры задачи */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight:'bold', mb:1 }}>
              Параметры задачи
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={2}>
              {/* Тип задачи */}
              <FormControl size="small">
                <InputLabel>Тип</InputLabel>
                <Select
                  label="Тип"
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  onBlur={handleUpdateTask}
                >
                  <MenuItem value="Задача">Задача</MenuItem>
                  <MenuItem value="Ошибка">Ошибка</MenuItem>
                  <MenuItem value="Эпик">Эпик</MenuItem>
                </Select>
              </FormControl>

              {/* Приоритет */}
              <FormControl size="small">
                <InputLabel>Приоритет</InputLabel>
                <Select
                  label="Приоритет"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  onBlur={handleUpdateTask}
                >
                  <MenuItem value="Низкий">Низкий</MenuItem>
                  <MenuItem value="Средний">Средний</MenuItem>
                  <MenuItem value="Высокий">Высокий</MenuItem>
                </Select>
              </FormControl>

              {/* Оценка */}
              <TextField
                size="small"
                label="Оценка (ч)"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                onBlur={handleUpdateTask}
                sx={{ width:120 }}
              />

              {/* Потрачено */}
              <TextField
                size="small"
                label="Потрачено (ч)"
                value={timeSpent}
                onChange={(e) => setTimeSpent(e.target.value)}
                onBlur={handleUpdateTask}
                sx={{ width:120 }}
              />

              {/* Флажок (Impediment) */}
              <Box display="flex" alignItems="center">
                <Checkbox
                  checked={flagged}
                  onChange={(e) => {
                    setFlagged(e.target.checked);
                    setTimeout(handleUpdateTask, 0);
                  }}
                />
                <Typography>Impediment</Typography>
              </Box>
            </Box>
          </Box>

          {/* Описание */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb:1 }}>Описание</Typography>
            {isEditingDetails && canEdit ? (
              <TextField
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                size="small"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                onBlur={handleUpdateTask}
              />
            ) : (
              <Typography
                sx={{
                  cursor: canEdit ? 'pointer' : 'default',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
                onClick={() => {
                  if (canEdit) setIsEditingDetails(true);
                }}
              >
                {details || 'Нажмите, чтобы добавить / отредактировать описание'}
              </Typography>
            )}
          </Box>

          {/* Вложения */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb:1 }}>Вложения</Typography>
            {task.attachments.length > 0 ? (
              <List>
                {task.attachments.map((att) => (
                  <ListItem
                    key={att.id}
                    sx={{ display:'flex', justifyContent:'space-between' }}
                  >
                    <Box>
                      <a
                        href={att.file_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ textDecoration:'none', color:'#1976d2' }}
                      >
                        {att.filename}
                      </a>
                    </Box>
                    {canEdit && (
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteAttachment(att.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography>Нет вложений</Typography>
            )}

            {canEdit && (
              <Box sx={{ mt:2, display:'flex', gap:1 }}>
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<UploadFileIcon />}
                >
                  Выбрать файл
                  <input
                    type="file"
                    hidden
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                </Button>
                <Button
                  variant="contained"
                  disabled={!file}
                  onClick={handleUploadAttachment}
                >
                  Загрузить
                </Button>
              </Box>
            )}
          </Box>

          {/* Подзадачи */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb:1 }}>Подзадачи</Typography>
            {task.subtasks.length > 0 ? (
              <List>
                {task.subtasks.map((st) => (
                  <ListItem key={st.id}>
                    <ListItemText
                      primary={(
                        <RouterLink
                          to={`/tasks/${st.id}`}
                          style={{ textDecoration:'none', color:'#1976d2' }}
                        >
                          {st.description}
                        </RouterLink>
                      )}
                      secondary={`Статус: ${st.status}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography>Нет подзадач</Typography>
            )}
            {canEdit && (
              <Button
                variant="contained"
                color="secondary"
                component={RouterLink}
                to={`/tasks/${task.id}/create-subtask`}
                startIcon={<AddIcon />}
              >
                Создать подзадачу
              </Button>
            )}
          </Box>

          {/* Активность (Tabs) - в самом низу по пожеланию */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb:1 }}>Активность</Typography>
            <Tabs value={activityTab} onChange={handleActivityTabChange} sx={{ mb:2 }}>
              <Tab label="Все" />
              <Tab label="Комментарии" />
              <Tab label="История" />
            </Tabs>

            {activityContent}
          </Box>

          {/* Кнопка «Удалить задачу» (опционально) */}
          {canEdit && (
            <Box sx={{ mb: 3 }}>
              <Button variant="outlined" color="error" onClick={handleDeleteTask}>
                Удалить задачу
              </Button>
            </Box>
          )}
        </Grid>

        {/* Правая колонка: «Сведения» */}
        <Grid item xs={12} md={4}>
          <Box sx={{ p:2, border:'1px solid #ddd', borderRadius:1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight:'bold', mb:1 }}>
              Сведения
            </Typography>

            {/* Исполнитель */}
            <Box sx={{ mb:1 }}>
              <Typography variant="body2" color="text.secondary">
                Исполнитель:
              </Typography>
              <Typography>
                {task.assigned_user
                  ? task.assigned_user.username
                  : '—'}
              </Typography>
            </Box>

            {/* Метки */}
            <Box sx={{ mb:1 }}>
              <Typography variant="body2" color="text.secondary">
                Метки
              </Typography>
              <Typography>
                {labels || 'Нет'}
              </Typography>
            </Box>

            {/* Родительская задача */}
            <Box sx={{ mb:1 }}>
              <Typography variant="body2" color="text.secondary">
                Родитель
              </Typography>
              {parentTask ? (
                <Typography>
                  <RouterLink
                    to={`/tasks/${parentTask.id}`}
                    style={{ textDecoration:'none', color:'#1976d2' }}
                  >
                    {parentTask.description}
                  </RouterLink>
                </Typography>
              ) : (
                <Typography>Нет</Typography>
              )}
            </Box>

            {/* Команда */}
            <Box sx={{ mb:1 }}>
              <Typography variant="body2" color="text.secondary">
                Команда
              </Typography>
              <Typography>{team || 'Не указано'}</Typography>
            </Box>

            {/* Автор */}
            <Box sx={{ mb:1 }}>
              <Typography variant="body2" color="text.secondary">
                Автор
              </Typography>
              <Typography>
                {task.creator ? task.creator.username : '—'}
              </Typography>
            </Box>
          </Box>

          {/* Дата создания / обновления */}
          <Box sx={{ mt:2, p:2, border:'1px solid #ddd', borderRadius:1 }}>
            <Typography variant="body2" sx={{ color:'text.secondary' }}>
              Создано: {formatDateTime(task.created_at)}
            </Typography>
            <Typography variant="body2" sx={{ color:'text.secondary' }}>
              Обновлено: {task.updated_at ? formatDateTime(task.updated_at) : '-'}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical:'bottom', horizontal:'center' }}
      >
        <Alert severity={snackbarSeverity} onClose={handleCloseSnackbar} sx={{ width:'100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default TaskDetailPage;
