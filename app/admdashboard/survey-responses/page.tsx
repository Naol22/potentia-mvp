import SurveyResponseTable from "@/components/SurveyResponseTable";

export default async function SurveyResponsesPage() {
  const res = await fetch("/api/adm/survey-responses", {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <div className="text-red-500">Error fetching survey responses: {res.statusText}</div>
    );
  }

  const surveyResponses = await res.json();

  return (
    <div>
      <h1 className="text-2xl font-bold text-blue-900 mb-4">Survey Responses Management</h1>
      <SurveyResponseTable surveyResponses={surveyResponses} />
    </div>
  );
}