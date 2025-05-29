import React, { useEffect, useState } from "react";
import { firestore } from "@/firebase/firebase"; // your firebase config
import { doc, getDoc } from "firebase/firestore";

type Problem = {
  id: string;
  title: string;
  difficulty?: string;
  category: string;
};

type SolvedProblemsProps = {
  uid: string; // user ID passed as prop
};

const SolvedProblems: React.FC<SolvedProblemsProps> = ({ uid }) => {
  const [solvedProblems, setSolvedProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    const fetchSolvedProblems = async () => {
      setLoading(true);

      try {
        // 1. Get user doc
        const userDocRef = doc(firestore, "users", uid);
        const userSnap = await getDoc(userDocRef);

        if (!userSnap.exists()) {
          setSolvedProblems([]);
          setLoading(false);
          return;
        }

        const userData = userSnap.data();

        // Assuming solvedProblems is an array of problem IDs in user document
        const solvedProblemIds: string[] = userData?.solvedProblems || [];

        if (solvedProblemIds.length === 0) {
          setSolvedProblems([]);
          setLoading(false);
          return;
        }

        // 2. Fetch problem details for each solved problem
        const problemPromises = solvedProblemIds.map(async (pid) => {
          const problemDocRef = doc(firestore, "problems", pid);
          const problemSnap = await getDoc(problemDocRef);

          if (problemSnap.exists()) {
            const data = problemSnap.data() as Problem;
            const { id: _omit, ...rest } = data; // omit 'id' from data if exists

            return {
              id: problemSnap.id,
              ...rest,
            };
          }
          return null;
        });

        const problems = await Promise.all(problemPromises);

        setSolvedProblems(problems.filter((p): p is Problem => p !== null));
      } catch (error) {
        console.error("Failed to fetch solved problems:", error);
        setSolvedProblems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSolvedProblems();
  }, [uid]);

  if (loading) return <p>Loading solved problems...</p>;

  if (solvedProblems.length === 0) return <p>No solved problems found.</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Solved Problems</h2>
      <ul className="space-y-2">
        {solvedProblems.map((problem, index) => {
          const difficultyColor =
            problem.difficulty === "Easy"
              ? "text-dark-green-s"
              : problem.difficulty === "Medium"
              ? "text-dark-yellow"
              : "text-dark-pink";

          return (
            <li
              key={problem.id}
              className={`rounded-md transition-colors duration-200 ${
                index % 2 == 0 ? "bg-dark-layer-1" : ""
              } hover:bg-dark-fill-3`}
            >
              <a href={`/problems/${problem.id}`} className="block p-4 w-full">
                <div className="flex flex-col-reverse gap-2">
                  <strong className="text-white text-base">
                    {problem.title}
                  </strong>
                  <div className="flex gap-1">
                    {problem.difficulty && (
                      <span
                        className={`w-fit mt-1 bg-dark-fill-3 text-xs px-2 py-1 rounded-full ${difficultyColor}`}
                      >
                        {problem.difficulty}
                      </span>
                    )}
                    <span
                      className={`w-fit mt-1 bg-dark-fill-3 text-white text-xs px-2 py-1 rounded-full`}
                    >
                      {problem.category}
                    </span>
                  </div>
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SolvedProblems;
