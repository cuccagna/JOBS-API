/* const notFound = (req, res) => res.status(404).send('Route does not exist')

module.exports = notFound */

import path from "path";

import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const notFound = (req, res, next) => {
  return res
    .status(404)
    .sendFile(path.join(__dirname, "../errors", "notFound.html"));
};
