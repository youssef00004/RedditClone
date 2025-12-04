import OpenAI from "openai";
import Post from "../models/post.js";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Summarize a post
export const summarizePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const prompt = `Summarize this Reddit post in 3 concise sentences:\n\n"${post.content}"`;

    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const summary = completion.choices[0].message.content.trim();

    res.json({
      postId: id,
      summary,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error summarizing post", error });
  }
};
