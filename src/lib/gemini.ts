import { GoogleGenerativeAI } from '@google/generative-ai'
const apiKey = process.env.API_KEY || '' // Provide a default value if API_KEY is undefined
const genAI = new GoogleGenerativeAI(apiKey)
const models = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    candidateCount: 1,
    stopSequences: ['x'],
    maxOutputTokens: 20,
    temperature: 1.0,
  },
})
interface OutputFormat {
  [key: string]: string | string[] | OutputFormat
}
interface OutputItem {
  question: string
  answer: string
  [key: string]: any
}

export async function strict_output(
  system_prompt: string,
  user_prompt: string | string[],
  output_format: OutputFormat,
  default_category: string = '',
  output_value_only: boolean = false,
  // temperature: number = 1.0,
  num_tries: number = 3,
  verbose: boolean = false
): Promise<OutputItem | OutputItem[]> {
  // if the user input is in a list, we also process the output as a list of json
  const list_input: boolean = Array.isArray(user_prompt)
  // if the output format contains dynamic elements of < or >, then add to the prompt to handle dynamic elements
  const dynamic_elements: boolean = /<.*?>/.test(JSON.stringify(output_format))
  // if the output format contains list elements of [ or ], then we add to the prompt to handle lists
  const list_output: boolean = /\[.*?\]/.test(JSON.stringify(output_format))

  // start off with no error message
  let error_msg: string = ''

  for (let i = 0; i < num_tries; i++) {
    let output_format_prompt: string = `\nYou are to output the following in json format: ${JSON.stringify(
      output_format
    )}. \nDo not put quotation marks or escape character \\ in the output fields.`

    if (list_output) {
      output_format_prompt += `\nIf output field is a list, classify output into the best element of the list.`
    }

    // if output_format contains dynamic elements, process it accordingly
    if (dynamic_elements) {
      output_format_prompt += `\nAny text enclosed by < and > indicates you must generate content to replace it. Example input: Go to <location>, Example output: Go to the garden\nAny output key containing < and > indicates you must generate the key name to replace it. Example input: {'<location>': 'description of location'}, Example output: {school: a place for education}`
    }

    // if input is in a list format, ask it to generate json in a list
    if (list_input) {
      output_format_prompt += `\nGenerate a list of json, one json for each input element.`
    }

    // Use OpenAI to get a response
    const result = await models.generateContent({
      contents: [
        {
          role: 'model',
          parts: [{ text: system_prompt + output_format_prompt + error_msg }],
        },
        { role: 'user', parts: [{ text: user_prompt.toString() }] },
      ],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.1,
      },
    })

    let res: string = result.response.text()

    // ensure that we don't replace away apostrophes in text
    // res = res.replace(/(\w)"(\w)/g, "$1'$2")
    res = res.replace(/^[^{]*\[/, '[') // This regex removes everything before the first '['

    // Remove any leading text before the JSON array
    res = res.replace(/^[^{]*\[/, '[') // This regex removes everything before the first '['

    // Remove unwanted characters including surrounding ```json and ```
    res = res.replace(/```json\s*|\s*```/g, '') // Remove ```json and ``

    // Fix the improperly formatted objects
    // res = res.replace(/"question":/g, '{"question":') // Add opening brace for each question
    res = res.replace(/},\s*"/g, '},\n"') // Ensure each object ends correctly
    res = res.replace(/},\s*$/g, '}') // Remove trailing commas after the last object
    res = res.replace(/,\s*}/g, '}') // Remove any commas before closing braces

    // Wrap the entire response in square brackets
    // res = '[' + res + ']'
    if (verbose) {
      console.log(
        'System prompt:',
        system_prompt + output_format_prompt + error_msg
      )
      console.log('\nUser prompt:', user_prompt)
      console.log('\nGPT response:', res)
    }

    // try-catch block to ensure output format is adhered to
    try {
      let output: OutputItem | OutputItem[] = JSON.parse(res) as
        | OutputItem
        | OutputItem[]

      if (list_input) {
        if (!Array.isArray(output)) {
          throw new Error('Output format not in a list of json')
        }
      } else {
        output = [output as OutputItem]
      }

      // check for each element in the output_list, the format is correctly adhered to
      for (let index = 0; index < output.length; index++) {
        for (const key in output_format) {
          // unable to ensure accuracy of dynamic output header, so skip it
          if (/<.*?>/.test(key)) {
            continue
          }

          // if output field missing, raise an error
          if (!(key in output[index])) {
            throw new Error(`${key} not in json output`)
          }

          // check that one of the choices given for the list of words is an unknown
          if (Array.isArray(output_format[key])) {
            const choices = output_format[key] as string[]
            // ensure output is not a list
            if (Array.isArray(output[index][key])) {
              output[index][key] = output[index][key][0]
            }
            // output the default category (if any) if GPT is unable to identify the category
            if (!choices.includes(output[index][key]) && default_category) {
              output[index][key] = default_category
            }
            // if the output is a description format, get only the label
            if (output[index][key].includes(':')) {
              output[index][key] = output[index][key].split(':')[0]
            }
          }
        }

        // if we just want the values for the outputs
        if (output_value_only) {
          output[index] = Object.values(output[index]).reduce((acc, val, idx) => {
            acc[Object.keys(output_format)[idx]] = val;
            return acc;
          }, {} as OutputItem)
          // just output without the list if there is only one element
          if (output[index].length === 1) {
            output[index] = output[index][0]
          }
        }
      }

      return list_input ? output : output[0]
    } catch (e) {
      error_msg = `\n\nResult: ${res}\n\nError message: ${e}`
      console.log('An exception occurred:', e)
      console.log('Current invalid json format:', res)
    }
  }

  return []
}
