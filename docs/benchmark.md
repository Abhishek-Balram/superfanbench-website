# How SuperFanBench works

SuperFanBench tests how well a language model recalls very specific details from books, films, and TV. Each question asks for the kind of fact a superfan knows and a casual reader or viewer does not, such as the name of a minor character or what one line of dialogue says.

## How a run works

A run tests one or more candidate models on the same private set of questions. Every candidate gets the same system prompt and answers each question once.

A separate model, the judge, then grades each answer. The judge sees the question, the answer, and a rubric written for that question. The rubric says what a correct answer must contain and what makes an answer wrong. A run can have more than one judge, so the same answers can be graded twice and the grades compared.

## What an answer can count as

The judge gives every answer one of three outcomes.

| Outcome | When |
|---|---|
| Correct | The answer meets the rubric. A hedged answer that is right still counts. |
| Incorrect | The answer does not meet the rubric, and the model committed to it. |
| Declined | The answer does not meet the rubric, and the model said it does not know or refused to answer. |

The system prompt tells a model whether to guess or to say "I don't know" when it is not sure. Read the declined counts together with the system prompt of the run.

## How the numbers are calculated

Accuracy is the share of questions that a model answers correctly. A decline counts against accuracy in the same way as a wrong answer. The leaderboard ranks models by accuracy. In both formulas, `total` is the number of questions in the run.

```
accuracy = correct / total
```

The score also rewards a model that knows when it does not know. Each correct answer adds 1, each incorrect answer subtracts 1, and each decline adds 0.

```
score = (correct - incorrect) / total
```

The score runs from -1 to +1. A model that is always right scores +1, a model that always declines scores 0, and a model that is always wrong scores -1. A wrong answer costs more than a decline.

## Why the questions are private

Text on the public internet can end up in the training data of future models. A model that has trained on the questions can repeat the answers without recalling the works, so its score no longer shows what it recalls. SuperFanBench keeps its questions, rubrics, and answers private. It publishes only the totals for each model.
