
//function that returns the home page

exports.getHome = async(req , res) =>{
    res.render('home/home', { user: req.user });
}

//function that returns the dashboard page PROTECTED PAGE
exports.getDashboard = (req, res) => {
  res.render('dashboard/index', { user: req.user });
}