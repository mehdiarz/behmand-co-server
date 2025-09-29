import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
    },
    { timestamps: true }
);

export default mongoose.model("Customer", customerSchema);
