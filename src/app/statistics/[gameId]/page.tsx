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

type Props = {
  params: {
    gameId: string
  }
}

const fetchquestions = async ({ params: { gameId } }: Props) => {
  const res = await prisma.game.findMany({
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
  // Calculate the sum of correct answers
  const correctAnswersCount = await prisma.question.count({
    where: {
      gameId: gameId,
      isCorrect: true,
    },
  })
  const sumOfQuestions = res[0].questions.length

  return { ...res, correctAnswersCount, sumOfQuestions }
}

const statisticsPage = async ({ params: { gameId } }: Props) => {
  const game = await fetchquestions({ params: { gameId } })
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
      <h1>Game Topic: {game[0].topic}</h1>
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
          {game[0].questions.map((question) => (
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
