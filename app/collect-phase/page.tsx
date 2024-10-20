"use client";
import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

import {
  InputGroup,
  InputLeftAddon,
  Input,
  Button,
  Text,
  VStack,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaUser, FaRobot } from "react-icons/fa";
import Link from "next/link";

export default function CollectPhase() {
  const [apiKey, setApiKey] = useState("");
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [finished, setFinished] = useState(false);

  // ローカルストレージに過去のデータが残っていたら消去
  useEffect(() => {
    window.localStorage.removeItem("apiKey");
    window.localStorage.removeItem("content");
  }, []);

  // 会話のログを格納
  const [pastMessages, setPastMessages] = useState<
    { role: string; content: string }[]
  >([]);

  useEffect(() => {
    console.log("pastMessagesのログだよ", pastMessages);
  }, [pastMessages]);

  // 質問の回数をカウント
  const [questionCount, setQuestionCount] = useState(1);

  // 質問リスト
  const questionList = [
    "ペットについて",
    "家族について",
    "海外旅行先",
    "小学校について",
    "中学校について",
    "高校について",
    "大学について",
    "印象にあるバイト先について",
    "大怪我したこと",
    "実家について(場所など)",
    "いとこについて",
    "子供の頃憧れていた職業",
    "小学校の頃の親友の名前",
    "あだ名",
    "中学校の頃の親友の名前",
    "高校の頃の親友の名前",
    "大学の頃の親友の名前",
    "小学校の頃の習い事",
    "中学校の頃の習い事",
    "高校の頃の習い事",
  ];

  // 選んだ質問を格納
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([
    "ペットについて",
  ]);
  useEffect(() => {
    console.log(selectedQuestions);
  }, [selectedQuestions]);

  // finishedがtrueになったらローカルストレージに保存する
  useEffect(() => {
    if (finished) {
      const formatedMessages = messages
        .map((msg) => {
          return `${msg.role}:${msg.content}`;
        })
        .join(",");
      localStorage.setItem("apiKey", apiKey);
      localStorage.setItem("content", formatedMessages);
    }
  }, [finished]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // API キーが設定されているか確認
    if (!apiKey) {
      alert("API キーを入力してください。");
      return;
    }

    // セーフティを外す
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ];

    // 既に選択された質問を除いて，質問をランダムに一つ選ぶ
    if (questionCount === 3) {
      const question: string = questionList.filter(
        (q) => !selectedQuestions.includes(q)
      )[Math.floor(Math.random() * questionList.length)];
      await setSelectedQuestions([...selectedQuestions, question]);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest",
      systemInstruction: `あなたはセキュリティ質問を作るために質問しているインタビュアーです。エピソードベース過去の事実を質問をしています。質問のお題は${
        selectedQuestions[selectedQuestions.length - 1]
      }です．質問によっては，いつの頃なのか明記したり，状況によってカスタマイズや深堀りをしてください．例えば，ペットであれば種類や名前や好物などを聞き出すなどしてください。人であれば固有名詞を聞き出して下さい。質問内容には，回答しやすいように具体的な回答例も提示してください。日本語で一質問ずつ質問してください。何時ごろや住所や年齢などの細部の問いはしないでください．感想や個人の意見など，時期によって変化がありそうなものは聞かないでください．事実ベースで収集してください．過去のあなたの質問を回答の最後に含めているので，参照しながら同じ質問を絶対に繰り返さないようにしてください．なお，インタビューに関係するもの以外の会話をしてはいけません．`,
      safetySettings: safetySettings,
    });

    const generationConfig: any = {
      temperature: 1.5,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };

    const newMessages = [...messages, { role: "user", content: userInput }];

    // userInputが空の場合は，messagesの最後のメッセージを削除する
    if (userInput == "") {
      console.log("userInputが空です");
      const beforeMessages = [...messages];
      console.log("消す前", beforeMessages);
      beforeMessages.pop();
      console.log("消した後", beforeMessages);
      setMessages(beforeMessages);
      setPastMessages(beforeMessages);
    } else {
      setMessages(newMessages);
      setPastMessages(newMessages);
    }
    console.log(pastMessages);
    setUserInput("");

    function promptInstruction(): string {
      if (questionCount === 3) return "次の質問をしてください";
      else return "ユーザーの回答を深堀りしてください";
    }

    console.log("modelへの指示" + promptInstruction());

    try {
      const result = await model.generateContent(
        "以下は過去の質問の履歴です。同じ質問をしないで下さい。\n```" +
          messages +
          "\n```\n 以下が最後の質問に対するユーザーの回答です\n「" +
          userInput +
          "」" +
          promptInstruction() +
          "\n同じ質問をしていないか，出力する前に過去の対話の履歴と見比べてください．ない場合は気にせず出力してください.",
        generationConfig
      );
      const response = await result.response;
      let text = response.text();
      setQuestionCount(questionCount + 1);
      console.log("質問カウント:" + questionCount);
      console.log("質問リスト:" + selectedQuestions);

      // 質問したリストの長さが3かつ，質問回数も3回の場合，終了
      if (selectedQuestions.length > 4 && questionCount > 2) {
        text = "ご協力ありがとうございました。エピソードの収集が完了しました。";
        setMessages([...newMessages, { role: "model", content: text }]);
        setFinished(true);
        console.log(messages);
        return;
      }
      setMessages([...newMessages, { role: "model", content: text }]);
      setPastMessages([...pastMessages, { role: "model", content: text }]);

      // カウントをリセット
      if (questionCount === 3) {
        setQuestionCount(0);
        setPastMessages([]);
      }
    } catch (error: any) {
      // API キーが無効な場合のエラー処理
      if (error.message.includes("unregistered callers")) {
        alert("API キーが無効です。");
      } else {
        console.error(error);
        alert("エラーが発生しました。");
      }
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const inputBgColor = useColorModeValue("gray.100", "gray.700");

  return (
    <div className="flex items-center justify-center">
      <VStack className="my-8 md:my-20 mx-8 max-w-4xl">
        <div className="flex items-center justify-center">
          <InputGroup>
            <InputLeftAddon>Gemini API Key を入力：</InputLeftAddon>
            <Input
              id="apiKey"
              placeholder="API Keyを入力してください"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              bg={inputBgColor}
              className="border px-4 border-gray-400 w-40 md:w-80"
            />
          </InputGroup>
          <form onSubmit={handleSubmit}>
            <input className="hidden" value="質問を開始してください" />
            <button
              type="submit"
              className="hidden md:inline-block w-28 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 m-10"
            >
              質問を開始
            </button>
          </form>
        </div>
        <form onSubmit={handleSubmit}>
          <input className="hidden" value="質問を開始してください" />
          <button
            type="submit"
            className="md:hidden w-28 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 m-10"
          >
            質問を開始
          </button>
        </form>

        <VStack
          h="55vh"
          overflowY="auto"
          spacing={4}
          p={2}
          className="no-scrollbar"
        >
          {messages.map((msg, index) => (
            <HStack
              key={index}
              alignSelf={msg.role === "user" ? "flex-end" : "flex-start"}
              w="fit-content"
              p={3}
              borderRadius="md"
              className={`${
                msg.role === "user" ? "bg-blue-100" : "bg-gray-200"
              }`}
            >
              {msg.role !== "user" && <FaRobot className="w-10 px-2" />}
              <div className="flex flex-col">
                <Text className="max-w-64 md:max-w-3xl">{msg.content}</Text>
                <div className={`${msg.role !== "user" ? "block" : "hidden"}`}>
                  <form onSubmit={handleSubmit}>
                    <textarea hidden value="次の質問をして下さい" />
                    <Button
                      type="submit"
                      className=" hover:underline text-blue-500"
                      onClick={() => {
                        setQuestionCount(0);
                        setPastMessages([]);
                        const question: string = questionList.filter(
                          (q) => !selectedQuestions.includes(q)
                        )[Math.floor(Math.random() * questionList.length)];
                        setSelectedQuestions([...selectedQuestions, question]);
                      }}
                    >
                      質問をスキップ
                    </Button>
                  </form>
                </div>
              </div>
              {msg.role === "user" && <FaUser className="w-10 px-2" />}
            </HStack>
          ))}

          <div ref={messagesEndRef} />
        </VStack>

        <form
          onSubmit={handleSubmit}
          style={{ width: "100%" }}
          className={`${finished ? "hidden" : "block"}`}
        >
          <HStack>
            <textarea
              placeholder="メッセージを入力"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="border px-4 border-gray-400 w-full"
              rows={3}
            />
            <Button
              type="submit"
              colorScheme="blue"
              className=" border rounded-md px-2 bg-gray-200"
            >
              送信
            </Button>
          </HStack>
        </form>
        <div className={`${finished ? "block" : "hidden"}`}>
          <button
            type="button"
            className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 focus:outline-none dark:focus:ring-red-800 m-10"
          >
            <Link href="/certificate-phase">認証体験に進む</Link>
          </button>
        </div>
      </VStack>
    </div>
  );
}
