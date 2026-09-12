/* Self-Guided Program Mapper */
export function mapSelfGuidedToResponse(selfGuidedDetails) {
  return {
    currentWeek: selfGuidedDetails.currentWeek,
    totalWeek: selfGuidedDetails.totalWeek,
    reflections: selfGuidedDetails.reflections.map((reflection) => ({
      week: reflection.week,
      message: reflection.message,
      gptResponse: reflection.gptResponse,
    })),
  };
}

/* Reflection Message Mapper */
export function mapReflectionMsgToRes(reflection) {
  return {
    week: reflection.week,
    message: reflection.message,
    gptResponse: reflection.gptResponse,
  };
}
