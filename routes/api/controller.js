const fileS3Upload = async (req, res) => {
  console.log(req);
  res.status(200).send("ok");
};

module.exports = {
  fileS3Upload,
};
