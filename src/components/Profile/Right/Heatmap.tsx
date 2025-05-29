import React, { useEffect, useState } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { auth, firestore } from "@/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

const Heatmap: React.FC = () => {
  const [user] = useAuthState(auth);
  const [submissionData, setSubmissionData] = useState<
    { date: string; count: number }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const userRef = doc(firestore, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const submissions: { date: string; pid: string }[] =
          userSnap.data().submissions || [];
        const dateMap: Record<string, number> = {};

        submissions.forEach((sub) => {
          dateMap[sub.date] = (dateMap[sub.date] || 0) + 1;
        });

        const heatmapData = Object.entries(dateMap).map(([date, count]) => ({
          date,
          count,
        }));

        setSubmissionData(heatmapData);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="w-full overflow-x-auto py-4">
      <CalendarHeatmap
        startDate={
          new Date(new Date().setFullYear(new Date().getFullYear() - 1))
        }
        endDate={new Date()}
        values={submissionData}
        classForValue={(value) => {
          if (!value || value.count === 0) return "fill-dark-fill-2";
          if (value.count >= 4) return "fill-color-github-4";
          if (value.count === 3) return "fill-color-github-3";
          if (value.count === 2) return "fill-color-github-2";
          return "fill-color-github-1";
        }}
        tooltipDataAttrs={(value): Record<string, string> => {
          if (!value || typeof value !== "object" || !("date" in value)) {
            return {
              "data-tooltip-id": "",
              "data-tooltip-content": "",
            };
          }
          const val = value as { date: string; count: number };
          return {
            "data-tooltip-id": "heatmap-tooltip",
            "data-tooltip-content": `${val.count} submission${
              val.count !== 1 ? "s" : ""
            } on ${val.date}`,
          };
        }}
        showWeekdayLabels={false}
      />
      <Tooltip id="heatmap-tooltip" />
    </div>
  );
};

export default Heatmap;
