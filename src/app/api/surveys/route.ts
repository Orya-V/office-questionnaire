import { NextRequest, NextResponse } from 'next/server';
import { surveyModels } from '@/lib/models';
import { surveySchema } from '@/lib/schema';

export async function GET() {
  try {
    const surveys = surveyModels.getAll();
    return NextResponse.json(surveys);
  } catch (error) {
    console.error('Error fetching surveys:', error);
    return NextResponse.json({ error: 'Failed to fetch surveys' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = surveySchema.parse(body);
    
    const survey = surveyModels.create({
      title: validated.title,
      googleSheetsUrl: validated.googleSheetsUrl || '',
      showPoints: validated.showPoints,
      questions: validated.questions,
      resultRanges: validated.resultRanges,
    });
    
    return NextResponse.json(survey, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error }, { status: 400 });
    }
    console.error('Error creating survey:', error);
    return NextResponse.json({ error: 'Failed to create survey' }, { status: 500 });
  }
}
