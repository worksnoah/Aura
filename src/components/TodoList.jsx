export default function TodoList({ todos, onToggle, onRemove }) {
  return (
    <div className="todo-card">
      <p className="todo-label">To-Do</p>

      {todos.length === 0 ? (
        <p className="todo-empty">Nothing on the list.</p>
      ) : (
        <div className="todo-items">
          {todos.map((todo) => (
            <div key={todo.id} className={`todo-item ${todo.completed ? "completed" : ""}`}>
              <button
                className="todo-check"
                onClick={() => onToggle(todo.id)}
                aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
              >
                <span className="todo-check-inner" />
              </button>

              <p className="todo-text">{todo.text}</p>

              <button
                className="todo-remove"
                onClick={() => onRemove(todo.id)}
                aria-label="Remove task"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}