import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false }, // وضعیت خوانده/نخوانده
  },
  { timestamps: true },
);

export default mongoose.model("Message", messageSchema);
