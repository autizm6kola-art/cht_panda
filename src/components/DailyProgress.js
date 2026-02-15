import React, { useEffect, useState } from "react";
import { getTodayCount } from "../utils/dailyStats";

function DailyProgress() {
  const [todayCount, setTodayCount] = useState(0);

  useEffect(() => {
    const update = () => {
      setTodayCount(getTodayCount());
    };

    update();

    window.addEventListener("progressUpdated", update);

    return () => {
      window.removeEventListener("progressUpdated", update);
    };
  }, []);

  return (
    <p style={{ marginTop: "10px", fontWeight: "bold" }}>
      Сегодня: {todayCount}
    </p>
  );
}

export default DailyProgress;
