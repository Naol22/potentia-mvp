interface SurveyResponse {
  id: number;
  userId: number;
  response: string;
}

interface SurveyResponseTableProps {
  surveyResponses: SurveyResponse[];
}

export default function SurveyResponseTable({ surveyResponses }: SurveyResponseTableProps) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-200">
          <th className="p-2 text-left text-gray-700">ID</th>
          <th className="p-2 text-left text-gray-700">User ID</th>
          <th className="p-2 text-left text-gray-700">Response</th>
        </tr>
      </thead>
      <tbody>
        {surveyResponses.map((response) => (
          <tr key={response.id} className="border-b hover:bg-gray-50">
            <td className="p-2">{response.id}</td>
            <td className="p-2">{response.userId}</td>
            <td className="p-2">{response.response}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}