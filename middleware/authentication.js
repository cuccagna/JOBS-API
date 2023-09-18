import { StatusCodes } from "http-status-codes";
import UnauthenticatedError from "../errors/unauthenticated.js";
import jwt from "jsonwebtoken";

/* const isAuthenticated = (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    //Lato front-end io impedisco il caso in cui l'utente già registrato
    //prova a registrarsi di nuovo (deve fare un logout prima) facendo
    //un redirect alla dashboard. CIoè se l'utente fa click su
    //registrati io faccio un redirect alla dashboard dal front-end
    // NO QUELLO COMMENTATO IGNORALO
    // NON SI GESTISCE LATO BACK-END
    // Se per caso l'utente o un attaccante ,  ad esempio con postman,
    //prova a registrarsi avendo già il token e il cookie
    // allora elimino il cookie
    //torno un errore 409 edevo tornare una pagina con sendFile o una view.
    //Qui torno Errore 409
    //SE AVESSI LA VERIFICA DELL'EMAIL NON DOVREI TORNARE IL TOKEN
    //IN FASE DI REGISTRAZIONE MA SOLO AL LOGIN

    try {
      jwt.verify(token, process.env.JWT_SECRET);
      //res.clearCookie("token");
      return res.status(StatusCodes.CONFLICT).json({
        msg: "User already authenticated con queste o altre credenziali",
      });
    } catch (error) {
      //Se sei qui token non valido, prova comunque a fare la registrazione
      next();
    }
  }

  next();
}; */

//Questa è diversa da quelle di sopra, questo è un middleware che
//serve per vedere se un utente è già autenticato (ha il token jwt)
//e in questo può accedere a una route protetta (chiamando next)
//altrimenti dovresti tornare un errore Unhautorized
//o tornare una pagina di errore con sendFile
const isAuthenticated = (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    //Se il token esiste devo comunque verificare che sia valido
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { userId: payload.userId, name: payload.name };
      next();
    } catch (error) {
      throw new UnauthenticatedError(
        "You have to login to access protected area"
      );
      //next(error);
    }
  } else {
    //token non esiste
    throw new UnauthenticatedError(
      "You have to login to access protected area"
    );
  }
};

export { isAuthenticated };
