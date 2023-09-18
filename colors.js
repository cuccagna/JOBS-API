/* Se vuoi usare CommonJs fai un downgrade usando chalk 4.1.2
 */
import chalk from "chalk";
import util from "util";

const error = (message, style) => {
  log(message, "red", style);
};

const warning = (message, style) => {
  log(message, "yellowBright", style);
};

const success = (message, style) => {
  log(message, "green", style);
};

const info = (message, style) => {
  log(message, "blue", style);
};

const log = (message, color, style) => {
  const chalkSetting = chalk?.[color]?.[style] || chalk?.[color] || chalk.black;
  //Questa istruzione serve perchè chalk non funziona con gli oggetti
  message =
    typeof message == "object"
      ? util.inspect(message, { colors: true, depth: null })
      : message;
  console.log(chalkSetting(message));
};

export { warning, success, info, error, log };

/* 
Possibili chiamate

error("Ciao");
error("Ciao", "bold");
error("Ciao", "underline");
error("Ciao", "strikethrough");

log("Ciao", "red");
log("Ciao", "red","bold");
success("Ciao");
info("Ciao");
warning("Ciao"); */
