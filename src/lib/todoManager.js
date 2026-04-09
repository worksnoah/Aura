const STORAGE_KEY = "aura_todo_list";

export function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to load todos:", error);
    return [];
  }
}

export function saveTodos(todos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    console.error("Failed to save todos:", error);
  }
}

export function createTodo(text) {
  return {
    id: crypto.randomUUID(),
    text: text.trim(),
    completed: false
  };
}

export function addTodo(todos, text) {
  const clean = text.trim();
  if (!clean) return todos;
  return [...todos, createTodo(clean)];
}

export function clearTodos() {
  return [];
}

export function toggleTodoComplete(todos, id) {
  return todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
}

export function removeTodoById(todos, id) {
  return todos.filter((todo) => todo.id !== id);
}

export function removeTodoByText(todos, text) {
  const target = text.trim().toLowerCase();
  return todos.filter((todo) => todo.text.trim().toLowerCase() !== target);
}

export function completeTodoByText(todos, text) {
  const target = text.trim().toLowerCase();
  return todos.map((todo) =>
    todo.text.trim().toLowerCase() === target
      ? { ...todo, completed: true }
      : todo
  );
}

export function parseTodoCommand(transcript) {
  const input = transcript.trim();
  const lower = input.toLowerCase();

  if (lower === "clear my to do list" || lower === "clear my to-do list" || lower === "clear my todo list") {
    return { type: "clear" };
  }

  const addPatterns = [
    "add ",
    "put ",
    "remind me to "
  ];

  for (const prefix of addPatterns) {
    if (lower.startsWith(prefix)) {
      return {
        type: "add",
        value: input.slice(prefix.length).trim()
      };
    }
  }

  const removePatterns = [
    "remove ",
    "delete ",
    "take off "
  ];

  for (const prefix of removePatterns) {
    if (lower.startsWith(prefix)) {
      return {
        type: "remove",
        value: input.slice(prefix.length).trim()
      };
    }
  }

  const completePatterns = [
    "cross off ",
    "complete ",
    "finish ",
    "mark done "
  ];

  for (const prefix of completePatterns) {
    if (lower.startsWith(prefix)) {
      return {
        type: "complete",
        value: input.slice(prefix.length).trim()
      };
    }
  }

  return { type: "none" };
}