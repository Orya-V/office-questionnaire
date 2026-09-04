import { NextRequest, NextResponse } from 'next/server';
import { resultModels } from '@/lib/models';
import * as XLSX from 'xlsx';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: surveyId } = await params;
    const results = resultModels.getBySurveyId(surveyId);

    // Build Excel data - simplified structure
    const excelData: any[][] = [];
    
    // Header row - fixed structure
    const headerRow = ['Дата прохождения', 'Общий балл', 'Ответ на текстовое поле'];
    excelData.push(headerRow);

    // Data rows
    for (const result of results) {
      const row: any[] = [result.completedAt, result.totalScore, result.customFieldAnswer || ''];
      excelData.push(row);
    }

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, 'Результаты');

    // Generate buffer
    const buffer = Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as ArrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="survey-results-${surveyId}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Error exporting results:', error);
    return NextResponse.json({ error: 'Failed to export results' }, { status: 500 });
  }
}
