const notFound = (req, res) =>
  res.status(404).json({ msg: "route dosent exist" });

module.exports = notFound;
