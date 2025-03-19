// pages/index.js
import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";

export default function Home() {
  const { data: session } = useSession();
  const [triviaData, setTriviaData] = useState([]);
  const [answers, setAnswers] = useState({}); // store selected answer per question
  const [score, setScore] = useState(null);

  // Fetch quiz questions from the trivia API route
  const fetchTrivia = async () => {
    const res = await fetch("/api/trivia");
    if (res.ok) {
      const data = await res.json();
      setTriviaData(data.results);
      // reset previous answers and score when starting a new quiz
      setAnswers({});
      setScore(null);
    } else {
      console.error("Failed to fetch trivia data");
    }
  };

  // Save user's answer for a question
  const handleAnswerChange = (questionIndex, selectedOption) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: selectedOption,
    }));
  };

  // Evaluate quiz score and submit it to the API
  const submitQuiz = async () => {
    let totalScore = 0;
    triviaData.forEach((question, index) => {
      if (answers[index] === question.correct_answer) {
        totalScore += 1;
      }
    });
    setScore(totalScore);

    const res = await fetch("/api/trivia", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ score: totalScore }),
    });
    const result = await res.json();
    if (res.ok) {
      alert("Score saved successfully! Your score: " + totalScore);
    } else {
      alert(`Error: ${result.message}`);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem", padding: "1rem" }}>
      {!session ? (
        <>
          <h1>You are not signed in</h1>
          <button onClick={() => signIn("google")}>Sign in with Google</button>
        </>
      ) : (
        <>
          <h1>Welcome, {session.user.name}</h1>
          <Image
            src={session.user.image}
            alt={session.user.name}
            width={96}
            height={96}
            style={{ borderRadius: "50%" }}
          />
          <button onClick={() => signOut()}>Sign Out</button>
          <hr />

          {/* Button to fetch/start the quiz */}
          <div>
            <button onClick={fetchTrivia}>Start Quiz</button>
          </div>

          {triviaData.length > 0 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitQuiz();
              }}
              style={{ textAlign: "left", maxWidth: "600px", margin: "2rem auto" }}
            >
              {triviaData.map((question, index) => {
                // Combine correct and incorrect answers and randomize them if desired.
                // Here, we simply sort them alphabetically.
                const options = [
                  ...question.incorrect_answers,
                  question.correct_answer,
                ].sort();
                return (
                  <div key={index} style={{ marginBottom: "1.5rem" }}>
                    <p>
                      <strong>
                        Q{index + 1}: {question.question}
                      </strong>
                    </p>
                    {options.map((option, i) => (
                      <label key={i} style={{ display: "block", margin: "0.5rem 0" }}>
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={option}
                          onChange={() => handleAnswerChange(index, option)}
                          checked={answers[index] === option}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                );
              })}
              <button type="submit">Submit Quiz</button>
            </form>
          )}

          {score !== null && (
            <p>
              Your total score is: {score} out of {triviaData.length}
            </p>
          )}
        </>
      )}
    </div>
  );
}
