// const Listing = require("../models/listing");
// const Review = require("../models/review");

// module.exports.createReview = async (req, res) => {
//   let listing = await Listing.findById(req.params.id);
//   let newReview = new Review(req.body.review);
//   newReview.author = req.user._id;
//   listing.reviews.push(newReview);

//   await newReview.save();
//   await listing.save();
//   req.flash("success", "New Review Created!");
//   res.redirect(`/listings/${listing._id}`);
// };

// module.exports.destroyReview = async (req, res) => {
//   let { id, reviewId } = req.params;

//   await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
//   await Review.findByIdAndDelete(reviewId);
//   req.flash("success", "Review Deleted!");
//   res.redirect(`/listings/${id}`);
// };

const Listing = require("../models/listing");
const Review = require("../models/review");
const Sentiment = require("sentiment");
const sentimentAnalyzer = new Sentiment();

module.exports.createReview = async (req, res) => {
  let listing = await Listing.findById(req.params.id);

  const reviewText = req.body.review.comment;

  const options = {
    extras: {
      amazing: 5,
      absolutely: 2,
      terrible: -5,
      horrible: -5,
      worst: -4,
    },
  };

  const result = sentimentAnalyzer.analyze(reviewText, options);

  let sentimentLabel = "Neutral";
  if (result.score > 0) sentimentLabel = "Positive";
  else if (result.score < 0) sentimentLabel = "Negative";

  let newReview = new Review({
    ...req.body.review,
    author: req.user._id,
    sentiment: sentimentLabel,
  });

  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  req.flash("success", "New Review Created!");
  res.redirect(`/listings/${listing._id}`);
};
