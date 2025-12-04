const Todo = require('../models/Todo');

exports.getAllTodos = async (req, res) => {
  try {
    const todos = await Todo.getAll();
    res.json(todos);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getTodoById = async (req, res) => {
  try {
    const todo = await Todo.getById(req.params.id);
    if (!todo) return res.status(404).send('Todo not found');
    res.json(todo);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.createTodo = async (req, res) => {
  try {
    const { title, description } = req.body;
    const todo = await Todo.create({ title, description });
    res.json(todo);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.updateTodo = async (req, res) => {
  try {
    const updateData = req.body;
    await Todo.update(req.params.id, updateData);
    const updatedTodo = await Todo.getById(req.params.id);
    res.json(updatedTodo);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.deleteTodo = async (req, res) => {
  try {
    await Todo.delete(req.params.id);
    res.send('Todo deleted');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
