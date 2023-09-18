import { jobModel } from "../models/Job.js";
import { StatusCodes } from "http-status-codes";
import BadRequestError from "../errors/bad-request.js";
import UnauthenticatedError from "../errors/unauthenticated.js";
import { NotFoundError } from "../errors/not-found.js";

//CRUD OPERATIONS
//ottenere tutti i job relativi a uno specifico utente dentro il token.
const getAllJobs = async (req, res) => {
  //torna un array dei lavori oppure un array vuoto. Se è vuoto non devo lanciare
  //un'eccezione semplicemnte torno l'array vuoto
  const jobs = await jobModel.find({ createdBy: req.user.userId });

  /*  Questa probabilmente non è da considerarsi un errore. Se tu cerchi un job 
  specifico ma questo non c'è devi sollevare un errore.
  Se invece cerchi tutti i job ma neanche uno è presente non devi lanciare 
  nessuna eccezione.
  E' così, non è un errore*/
  /* if (jobs.length === 0) {
    throw new NotFoundError("There aren't jobs");
  } */

  res
    .status(StatusCodes.OK)
    .json({ jobs, count: jobs.length, user: req.user.userId });
  //res.send("get all jobs");
};

const getJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req;

  const job = await jobModel.findOne({ createdBy: userId, _id: jobId });
  if (!job) {
    throw new NotFoundError("Job Not Found with id" + jobId);
  }
  res.status(StatusCodes.OK).json({ job });
};

const createJob = async (req, res) => {
  //res.send("createJob");
  //req.user viene preso dal token e passato dal middleware
  /* user è oggetto aggiunto nel middleware authentication.js 
  e creato dal payload del token */
  //res.send(req.user);
  const jobCreated = await jobModel.create(
    [{ ...req.body, createdBy: req.user.userId }],
    {
      sanitizeFilter: true,
    }
  );
  res.status(StatusCodes.CREATED).send(jobCreated[0]);
};

//Un Job ha diversi campi, non devi per forza passarli tutti nel body della request,
//anche uno solo va bene, ma non può essere vuoto
//Inoltre se in req.body passi dei campi che non esistono nel Job viene pure
//lanciata un'eccezione (perchè c'è strict:true nello schema)
//Nota che se passi un id che non esiste nel parametro ma valido
//viene lanciata un'eccezione dal pezzo di codice
//if (!updatedJob)
//invece se non è proprio valido il parametro (ha una cifra in meno ad esempio)
//viene automaticamente lanciata un'eccezione da Mongodb, errore di casting
//Occhio che se dal form del front-end passi un numero come nome della compagnia
//non verrà sollevata un'eccezione
const updateJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req;

  if (Object.keys(req.body).length === 0) {
    throw new BadRequestError("No parameter in the request");
  }

  /* Se req.body contiene dei campi che non sono definiti nello schema siccome 
  c'è strict:throw verrà lanciata un'eccezione */
  const updatedJob = await jobModel.findOneAndUpdate(
    { createdBy: userId, _id: jobId },
    req.body,
    {
      sanitizeFilter: true,
      new: true,
      runValidators: true /* ,
      rawResult: true, */,
    }
  );

  //findOneAndUpdate ritorna null se non trova l'elemento indicato nella query
  // a meno che non usi rawResult
  if (!updatedJob) {
    throw new NotFoundError("Job and/or user not found");
  }

  //console.log(updatedJob);
  res.status(StatusCodes.OK).json(updatedJob);
  //res.send("update jobs");
};

const deleteJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req;

  const delResp = await jobModel.findOneAndDelete({
    _id: jobId,
    createdBy: userId,
  });

  if (!delResp) {
    throw new NotFoundError(`Job with id ${jobId} not found`);
  }

  //In questo caso non torno niente
  res.status(StatusCodes.OK).send();
  //res.send("get all jobs");
};

export { getAllJobs, getJob, createJob, updateJob, deleteJob };
