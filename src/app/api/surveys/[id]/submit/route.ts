import { NextRequest, NextResponse } from 'next/server';
import { surveyModels, resultModels } from '@/lib/models';
import { submitSurveySchema } from '@/lib/schema';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: surveyId } = await params;
    const body = await request.json();
    const validated = submitSurveySchema.parse(body);

    const survey = surveyModels.getById(surveyId);
    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
    }

    // Calculate total score and collect user answers
    let totalScore = 0;
    const userAnswers: { questionId: string; answerId: string | null; answerText: string; points: number }[] = [];

    for (const question of survey.questions) {
      if (!question.id) continue;
      
      const selectedAnswerId = validated.answers[question.id] ?? null;
      
      if (selectedAnswerId) {
        const answer = question.answers.find(a => a.id === selectedAnswerId);
        if (answer) {
          totalScore += answer.points;
          userAnswers.push({
            questionId: question.id,
            answerId: answer.id || null,
            answerText: answer.text,
            points: answer.points,
          });
        }
      } else if (question.isRequired) {
        return NextResponse.json({ error: `Required question "${question.text}" was not answered` }, { status: 400 });
      } else {
        userAnswers.push({
          questionId: question.id,
          answerId: null,
          answerText: '',
          points: 0,
        });
      }
    }

    // Find matching result range
    const matchingRange = survey.resultRanges.find(
      r => totalScore >= r.minScore && totalScore <= r.maxScore
    );

    // Create result record
    const resultId = resultModels.create(
      surveyId,
      totalScore,
      matchingRange?.id || null,
      validated.customFieldAnswer || null,
      userAnswers
    );

    return NextResponse.json({
      resultId,
      totalScore,
      resultText: matchingRange?.resultText || 'Нет подходящей категории',
      customFieldLabel: matchingRange?.customFieldLabel,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error }, { status: 400 });
    }
    console.error('Error submitting survey:', error);
    return NextResponse.json({ error: 'Failed to submit survey' }, { status: 500 });
  }
}
