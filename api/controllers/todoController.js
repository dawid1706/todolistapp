import TodoModel from "../models/todoModel.js";

export const getTodos = async (req, res) => {
  try {
    const users = await TodoModel.find({ assignedUser: req.user._id });

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
      name: req.body.title,
      assignedUser: req.user._id,
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
    const todo = await TodoModel.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({
        status: "fail",
        message: "Todo not found",
      });
    }

    if (todo.assignedUser.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "fail",
        message: "You are not authorized to update this todo",
      });
    }

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
    console.log(todo);
    if (!todo) {
      return res.status(404).json({
        status: "fail",
        message: "Todo not found",
      });
    }

    if (todo.assignedUser.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "fail",
        message: "You are not authorized to update this todo",
      });
    }

    if (todo.state === "active") {
      todo.state = "completed";
    } else {
      todo.state = "active";
    }

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

    if (!todo) {
      return res.status(404).json({
        status: "fail",
        message: "Todo not found",
      });
    }

    if (todo.assignetUser !== req.user._id) {
      return res.status(403).json({
        status: "fail",
        message: "You are not authorized to update this todo",
      });
    }

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
