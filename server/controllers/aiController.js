import { HfInference } from "@huggingface/inference";
import Post from "../models/post.js";
import dotenv from "dotenv";
dotenv.config();

// Initialize Hugging Face (works without API key for free tier)
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Summarize a post
export const summarizePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!post.content || post.content.trim().length === 0) {
      return res.status(400).json({ message: "Post has no content to summarize" });
    }

    console.log("Summarizing post with Hugging Face...");

    // Truncate content if too long (Hugging Face has limits)
    const maxLength = 500;
    const content = post.content.length > maxLength
      ? post.content.substring(0, maxLength) + "..."
      : post.content;

    // Try multiple models with fallback
    const models = [
      "sshleifer/distilbart-cnn-12-6",
      "facebook/bart-large-cnn",
      "philschmid/bart-large-cnn-samsum"
    ];

    let summary = null;
    let lastError = null;

    for (const model of models) {
      try {
        console.log(`Trying model: ${model}`);

        const result = await hf.summarization({
          model: model,
          inputs: content,
          parameters: {
            max_length: 100,
            min_length: 30,
          }
        });

        summary = result.summary_text || result[0]?.summary_text;

        if (summary) {
          console.log("Summary generated successfully with model:", model);
          break;
        }
      } catch (error) {
        console.log(`Model ${model} failed:`, error.message);
        lastError = error;
        continue;
      }
    }

    if (!summary) {
      // Fallback to simple extraction if all models fail
      console.log("All AI models failed, using simple summary...");
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
      summary = sentences.slice(0, 3).join('. ') + '.';
    }

    res.json({
      postId: id,
      summary,
    });
  } catch (error) {
    console.error("AI Summarization error:", error);

    // Provide specific error messages
    if (error.message?.includes("rate limit")) {
      return res.status(429).json({
        message: "Too many requests. Please wait a moment and try again."
      });
    }

    res.status(500).json({
      message: error.message || "Error summarizing post with Hugging Face AI",
      error: error.code || "unknown_error"
    });
  }
};
