const Application = require('../models/application.model');
const Job = require('../models/job.model');

//get applications, ofc based on the role
exports.getApplications = async (req, res) => {
  try {
    let applications;
    //admin:sees all applications on all jobs
    if (req.user.role === 'admin') {
      applications = await Application.find()
        .populate({ path: 'job', populate: { path: 'client' } })
        .populate('freelancer');
    //client:first finds their jobs, then finds all applications on those jobs using $in
    } else if (req.user.role === 'client') {
      const jobs = await Job.find({ client: req.user.refId });
      const jobIds = jobs.map(j => j._id);
      applications = await Application.find({ job: { $in: jobIds } })
        .populate({ path: 'job', populate: { path: 'client' } })
        .populate('freelancer');
    //freelancer: sees only their own applications, no need to populate freelancer since they ARE the freelancer
    } else {
      applications = await Application.find({ freelancer: req.user.refId })
        .populate({ path: 'job', populate: { path: 'client' } });
    }
    res.render('applications/index', { user: req.user, applications });
  } catch (err) {
    res.status(500).render('errors/500', { user: req.user });
  }
};

//get the new application form 
exports.newApplicationForm = async (req, res) => {
  try {
    const job = await Job.findById(req.query.jobId);
    if (!job) return res.status(404).render('errors/404', { user: req.user });
    res.render('applications/new', { user: req.user, job });
  } catch (err) {
    res.status(500).render('errors/500', { user: req.user });
  }
};

// create/submit the new application
exports.createApplication = async (req, res) => {
  try {
    req.body.freelancer = req.user.refId;//to auto link the application to the freelancer
    await Application.create(req.body);
    res.redirect('/applications');
  } catch (err) {
    const job = await Job.findById(req.body.job);
    res.render('applications/new', { user: req.user, job, error: err.message });
  }
};

// show precise application 
exports.showApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({ path: 'job', populate: { path: 'client' } })
      .populate('freelancer');
    if (!application) return res.status(404).render('errors/404', { user: req.user });
    res.render('applications/show', { user: req.user, application });
  } catch (err) {
    res.status(500).render('errors/500', { user: req.user });
  }
};

// get the edit form 
exports.editApplicationForm = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job');
    if (!application) return res.status(404).render('errors/404', { user: req.user });
    //same as we did in the job controller for client
    //so that a freelancer can only edit their own applications
    if (application.freelancer.toString() !== req.user.refId.toString()) {
      return res.status(403).render('errors/403', { user: req.user });
    }
    res.render('applications/edit', { user: req.user, application });
  } catch (err) {
    res.status(500).render('errors/500', { user: req.user });
  }
};

//sybmit updated form 
exports.updateApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).render('errors/404', { user: req.user });
    //same here 
    if (application.freelancer.toString() !== req.user.refId.toString()) {
      return res.status(403).render('errors/403', { user: req.user });
    }
    await Application.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/applications');
  } catch (err) {
    res.status(500).render('errors/500', { user: req.user });
  }
};

//delete application
exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).render('errors/404', { user: req.user });
    //Admin can delete any application. 
    // Freelancer can only delete their own. 
    // So the check says — if you are NOT admin AND this is not your application =>403.
    if (req.user.role !== 'admin' && application.freelancer.toString() !== req.user.refId.toString()) {
      return res.status(403).render('errors/403', { user: req.user });
    }
    await Application.findByIdAndDelete(req.params.id);
    res.redirect('/applications');
  } catch (err) {
    res.status(500).render('errors/500', { user: req.user });
  }
};

//ACCEPT an application
exports.acceptApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('job');
    if (!application) return res.status(404).render('errors/404', { user: req.user });
    // only the client who owns the job or admin can accept
    if (req.user.role === 'client' && application.job.client.toString() !== req.user.refId.toString()) {
      return res.status(403).render('errors/403', { user: req.user });
    }
    await Application.findByIdAndUpdate(req.params.id, { status: 'accepted' });
    await Application.updateMany({ job: application.job._id, status: 'pending' },{ status: 'rejected' }
);
    await Job.findByIdAndUpdate(application.job._id, { status: 'in progress' });
    res.redirect('/applications');
  } catch (err) {
    res.status(500).render('errors/500', { user: req.user });
  }
};

//REJECT an application
exports.rejectApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('job');
    if (!application) return res.status(404).render('errors/404', { user: req.user });
    // only the client who owns the job or admin can reject
    if (req.user.role === 'client' && application.job.client.toString() !== req.user.refId.toString()) {
      return res.status(403).render('errors/403', { user: req.user });
    }
    await Application.findByIdAndUpdate(req.params.id, { status: 'rejected' });
    res.redirect('/applications');
  } catch (err) {
    res.status(500).render('errors/500', { user: req.user });
  }
};

// Get applications by job ID
exports.getApplicationsByJob = async (req, res) => {
  try {
    const applications = await Application.find({ job: req.params.jobId })
      .populate('job')
      .populate('freelancer');
    res.render('applications/index', { applications, user: req.user });
  } catch (err) {
    res.status(500).render('errors/500', { user: req.user });
  }
};

// Get applications by freelancer ID
exports.getApplicationsByFreelancer = async (req, res) => {
  try {
    const applications = await Application.find({ freelancer: req.params.freelancerId })
      .populate('job')
      .populate('freelancer');
    res.render('applications/index', { applications, user: req.user });
  } catch (err) {
    res.status(500).render('errors/500', { user: req.user });
  }
};

