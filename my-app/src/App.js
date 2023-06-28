import styles from './App.module.css';
import { useEffect, useState } from 'react';
import { ref, onValue, push, set, remove } from 'firebase/database';
import { db } from './firebase';

export const App = () => {
	const [todos, setTodos] = useState([]);
	const [searchInput, setSearchInput] = useState('');
	const [sorted, setSorted] = useState(false);

	let currentTodo = Object.entries(todos);

	useEffect(() => {
		const productsDBRef = ref(db, 'todos');

		return onValue(productsDBRef, (snapshot) => {
			const loadedProducts = snapshot.val() || [];

			setTodos(loadedProducts);
		});
	}, []);

	const handleAddTodos = () => {
		const inputTodo = prompt('What do you have on mind?');
		if (!inputTodo) return;

		const productsDBRef = ref(db, 'todos');

		push(productsDBRef, {
			title: inputTodo,
			id: currentTodo.length > 0 ? currentTodo.at(-1).at(-1).id + 1 : 1,
			checked: false,
		});

		setSearchInput('');
	};

	const handleEditTodos = (todo) => {
		const inputTodo = prompt('Insert edited text');
		if (!inputTodo) return;

		const productTodoDBRef = ref(db, `todos/${todo[0]}`);

		set(productTodoDBRef, {
			id: todo[1].id,
			title: inputTodo,
			checked: false,
		});
	};

	const handleDeleteTodos = (todo) => {
		const productTodoDBRef = ref(db, `todos/${todo[0]}`);

		remove(productTodoDBRef);
	};

	const handleSort = () => {
		setSorted((sorted) => !sorted);
	};

	const handleCheck = (todo) => {
		const productTodoDBRef = ref(db, `todos/${todo[0]}`);

		set(productTodoDBRef, {
			id: todo[1].id,
			title: todo[1].title,
			checked: !todo[1].checked,
		});
	};

	return (
		<div className={styles.app}>
			<div className={styles.header}>
				<h1>List of things to complete</h1>

				<Button onClick={handleAddTodos}>Add Todo</Button>
				<SearchTodos
					className={styles.searchBar}
					searchInput={searchInput}
					setSearchInput={setSearchInput}
					todos={todos}
				/>
				<Button onClick={handleSort}>Sort Todos</Button>
				<TodoListBody
					currentTodo={currentTodo}
					searchInput={searchInput}
					handleEditTodos={handleEditTodos}
					handleDeleteTodos={handleDeleteTodos}
					sorted={sorted}
					setSorted={setSorted}
					onHandleCheck={handleCheck}
				/>
			</div>
		</div>
	);
};

const ControlButton = ({ onControl, todo, children }) => {
	return (
		<button className={styles.editButton} onClick={() => onControl(todo)}>
			{children}
		</button>
	);
};

const SearchTodos = ({ className, searchInput, setSearchInput }) => {
	return (
		<input
			type="text"
			className={className}
			placeholder="Search Todos"
			value={searchInput}
			onChange={(e) => setSearchInput(e.target.value)}
		/>
	);
};

const Button = ({ children, onClick }) => {
	return (
		<button className={styles.button} onClick={onClick}>
			{children}
		</button>
	);
};

const TodoListBody = ({
	currentTodo,
	searchInput,
	handleEditTodos,
	handleDeleteTodos,
	sorted,
	onHandleCheck,
}) => {
	if (sorted) {
		const sortedTodos = currentTodo
			.slice()
			.sort((a, b) =>
				a[1].title.toLowerCase() < b[1].title.toLowerCase() ? -1 : 1,
			);
		currentTodo = sortedTodos;
	}
	return (
		<div className={styles.content}>
			{currentTodo.length > 0 &&
				currentTodo
					.filter((todo) =>
						searchInput.toLowerCase() === ''
							? todo[1]
							: todo[1].title.toLowerCase().includes(searchInput),
					)
					.map((todo) => {
						return (
							<label key={todo[0]} className={styles.label}>
								<div>
									<input
										name="search"
										type="checkbox"
										className={styles.checkbox}
										checked={todo[1].checked}
										onChange={() => onHandleCheck(todo)}
									/>
									<span
										className={todo[1].checked ? styles.checked : ''}
									>
										{todo[1].title}
									</span>
								</div>
								<div className={styles.buttonGroup}>
									<ControlButton
										onControl={handleEditTodos}
										todo={todo}
									>
										Edit
									</ControlButton>
									<ControlButton
										styles={styles}
										todo={todo}
										onControl={handleDeleteTodos}
									>
										Delete
									</ControlButton>
								</div>
							</label>
						);
					})}
		</div>
	);
};
