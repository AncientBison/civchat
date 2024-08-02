import { Spinner } from "@nextui-org/spinner";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import SurveyCard from "@/components/surveyCard";

export default function SurveyPage() {

  const id = cookies().get("id");
  if (id === undefined) {
    redirect("/survey");
  }

  return (
    <Spinner />
    // <div className="flex items-center justify-center min-h-screen">
    //   <SurveyCard
    //     statement="Communism is superior to Capitalism"
    //     description="This question aims to understand your perspective on the two dominant economic systems of the past century."
    //   />
    // </div>
  );
}