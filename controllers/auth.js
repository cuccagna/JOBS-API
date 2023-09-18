import "express-async-errors";
import { userModel } from "../models/User.js";
import { StatusCodes } from "http-status-codes";
import BadRequestError from "../errors/bad-request.js";
import UnauthenticatedError from "../errors/unauthenticated.js";
//import bcrypt from "bcryptjs";
import { info, success, error, warning } from "../colors.js";
//import jwt from "jsonwebtoken";

const register = async (req, res) => {
  //res.send("Register user");
  //create torna un array con dentro l'oggetto aggiunto
  //Servono le quadre attorno req.body per non  creare ambiguità
  //col secondo parametro che non è un altro oggetto da aggiungere
  //ma le opzioni
  /*  Adesso questo lo si fa nel document middleware in User.js 
  const { name, email, password } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt); 
  const tempUser = { name, email, password: hashedPassword };
  const userReturned = await userModel.create([tempUser], {
    sanitizeFilter: true,
  });
  */
  //NUOVO la password viene hashed nel document middleware in User.js e il
  //document viene modificato lì

  //Ritorna un array con il document creato
  //Se non usassi la sintassi cone le quadre (che qui serve)
  //tornerebbe solo l'oggetto
  //validazione nello schema e hash della password nel document middleware
  //sempre nello schema in User.js
  const userReturned = await userModel.create([req.body], {
    sanitizeFilter: true,
  });

  //Se sono qui i dati sono validi ed inseriti correttamente altrimenti
  //qui non ci arrivo perchè viene lanciata un'eccezione.
  //Ricorda che il database automaticamente aggiunge un id
  //Dentro il token metto oltre all'id anche il nome dell'utente
  //così nella dashboard posso visualizzare
  //Hello nomeutente
  /* VECCHIA MANIERA
  const token = jwt.sign(
    { userId: userReturned[0]._id, name: userReturned[0].name },
    "jwtSecret",
    {
      expiresIn: "30d",
    }
  ); */
  /*USO UN instance method DEFINITO NELLO SCHEMA CIOE' DENTRO User.js*/
  const token = userReturned[0].createJwtToken();
  res.cookie("token", token, {
    maxAge: 31 * 24 * 60 * 60 * 1000, //durata del cookie in ms
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    //path: "/api/v1/login",
  });
  res.status(StatusCodes.CREATED).json({ ...userReturned });
};

/* Qui non devi controllare se il token già esiste, in questo caso 
fai comunque il login e se crei un nuovo token quello 
precedente viene sovrascritto, ma se il login è errato 
devi provvedere anche ad eliminare un eventuale precedente 
token ecco perchè ho res.clearCookie() */
const login = async (req, res) => {
  //res.send("Login user");
  const { email, password } = req.body;
  //uno o entrambe le credenziali non inserite
  if (!email || !password) {
    //Se il token non esiste chiamare clearCookie non crea problemi
    //res.clearCookie("token"); //spiegazione sul perchè serve nel commento sopra
    //Anche se 422 sarebbe forse più idoneo
    throw new BadRequestError("Please provide email and password");
  }

  //torna null se non trova corrispondenza
  /* Qua codice che fa differenza tra maiuscole e minuscole
    let userFound = userModel.findOne({ email: email }, null, {
    sanitizeFilter: true,
  }); */
  // Ancora meglio per fare una ricerca case-insensitive così:
  //Ancora meglio era quando inserisci in registra trasformare
  //l'email in minuscolo e stessa cosa qui
  let userFound = await userModel.findOne({
    email: { $regex: new RegExp(`^${email.toString()}$`, "i") },
    // email: email,
  });

  //email non trovata errore
  if (!userFound) {
    //res.clearCookie("token");
    throw new UnauthenticatedError("The email provided isn't registred");
  }

  //Se sei qui l'email inserita è presente nel db
  //compare password. comparePassword() è definita in User.js nello schema
  const isPasswordCorrect = await userFound.comparePassword(password);

  if (!isPasswordCorrect) {
    //res.clearCookie("token");
    throw new UnauthenticatedError("Invalid credentials");
  }

  //crea il token
  //console.log(userFound);
  const token = userFound.createJwtToken();
  //crea il cookie con il token
  res.cookie("token", token, {
    maxAge: 31 * 24 * 60 * 60 * 1000, //durata del cookie in ms
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    //path: "/api/v1/login",
  });
  res.status(StatusCodes.OK).json({ user: { name: userFound.name } });
};

export { login, register };
