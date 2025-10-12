
import React from 'react';
import TasksPage from './TasksPage';

function TasksPageWrapper({ allTasks, selectedRange, goBack }) {
  if (!selectedRange || !allTasks.length) {
    return <div>Загрузка...</div>;
  }

  // Разбор диапазона, например "1-10"
  const [start, end] = selectedRange.split('-').map(Number);

  // Фильтруем задачи из нужного диапазона
  const selectedTasks = allTasks.filter(task => task.id >= start && task.id <= end);

  if (selectedTasks.length === 0) {
    return <div>Нет задач</div>;
  }

  return (
    <TasksPage
      tasks={selectedTasks}
      goBack={goBack}
      rangeLabel={`${start}–${end}`} // Можно передать для заголовка
    />
  );
}

export default TasksPageWrapper;
