"use client";
import { useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  InputGroup,
  InputLeftAddon,
  Input,
  Button,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  Spinner,
} from "@chakra-ui/react";
import Link from "next/link";

export default function CertificatePhase() {
  const searchParams = useSearchParams();
  const key = searchParams.get("key");
  const content = searchParams.get("content");

  // 何かエラーが起きた時に吐き出す
  const [error, setError] = useState("");
  // 生成AIの処理が終わったかどうか判定する変数
  const [finished, setFinished] = useState(false);
  // 認証に使うデータを格納する変数
  let useEpisodeElement: EpisodeData[] = [];
  // 正解データを入れる
  const [correctData, setCorrectData] = useState<string[]>([]);
  // 回答データを入れる
  const [selectingData, setSelectingData] = useState<string[]>([]);

  // 型定義
  type EpisodeData = {
    question: string[];
    answer: string[];
  };

  // エピソードデータをフォーマットする際に使う関数
  async function formatData() {
    const apiKey: string = key as string;
    const genAI = new GoogleGenerativeAI(apiKey);

    const generationConfig: any = {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: generationConfig,
      systemInstruction:
        'あなたは、ユーザーが回答したデータを整形する人です。あなたに，AIが質問した内容とユーザーが回答した内容のJSONデータを渡します。あなたは、そのデータに基づいて質問と回答をよりシンプルに整理する必要があります。例えば、{旅行:{"question": "あなたの人生で最も印象に残っている旅行はいつどこでしたか？具体的な場所や経験、誰と一緒だったかなど、可能な限り詳細を教えてください。 ",\n"answer": "グアムで家族と行った、ナマコいっぱい拾った"}} は [{question: "家族と行った人生の中で印象に残っている旅行の場所", answer: "グアム"},{question: "家族と行った人生の中で印象に残っている旅行先で何をしたか",answer: "ナマコをいっぱい拾った"}] のようになります。出力は "{category: [{question: answer]}" のようなJSON形式のみで出力してください。 回答が「わからない」「覚えてない」などの求めている回答になっていないものや，個人の意見や感想に基づくものは、スキップして出力しないでください。日本語で出力してください。',
    });

    const prompt: string = content as string;

    console.log("データの整形前確認：" + prompt);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("データの整形後：" + text);
    return text;
  }

  // フォーマットしたデータの中から，実際に使用するデータを選定する
  async function selectData(data: Promise<string>) {
    const apiKey: string = key as string;
    const genAI = new GoogleGenerativeAI(apiKey);

    const generationConfig: any = {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: generationConfig,
      systemInstruction:
        'あなたは，セキュリティ質問として適切で強固な，質問と回答のセットを選定する人です．入力された質問と回答のJSONデータの中から，他人に見破られにくい質問と回答を5つ挙げて下さい．出力形式は[{question: ["家族と行った人生の中で印象に残っている旅行の場所"], answer: ["グアム"]},{question: ["家族と行った人生の中で印象に残っている旅行先で何をしたか"],answer: ["ナマコをいっぱい拾った"]}] のようになります。出力は "[{"question":["実際の質問"],"answer":["実際の回答"]},{"question":["別の質問"],"answer":["別の回答"]}]" のようなJSON形式のみ許可します',
    });

    const prompt: string = await data;

    console.log("選定前データ確認：" + prompt);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text);
    try {
      const jsonData: EpisodeData[] = JSON.parse(text);
      console.log("選定後データ確認・JSONパース前：" + jsonData);
      return jsonData;
    } catch (error) {
      console.error("JSON パースエラー:", error);
    }
  }

  // ダミーデータを生成するときに使う関数
  async function createDummyData(data: string) {
    const apiKey: string = key as string;
    const genAI = new GoogleGenerativeAI(apiKey);

    const generationConfig: any = {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: generationConfig,
      systemInstruction:
        "あなたはダミーデータを生成するスペシャリストです。ユーザーは正しい文字列を入力するので、ダミー文14個をカンマ区切り形式で出力して下さい。本人にはわかるが，他者から見たら区別がつかないようなものを求めます．出力は，hoge,hoge,hoge,hogeのような，カンマ区切りで，結果だけを出力して下さい．日本語で出力して下さい。",
    });

    const prompt: string = data;

    console.log("ダミーデータ入力前確認：" + prompt);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("ダミーデータ入力後確認：" + text);
    const dummyData: string[] = text.split(",");
    return dummyData;
  }

  // 上記関数実行していく
  // まずはデータフォーマットと選定
  async function elementsCreate() {
    try {
      // 一つ一つのデータに対してダミーデータを生成
      const resolvedData = await selectData(formatData());
      resolvedData!.forEach(async (data: EpisodeData) => {
        setCorrectData([...correctData, data.answer[0]]);
        const dummyData: Array<string> = await createDummyData(data.answer[0]);
        data.answer.push(...dummyData);
        data.answer.sort(() => Math.random() - 0.5);
        console.log("ダミーデータ１つずつ生成中：" + data);
        useEpisodeElement.push(data);
      });
      console.log("最後のフォーマット確認：" + useEpisodeElement);
      setFinished(true);
    } catch (error: any) {
      console.error("エラー:", error);
      setError(error);
    }
  }

  // 以下の関数の実行によって，
  // [{"question":["実際の質問"],"answer":["実際の回答","偽の回答"]},{"question":["別の質問"],"answer":["別の回答","偽の回答"]}]
  // のような形式が実現できるはず
  elementsCreate();

  // 認証処理が成功できるかどうかのチャレンジ
  let ok;
  function challenge() {
    console.log(selectingData);
    console.log(correctData);
    if (selectingData.length !== correctData.length) {
      console.log("回答数が足りません");
      return false;
    }
    for (let i = 0; i < selectingData.length; i++) {
      if (selectingData[i] !== correctData[i]) {
        console.log("回答が間違っています");
        return false;
      }
    }
    console.log("認証成功");
    return true;
  }

  // 実験データの送信先と送信処理
  const WEB_APP_URL =
    "https://script.google.com/macros/s/AKfycbxAjbVHyrYOjVTYS2SwKXv7DQvK6a1_Gw9LOtyFEPGYINJ8BrbzIT003rk0G6STnBMYaA/exec";

  const handleDataSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const res = await fetch(WEB_APP_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          postData:
            (content as string) +
            "😃" +
            useEpisodeElement +
            "😃" +
            correctData +
            "😃" +
            selectingData,
        }),
      });

      if (res.ok) {
        const data = await res.text();
        console.log(data);
      } else {
        console.error("実験データの送信時にエラーが発生しました");
      }
    } catch (error) {
      console.error("実験データの送信時にエラー:", error);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <div className={`${finished ? "hidden" : "block"} my-20 text-center`}>
        <Spinner
          thickness="4px"
          speed="0.65s"
          size="xl"
          className="w-20 h-20 my-16"
        />
        <div>処理中だよ，ちょっと待ってね</div>
        <div className={`${error == "" ? "hidden" : "block"}`}>
          エラーが発生しました。
          <br />
          {error}
        </div>
      </div>
      <div className={`${finished ? "block" : "hidden"}`}>
        {useEpisodeElement.map((element, index) => {
          return (
            <div key={index}>
              <VStack>
                <Text>{element.question[0]}</Text>
                <HStack>
                  {element.answer.map((answer, index) => {
                    return (
                      <Button
                        key={index}
                        onClick={() => {
                          setSelectingData([...selectingData, answer]);
                        }}
                        className={`${
                          selectingData.includes(answer)
                            ? "bg-blue-500"
                            : "bg-gray-300"
                        }, outline`}
                      >
                        {answer}
                      </Button>
                    );
                  })}
                </HStack>
              </VStack>
            </div>
          );
        })}
        <Button
          onClick={() => {
            ok = challenge;
            handleDataSubmit;
          }}
        >
          認証
        </Button>
        <div className={`${ok == undefined ? "hidden" : "block"}`}>
          {ok ? "認証成功" : "認証失敗"}
        </div>
      </div>
    </div>
  );
}
