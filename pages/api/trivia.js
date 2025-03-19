// pages/api/trivia.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  // Retrieve session on the server side
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      const response = await fetch("https://opentdb.com/api.php?amount=10&type=multiple");
      const data = await response.json();
      return res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching trivia data:", error);
      return res.status(500).json({ message: "Error fetching trivia quiz data" });
    }
  } else if (req.method === "POST") {
    const { score } = req.body;
    if (typeof score !== "number") {
      return res.status(400).json({ message: "Score must be a number" });
    }
    try {
      const client = await clientPromise;
      const db = client.db("demo");
      const scores = db.collection("quizscore");

      const result = await scores.insertOne({
        user: session.user.email,
        score,
        createdAt: new Date(),
      });
      return res.status(200).json({ message: "Score saved successfully", result });
    } catch (error) {
      console.error("Error saving score:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}
