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
  const lower = input.toLowerCase().replace(/\s+/g, " ").trim();

  const stripTaskNoise = (text) => {
    return text
      .replace(/^(that |this )/i, "")
      .replace(/^(a |an )/i, "")
      .replace(/\b(to my to do list|to my todo list|on my to do list|on my todo list)$/i, "")
      .replace(/\b(for my to do list|for my todo list)$/i, "")
      .replace(/\bplease$/i, "")
      .replace(/^(do |go |remember to )/i, "")
      .trim();
  };

  const matchAfterAny = (patterns) => {
    for (const pattern of patterns) {
      const match = lower.match(pattern);
      if (match?.[1]) {
        return stripTaskNoise(match[1]);
      }
    }
    return "";
  };

  if (
    /^clear( my)? (to do|to-do|todo) list$/.test(lower) ||
    /^clear everything$/.test(lower) ||
    /^clear all tasks$/.test(lower)
  ) {
    return { type: "clear" };
  }

  const addValue = matchAfterAny([
    /^(?:add|put)\s+(.+)$/i,
    /^(?:add|put)\s+(.+?)\s+(?:to|on)\s+my\s+(?:to do|to-do|todo)\s+list$/i,
    /^remind me to\s+(.+)$/i,
    /^remember to\s+(.+)$/i
  ]);

  if (addValue) {
    return { type: "add", value: addValue };
  }

  const removeValue = matchAfterAny([
    /^(?:remove|delete|take off)\s+(.+)$/i,
    /^(?:remove|delete)\s+(.+?)\s+from\s+my\s+(?:to do|to-do|todo)\s+list$/i
  ]);

  if (removeValue) {
    return { type: "remove", value: removeValue };
  }

  const completeValue = matchAfterAny([
    /^(?:complete|finish|cross off)\s+(.+)$/i,
    /^mark\s+(.+?)\s+as\s+done$/i,
    /^mark\s+(.+?)\s+done$/i,
    /^i finished\s+(.+)$/i,
    /^i did\s+(.+)$/i
  ]);

  if (completeValue) {
    return { type: "complete", value: completeValue };
  }

  return { type: "none" };
}