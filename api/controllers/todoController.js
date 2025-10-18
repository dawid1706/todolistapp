import TodoModel from "../models/todoModel";

export const getTodos = async (req, res) => {
  try {
    const users = await TodoModel.find({ assignetUser: req.user._id });

    res.status(200).json({
      status: "success",
      content: users,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

export const createTodo = async (req, res) => {
  try {
    const newTodo = await TodoModel.create({
      title: req.body.title,
      assignetUser: req.user._id,
    });

    res.status(201).json({
      status: "success",
      content: newTodo,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

export const deleteTodo = async (req, res) => {
  try {
    await TodoModel.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      content: null,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

export const toggleStatus = async (req, res) => {
  try {
    const todo = await TodoModel.findById(req.params.id);
    todo.completed = !todo.completed;
    await todo.save();

    res.status(200).json({
      status: "success",
      content: todo,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

export const updateTodo = async (req, res) => {
  try {
    const todo = await TodoModel.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      state: req.body.state,
    });

    res.status(200).json({
      status: "success",
      content: todo,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
