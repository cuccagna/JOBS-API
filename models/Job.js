import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, "Please provide company name"],
      maxLength: 50,
    },
    position: {
      type: String,
      required: [true, "Please provide position"],
      maxLength: 100,
    },
    status: {
      type: String,
      enum: ["interview", "declined", "pending"],
      default: "pending",
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user"],
    },
  },
  { strict: "throw", timestamps: true }
);

jobSchema.pre("save", function (next) {
  this.company = this.company.toLowerCase();
  this.position = this.position.toLowerCase();
  this.status = this.status.toLowerCase();
  next();
});

//Questo serve per impedire di inserire un elemento praticamente identico
jobSchema.index(
  { company: 1, position: 1, status: 1, createdBy: 1 },
  { unique: true }
);

const jobModel = mongoose.model("jobs", jobSchema);

export { jobModel };
