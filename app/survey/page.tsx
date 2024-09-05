import { Metadata } from "next";

import SurveyCard from "@/components/surveyCard";

export const metadata: Metadata = {
  title: "Survey",
};

export default function SurveyPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SurveyCard />
    </div>
  );
}
