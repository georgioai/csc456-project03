/* admin: read write all jobs
client : read write his own posted jobs only 
freelancer: read only */

const Job = require('../models/job.model');
const Application = require('../models/application.model');

//get all jobs 
exports.getJobs = async (req, res) => {
  try {
    let jobs;
    //if youa re the admin, access to all jobs 
    if (req.user.role === 'admin') {
      jobs = await Job.find().populate('client');
      //if you are the client, access to your own jobs
    } else if (req.user.role === 'client') {
      jobs = await Job.find({ client: req.user.refId }).populate('client');
    } else {
      // freelancer: sees all open jobs to browse (read only)
      jobs = await Job.find({ status: 'open' }).populate('client');
    }
    res.render('jobs/index', { user: req.user, jobs });
  } catch (err) {
    res.status(500).render('errors/500', { user: req.user });
  }
};

//get the new job form 
exports.newJobForm = (req, res) => {
  res.render('jobs/new', { user: req.user });
};

//create the new job 
exports.createJob = async (req, res) => {
  try {
    if (req.user.role === 'client') {
      req.body.client = req.user.refId;//When a client creates a job, we automatically link it to their Client document
    }
    if (!req.body.expectedPeriod) delete req.body.expectedPeriod;
    await Job.create(req.body);
    res.redirect('/jobs');
  } catch (err) {
    res.render('jobs/new', { user: req.user, error: err.message });
  }
};

//get a job by id 
exports.showJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('client');
    if (!job) return res.status(404).render('errors/404', { user: req.user });
    const applications = await Application.find({ job: job._id }).populate('freelancer');
    res.render('jobs/show', { user: req.user, job, applications });
  } catch (err) {
    res.status(500).render('errors/500', { user: req.user });
  }
};

//edit job form 
exports.editJobForm = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('client');
    if (!job) return res.status(404).render('errors/404', { user: req.user });
    /* IMPORTANT:
    A client should only edit their own jobs. 
    If they try to access /jobs/edit/:id for a job 
    that belongs to another client, they get a 403.*/
    if (req.user.role === 'client' && job.client._id.toString() !== req.user.refId.toString()) {
      return res.status(403).render('errors/403', { user: req.user });
    }
    res.render('jobs/edit', { user: req.user, job });
  } catch (err) {
    res.status(500).render('errors/500', { user: req.user });
  }
};

//update and submit the job
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).render('errors/404', { user: req.user });
    //same here
    if (req.user.role === 'client' && job.client.toString() !== req.user.refId.toString()) {
      return res.status(403).render('errors/403', { user: req.user });
    }
    if (!req.body.expectedPeriod) delete req.body.expectedPeriod;
    await Job.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/jobs');
  } catch (err) {
    res.status(500).render('errors/500', { user: req.user });
  }
};

//delete a job
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).render('errors/404', { user: req.user });
    if (req.user.role === 'client' && job.client.toString() !== req.user.refId.toString()) {
      return res.status(403).render('errors/403', { user: req.user });
    }
    await Application.deleteMany({ job: job._id });
    await Job.findByIdAndDelete(req.params.id);
    res.redirect('/jobs');
  } catch (err) {
    res.status(500).render('errors/500', { user: req.user });
  }
};

//close a job 
/*
what happens here:
1. Job status --> 'closed'
2. All pending applications on that job --> 'rejected' using updatemany
*/ 

exports.closeJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).render('errors/404', { user: req.user });
    //also same for the client protection
    if (req.user.role === 'client' && job.client.toString() !== req.user.refId.toString()) {
      return res.status(403).render('errors/403', { user: req.user });
    }
    await Job.findByIdAndUpdate(req.params.id, { status: 'closed' });
    await Application.updateMany({ job: job._id, status: 'pending' }, { status: 'rejected' });
    res.redirect('/jobs');
  } catch (err) {
    res.status(500).render('errors/500', { user: req.user });
  }
};
/*SO WE DONT MISS ANY ENDPOINT*/ 

// Get jobs by client ID
exports.getJobsByClient = async (req, res) => {
  try {
    const jobs = await Job.find({ client: req.params.clientId }).populate('client');
    res.render('relationships/client-jobs', { jobs, user: req.user });
  } catch (err) {
    res.status(500).render('errors/500', { user: req.user });
  }
};

// Filter jobs by status (?status=open)
exports.filterJobs = async (req, res) => {
  try {
    const query = { status: req.query.status };
    if (req.user.role === 'client') query.client = req.user.refId;
    else if (req.user.role === 'freelancer') query.status = 'open';
    const jobs = await Job.find(query).populate('client');
    res.render('jobs/index', { jobs, user: req.user });
  } catch (err) {
    res.status(500).render('errors/500', { user: req.user });
  }
};