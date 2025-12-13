import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String }, // Optional for image/link posts
    type: { type: String, enum: ["text", "image", "link"], default: "text" },
    image: { type: String }, // Cloudinary URL for image posts
    link: { type: String }, // URL for link posts
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdAt: { type: Date, default: Date.now },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field to get comments for this post
postSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "post",
});

export default mongoose.models.Post || mongoose.model("Post", postSchema);
