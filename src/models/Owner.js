import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const ownerSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, default: "Owner" },
});

// Hash password before saving
ownerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare entered password with stored hash
ownerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Owner = mongoose.models.Owner || mongoose.model("Owner", ownerSchema);
export default Owner;
