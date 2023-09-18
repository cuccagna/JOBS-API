import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { info, success, error, warning } from "../colors.js";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      minLength: 3,
      maxLength: 50,
    },
    email: {
      type: String,
      required: [true, "Please provide email"],
      match: [
        /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/,
        "Please provide a valid email",
      ],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minLength: 8,
      maxLength: 20,
    },
  },
  {
    methods: {
      createJwtToken: function () {
        return jwt.sign(
          { userId: this._id, name: this.name },
          process.env.JWT_SECRET, //No need to import dotenv, basta importarlo in app.js
          {
            expiresIn: process.env.JWT_LIFETIME,
          }
        );
      },
      comparePassword: async function (insertedPassword) {
        return await bcrypt.compare(insertedPassword, this.password);
      },
    },
  },
  { strict: "throw" }
);

//importante usare function e non un arrow function
//altrimenti this non corrisponde al document
//this è il document che stai creando quello dentro create()
//e pre() viene chiamato prima di inserirlo nel db
userSchema.pre("save", async function (/* next */) {
  //info(this);
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;

  // Non c'è bisogno di next() perchè è una funzione asincrona
  // next();
});

const userModel = mongoose.model("users", userSchema);

export { userModel };
