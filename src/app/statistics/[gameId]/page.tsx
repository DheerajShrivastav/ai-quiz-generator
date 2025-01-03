import { prisma } from '@/lib/db'
import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ResultChart } from '@/components/ResultChart'
import { Card } from '@/components/ui/card'

type Question = {
  id: string
  question: string
  options: any
  userAnswer: string | null
  answer: string | null
  isCorrect: boolean | null
}
// type Game = {
//   id: string
//   topic: string
//   questions: Question[]
// }

// type FetchQuestionsResponse = {
//   correctAnswersCount: number
//   sumOfQuestions: number
// } & Game
type Props = {
  params: {
    gameId: string
  }
}

const fetchquestions = async ({ params: { gameId } }: Props) => {
  const res = await prisma.game.findUnique({
    where: {
      id: gameId,
    },
    include: {
      questions: {
        select: {
          id: true,
          question: true,
          options: true,
          userAnswer: true,
          answer: true,
          isCorrect: true,
        },
      },
    },
  })
  if (!res) {
    return null // or handle the case where no game is found
  }
  // Calculate the sum of correct answers
  const correctAnswersCount = await prisma.question.count({
    where: {
      gameId: gameId,
      isCorrect: true,
    },
  })
  const sumOfQuestions = res.questions.length

  return { ...res, correctAnswersCount, sumOfQuestions }
}

const statisticsPage = async ({ params: { gameId } }: Props) => {
  const game = await fetchquestions({ params: { gameId } })
  if (!game) {
    return <div>No game found</div>
  }
  return (
    <div>
      <div className="flex justify-center">
        <Card className="flex flex-1 flex-row justify-center max-w-5xl">
          <ResultChart
            correctAnswer={game.correctAnswersCount}
            wrongAnswers={game.sumOfQuestions - game.correctAnswersCount}
          />
        </Card>
      </div>
      {/* <div>statisticsPage:{gameId}</div>
      <div>{JSON.stringify(game)}</div> */}
      <h1>Game Topic: {game.topic}</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Question</TableHead>
            <TableHead>Correct Answer</TableHead>
            <TableHead>User Answer</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {game.questions.map((question: Question) => (
            <TableRow key={question.id}>
              <TableCell>{question.question}</TableCell>
              <TableCell>{question.answer}</TableCell>
              <TableCell>{question.userAnswer}</TableCell>
              <TableCell>
                {question.isCorrect ? (
                  <span role="img" aria-label="correct">
                    ✅
                  </span>
                ) : (
                  <span role="img" aria-label="worng">
                    ❌
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p>Total score: {game.correctAnswersCount} </p>
      <p>Total questions: {game.sumOfQuestions} </p>
      <p>
        percentage: {(game.correctAnswersCount / game.sumOfQuestions) * 100} %{' '}
      </p>
    </div>
  )
}

export default statisticsPage
