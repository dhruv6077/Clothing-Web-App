// need fns to fetch a survey by id and fns to create a survey response for a user

export type RequestResult<T> =
  | { success: true; res: T }
  | { success: false; error: Error };


// types.ts
export interface CreateSurveyRequest {
  userId: string;
  answers: Record<string, any>;  // or a more specific interface for your answers JSON
}

export interface Survey {
  id: number;
  answers: Record<string, any>;
  user: {
    id: number;
    // ...any other User fields your backend returns
  };
}



/**
 * Sends a POST to /api/surveys to create a new survey record.
 * @param payload { userId, answers } matching your backend CreateSurveyRequest
 * @returns the saved Survey object from the server
 * @throws on non-2xx responses
 */
export async function createSurveyResponse(
  payload: CreateSurveyRequest
): Promise<RequestResult<Survey>> {
  const res = await fetch('http://localhost:8080/api/surveys', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    return { success: false, error: new Error(`Error creating survey: ${text}`) }
  }

  const survey: Survey = await res.json()
  
  return { success: true, res: survey }
}
