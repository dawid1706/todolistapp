import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "nameRequired"],
  },
  state: {
    type: String,
    default: "active",
    required: [true, "stateRequired"],
  },
  assignedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "assignetUserRequired"],
  },
});

const TodoModel = mongoose.model("Todo", todoSchema);

export default TodoModel;
