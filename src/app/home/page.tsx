import React from 'react'
import { Button } from '@/components/ui/button'
const page = () => {
    function handleSubmit() {
        // call the api to generate quizes
        // api/questions
        // const data = {
        //     topic: topic,
        //     amount: amount
        // }
        console.log('submit')
    }
  return (
    <div>
        <h1>Quize genrator</h1>
        <p>Quize genrator is a simple app to generate quizes</p>
        <h3>enter your topic and amount of questions</h3>
        <form onSubmit={handleSubmit()}>
            <label>Topic</label>
            <input type="text" name="topic" />
            <label>Amount</label>
            <input type="number" name="amount" />
            <Button type='submit'>Generate</Button>
        </form>

    </div>
  )
}

export default page