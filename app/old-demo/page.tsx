"use client";
import { use, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [selectedQuestion1, setSelectedQuestion1] = useState("");
  const [answer1, setAnswer1] = useState("");
  const [selectedQuestion2, setSelectedQuestion2] = useState("");
  const [answer2, setAnswer2] = useState("");
  const [selectedQuestion3, setSelectedQuestion3] = useState("");
  const [answer3, setAnswer3] = useState("");
  const questions = [
    "はじめて飼ったペットの名前",
    "母親の旧姓",
    "両親が出会った街の名前",
    "憧れの職業は？",
    "一番好きな映画",
    "好きな食べ物",
  ];

  const [hideform, sethideform] = useState(false);
  const [challange, setChallange] = useState(false);

  const handleQuestionChange1 = (event: any) => {
    setSelectedQuestion1(event.target.value);
  };

  const handleQuestionChange2 = (event: any) => {
    setSelectedQuestion2(event.target.value);
  };

  const handleQuestionChange3 = (event: any) => {
    setSelectedQuestion3(event.target);
  };

  const handleAnswerChange1 = (event: any) => {
    setAnswer1(event.target.value);
  };

  const handleAnswerChange2 = (event: any) => {
    setAnswer2(event.target.value);
  };

  const handleAnswerChange3 = (event: any) => {
    setAnswer3(event.target.value);
  };

  return (
    <div className="flex items-center justify-center my-12  space-y-8 flex-col">
      <div className="text-md md:text-xl ">
        <div className={`${hideform ? "hidden" : "block"}`}>
          <div>
            <label htmlFor="questionSelect">質問を選択:</label>
            <select
              id="questionSelect1"
              value={selectedQuestion1}
              onChange={handleQuestionChange1}
            >
              <option value="">-- 選択してください --</option>
              {questions.map((question, index) => (
                <option key={index} value={question}>
                  {question}
                </option>
              ))}
            </select>

            <br />

            <label htmlFor="answerInput1">回答:</label>
            <input
              type="text"
              id="answerInput1"
              value={answer1}
              onChange={handleAnswerChange1}
              disabled={!selectedQuestion1}
              className=" border-2 border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="questionSelect2">質問を選択:</label>
            <select
              id="questionSelect2"
              value={selectedQuestion2}
              onChange={handleQuestionChange2}
            >
              <option value="">-- 選択してください --</option>
              {questions.map((question, index) => (
                <option key={index} value={question}>
                  {question}
                </option>
              ))}
            </select>

            <br />

            <label htmlFor="answerInput2">回答:</label>
            <input
              type="text"
              id="answerInput2"
              value={answer2}
              onChange={handleAnswerChange2}
              disabled={!selectedQuestion2}
              className=" border-2 border-gray-300 rounded-md"
            />
          </div>

          <button
            onClick={() => {
              sethideform(true);
            }}
            disabled={
              !selectedQuestion1 || !selectedQuestion2 || !answer1 || !answer2
            }
            className="text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 focus:outline-none m-5"
          >
            完了
          </button>
        </div>
      </div>
      <div className={`${hideform ? "block" : "hidden"}`}>
        <div>
          <label htmlFor="questionSelect">質問:</label>
          <span>{selectedQuestion1}</span>
          <br />
          <label htmlFor="answerInput">回答:</label>
          <input
            type="text"
            id="answerInput3"
            className=" border-2 border-gray-300 rounded-md"
          />
        </div>

        <div>
          <div>
            <label htmlFor="questionSelect">質問:</label>
            <span>{selectedQuestion2}</span>
            <br />
            <label htmlFor="answerInput">回答:</label>
            <input
              type="text"
              id="answerInput3"
              className=" border-2 border-gray-300 rounded-md"
            />
          </div>
          <button
            onClick={() => {
              setChallange(true);
            }}
            disabled={
              !selectedQuestion1 || !selectedQuestion2 || !answer1 || !answer2
            }
            className="text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 focus:outline-none m-5"
          >
            正答を確認
          </button>
        </div>
        <div className={`${challange ? "block" : "hidden"}`}>
          <div>上から順に</div>
          <div>{answer1}</div>
          <div>{answer2}</div>
        </div>
      </div>
      <div className=" mt-20 pt-16">
        <button
          type="button"
          className=" text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 m-5"
        >
          <Link href={"/"}>ホームに戻る</Link>
        </button>
      </div>
    </div>
  );
}
