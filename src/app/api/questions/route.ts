import { strict_output } from '@/lib/gemini'
import { getQuestionsSchema } from '@/schemas/questions'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export const runtime = 'nodejs'
export const maxDuration = 500

export async function POST(req: Request) {
  try {
    
    const body = await req.json()
    const { amount, topic, type } = getQuestionsSchema.parse(body)
    let questions: any

    if (type === 'open_ended') {
      const prompts = Array.from(
        { length: amount },
        () =>
          `You are to generate a random hard open-ended question about ${topic}`
      )

      questions = await strict_output(
        'You are a helpful AI that is able to generate a pair of question and answers, the length of each answer should not be more than 15 words, store all the pairs of answers and questions in a JSON array',
        prompts,
        {
          question: 'question',
          answer: 'answer with max length of 15 words',
        }
      )

      // Debugging: Log the number of questions generated
      console.log(`Generated ${questions.length} open-ended questions.`)

      // Safeguard to limit the output to the requested amount
      questions = questions.slice(0, amount)
    } else if (type === 'mcq') {
      const prompts = Array.from(
        { length: amount },
        () => `You are to generate a random hard mcq question about ${topic}`
      )

      questions = await strict_output(
        'You are an AI designed to generate multiple-choice questions (MCQs) with concise answers. Create each question with four options, clearly marked as A, B, C, and D, and provide a corresponding correct answer. Each answer should not exceed 15 words. Store all questions, options, and correct answers in a JSON array format. Return only the JSON array, with no additional text or explanation.', 
        prompts,
        {
          question: 'question',
          answer: 'answer with max length of 15 words',
          option1: 'option1 with max length of 15 words',
          option2: 'option2 with max length of 15 words',
          option3: 'option3 with max length of 15 words',
        }
      )

      // Debugging: Log the number of questions generated
      console.log(`Generated ${questions.length} MCQ questions.`)
      // debuggeing: log the questions
      console.log(amount)

      // Safeguard to limit the output to the requested amount
      questions = questions.slice(0, amount)
    }

    return NextResponse.json(
      {
        questions: questions,
        amount: amount,
      },
      {
        status: 200,
      }
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues },
        {
          status: 400,
        }
      )
    } else {
      console.error('gpt error', error)
      return NextResponse.json(
        { error: 'An unexpected error occurred.' },
        {
          status: 500,
        }
      )
    }
  }
}
