import { StatusCodes } from "http-status-codes";
import CustomAPIError from "../errors/custom-api.js";
const errorHandlerMiddleware = (err, req, res, next) => {
  const customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message: err.message || "Something went wrong, try again later",
  };
  /* OLD APPROACH
   if (err instanceof CustomAPIError) {
    return res.status(err.statusCode).json({ msg: err.message });
  } */
  //errore non lanciato da me ma automaticamente dal codice lo
  //facevo confluire nell'errore 500
  //Adesso torno 409
  /* console.error(err); */
  if (err.code && err.code === 11000) {
    customError.message = `Duplicate value entered for ${Object.keys(
      err.keyValue
    )} field, please choose another value`;
    customError.statusCode = StatusCodes.CONFLICT; //409
  }

  //Stampati err quando c'è un errore di validazione per capire com'è fatto
  //Potresti ulteriormente personalizzare il messaggio se un campo è vuoto

  if (err.name === "ValidationError") {
    console.log(err.errors);
    const objErrMessage = {};
    for (let propr in err.errors) {
      objErrMessage[propr] = err.errors[propr].message;
    }
    customError.message = objErrMessage;
    customError.statusCode = StatusCodes.UNPROCESSABLE_ENTITY; //422
    //Per facilitare la gestione lato client sarebbe meglio tornare un oggetto
    //nella proprietà message
    //{email:"errore",password:"errore"}
    //Qui invece si torna una stringa
    /* customError.message = Object.values(err.errors)
      .map((item) => item.message)
      .join(","); */
  }

  //Questo errore viene lanciato ad esempio quando l'id nella url
  //non è corretto, ad esempio ha un carattere in meno o in più di
  //quanti dovrebbe averne
  if (err.name === "CastError") {
    customError.message = `No item found with id ${err.value}`;
    customError.statusCode = StatusCodes.NOT_FOUND; //404
  }

  /* OLD APPROACH
  return res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json({ message: err.message }); */

  return res
    .status(customError.statusCode)
    .json({ message: customError.message });
};

export default errorHandlerMiddleware;
