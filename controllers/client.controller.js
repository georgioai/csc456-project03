/* we will implement 7 functions here */

const Client = require('../models/client.model');
//we pull job and application so we make sure they get deleted later on with the deleted client 
const Job = require('../models/job.model');
const Application = require('../models/application.model');

exports.getClients = async (req, res) => {
  try {
    const clients = await Client.find();
    res.render('clients/index', { user: req.user, clients });//clients is the data to display
  } catch (err) {
    res.status(500).render('errors/500', { user: req.user });
  }
};

//function that returns the client form (for the admin, since admin should be able to do everything)
exports.newClientForm = (req, res) => {
  res.render('clients/new', { user: req.user });
};

//create the client (for the admin)
exports.createClient = async (req, res) => {
  try {
    await Client.create(req.body);
    res.redirect('/clients');
  } catch (err) {
    res.render('clients/new', { user: req.user, error: err.message });
  }
};

//get client by id
exports.showClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).render('errors/404', { user: req.user });
    if (req.user.role === 'client' && client._id.toString() !== req.user.refId.toString()) {
      return res.status(403).render('errors/403', { user: req.user });
    }
    const jobs = await Job.find({ client: client._id });
    res.render('clients/show', { user: req.user, client, jobs });
  } catch (err) {
    res.status(500).render('errors/500', { user: req.user });
  }
};

//return the edit client form 
exports.editClientForm = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).render('errors/404', { user: req.user });
    res.render('clients/edit', { user: req.user, client });
  } catch (err) {
    res.status(500).render('errors/500', { user: req.user });
  }
};

//update the client 
exports.updateClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!client) return res.status(404).render('errors/404', { user: req.user });
    res.redirect('/clients');
  } catch (err) {
    const client = await Client.findById(req.params.id);
    res.render('clients/edit', { user: req.user, client, error: err.message });
  }
};

//delete the client 
//the idea here is to delete all the jobs that belongs to the desired client
//before deleting the client
exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).render('errors/404', { user: req.user });

    const jobs = await Job.find({ client: client._id });
    const jobIds = jobs.map(j => j._id);

    await Application.deleteMany({ job: { $in: jobIds } });
    await Job.deleteMany({ client: client._id });
    await Client.findByIdAndDelete(req.params.id);

    res.redirect('/clients');
  } catch (err) {
    res.status(500).render('errors/500', { user: req.user });
  }
};