"use client";
import { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { useToast, Spinner } from "@chakra-ui/react";

export default function CertificatePhase() {
  // ローカルストレージからデータを取得
  const key = localStorage.getItem("apiKey");
  const content = localStorage.getItem("content");

  // 何かエラーが起きた時に吐き出す
  const [error, setError] = useState("");
  // 生成AIの処理が終わったかどうか判定する変数
  const [finished, setFinished] = useState(false);
  // 認証に使うデータを格納する変数
  const [episodeElement, setEpisodeElement] = useState<EpisodeData[]>([]);
  // 正解データを入れる
  const [correctData, setCorrectData] = useState<string[]>([]);
  useEffect(() => {
    // correctData が変更されたらコンソールにログを出力
    console.log("correctData updated:", correctData);
  }, [correctData]);
  // 回答データを入れる
  const [selectingData, setSelectingData] = useState<UserSelectData[]>([]);
  useEffect(() => {
    // selectingData が変更されたらコンソールにログを出力
    console.log("selectingData updated:", selectingData);
  }, [selectingData]);

  // 型定義
  type EpisodeData = {
    question: string[];
    answer: string[];
  };

  type UserSelectData = {
    index: number;
    index2: number;
    answer: string;
  };

  // gemini呼び出しのための関数
  async function geminiCall(systemInstruction: string, prompt: string) {
    const apiKey: string = key as string;
    const genAI = new GoogleGenerativeAI(apiKey);

    const generationConfig: any = {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };

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

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: generationConfig,
      systemInstruction: systemInstruction,
      safetySettings: safetySettings,
    });

    console.log("promptの確認：" + prompt);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("AIからのoutput生データ：" + text);

    return text;
  }

  async function elementsCreate() {
    try {
      // まずはデータフォーマットと選定
      const inputFormatString: string =
        'あなたは、ユーザーが回答したデータを整形する人です。あなたに，AIが質問した内容とユーザーが回答した内容のデータを渡します。あなたは、そのデータに基づいて短い質問と短い回答を再構成必要があります。例えば、 [{question: "家族と行った人生の中で印象に残っている旅行の場所はどこか？", answer: "グアム"},{question: "家族と行った人生の中で印象に残っている旅行先で何をしたか？",answer: "ナマコを拾った"}] のように整形します。回答が「わからない」「覚えてない」「次の質問へ」などの求めている回答になっていないものや，個人の意見や感想に基づくものは、スキップして出力しないでください。ペットの質問などで，「いない」といった回答は採用しても良いです．感じたことや思ったことや気持ちは出力しないでください．できる限り多くの要素に分けて出力して下さい．ただし，いつ頃の出来事なのかは質問にちゃんと加え,できる限り単語か短い文章で出力してください．関連しており，片方の質問からもう片方の答えが想像できるようなものを選択してはいけません．回答がカンマや点，接続詞で区切られている場合は，分けて出力してください．ハルシネーションを起こさないで，入力されたデータに基づいて下さい．';
      const formatedData = await geminiCall(
        inputFormatString,
        content as string
      );

      // 次はデータ選定を行う
      const inputSelectString: string =
        'あなたは，与えられたデータからセキュリティ質問として適切で強固な，質問と回答のセットを5つ選定する人です．出力は "[{"question":["質問1"],"answer":["回答1"]},{"question":["質問2"],"answer":["回答2"]}]" のようなJSON形式のみ許可します．また，**絶対に同じような質問(question)は含めてないでください**．回答が「わからない」「覚えてない」「いない」などの求めている回答になっていないものや，個人の意見や感想に基づくものは、スキップして出力しないでください。感じたことや気持ちを含むものは含めないでください．ハルシネーションを起こさないように慎重に出力してください．**入力されたデータ以外を出力しないでください**．**同じトピックの質問を繰り返さないで下さい**．ハルシネーションを起こさないで，入力されたデータから変更しないでださい．';
      const selectedData = await geminiCall(inputSelectString, formatedData);
      const replacedSelectedData = selectedData
        .replace("```", "")
        .replace("json", "")
        .replace("```", "");
      console.log("選定後データ確認・JSONパース前：" + replacedSelectedData);
      const parsedJsonData: EpisodeData[] = JSON.parse(replacedSelectedData);
      console.log(
        "選定後データ確認・JSONパース後：" +
          parsedJsonData.map((data) => data.question + ":" + data.answer)
      );

      // episodeElementの1つのanswerに対してダミーデータを生成
      // ダミーデータはカンマ区切りで出力されるので，それをepisodeElementのanswerの配列に追加する
      // answerの配列はランダムに並び替えられる
      const inputDummyString: string =
        "あなたはダミーデータをカンマ(,)区切りで出力します。ユーザーは質問と正しい回答を入力するので、回答の**ダミー文9個をカンマ区切り形式で**出力して下さい。回答が文章であれば文章のダミーデータを，単語であれば単語のダミーデータを出力をしてください．文章のダミーデータはなるべく短い文章で作成してください．質問に対する回答ダミーデータを作成してください．意味が似ている回答ダミーデータのセットを絶対作ってはいけません．回答データと意味の異なるダミーデータを作成してください．出力は，hoge,hoge,hoge,hogeのような，カンマ区切りで，回答ダミーデータだけを出力して下さい．ダミーデータは必ずカンマ(,)で区切って出力してください．**ダミーデータは必ずカンマ(,)で区切って出力してください!!!!**．人の名前に「さん」「ちゃん」「くん」がついている場合のみ，ダミーデータにもつけて下さい．回答に漢字とひらがなの混合がある場合は，ダミーデータもそのように作成してください．";

      const correctAnswers: string[] = [];
      for (const episode of parsedJsonData) {
        correctAnswers.push(episode.answer[0]);
        const outputDummyData: string = await geminiCall(
          inputDummyString,
          "質問：" + episode.question[0] + "回答：" + episode.answer[0]
        );
        const dummyData: string[] = outputDummyData.split(",");
        episode.answer.push(...dummyData);
        episode.answer.sort(() => Math.random() - 0.5);
        console.log("1ダミーデータ生成：" + episode.answer);
      }
      setCorrectData(correctAnswers);
      setEpisodeElement(parsedJsonData);

      await console.log("correctData確認：" + correctData);
      await console.log(
        "episodeElement確認：" + episodeElement.map((data) => data.answer)
      );

      setFinished(true);
    } catch (error: any) {
      console.error("エラー:", error);
      setError(error);
    }
  }

  // 認証ボタンを押した時のエラーToast
  const toast = useToast();

  // 認証処理が成功できるかどうかのチャレンジ
  const [certificateResult, setCertificateResult] = useState<
    string | undefined
  >(undefined);
  function challenge(): string {
    console.log(selectingData);
    console.log(correctData);

    // selectingDataをindexでソート
    selectingData.sort((a, b) => a.index - b.index);

    if (selectingData.length !== correctData.length) {
      console.log("回答数が足りません");
      toast({
        title: "回答数が足りません",
        description: "全ての質問に回答してください",
        status: "error",
        duration: 1000,
        isClosable: true,
      });
      return "回答数が足りません";
    }
    for (let i = 0; i < selectingData.length; i++) {
      if (selectingData[i].answer !== correctData[i]) {
        console.log("回答が間違っています");
        toast({
          title: "回答が間違っています",
          description: "全ての質問に正解して下さい",
          status: "error",
          duration: 1000,
          isClosable: true,
        });
        return "回答が間違っています";
      }
    }

    console.log("認証成功");
    toast({
      title: "認証に成功しました",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
    return "認証成功";
  }

  // 実験データの送信先と送信処理
  const WEB_APP_URL =
    "https://script.google.com/macros/s/AKfycbxj5UZiIT9MxyL1SKYscCE6JJXBx6Yjgjz12y-sXdycGbY_94b1SOvy2AumKWwa7G9hpQ/exec";

  async function sendExperimentData() {
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
            episodeElement
              .map((data) => data.question + ":" + data.answer)
              .join(",") +
            "😃" +
            correctData.map((data) => data).join(",") +
            "😃" +
            selectingData.map((data) => data.answer).join(","),
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
      return;
    }
  }

  useEffect(() => {
    elementsCreate();
  }, []);

  return (
    <div className="flex flex-col justify-center items-center">
      <div className={`${finished ? "hidden" : "block"} my-20 text-center`}>
        <Spinner
          thickness="4px"
          speed="0.65s"
          size="xl"
          className="w-20 h-20 my-16"
        />
        <div>処理中だよ，ちょっと待ってね</div>
        <div className={`${error == "" ? "hidden" : "block"}`}>
          エラーが発生しました💦
          <br />
          {error}
        </div>
      </div>
      <div
        className={`${
          finished ? "block" : "hidden"
        } max-w-lg md:max-w-4xl space-y-8`}
      >
        {episodeElement.map((element, index) => {
          return (
            <div key={index} className=" space-y-2 mx-8 mt-16">
              <h2 className=" text-lg">{element.question[0]}</h2>
              <div className=" flex flex-wrap space-y-2 space-x-2">
                {element.answer.map((answer, index2) => {
                  const isSelected = selectingData.find(
                    (data) =>
                      data.answer === answer &&
                      data.index === index &&
                      data.index2 === index2
                  );
                  return (
                    <button
                      key={index2}
                      onClick={() => {
                        setSelectingData((alreadySelection) => {
                          const existingIndex = alreadySelection.findIndex(
                            (data) => data.index === index
                          );
                          if (existingIndex !== -1) {
                            const updatedSelection = [...alreadySelection];
                            updatedSelection[existingIndex] = {
                              index,
                              index2,
                              answer,
                            };
                            return updatedSelection;
                          } else {
                            return [
                              ...alreadySelection,
                              { index, index2, answer },
                            ];
                          }
                        });
                      }}
                      className={`${
                        isSelected ? " bg-blue-400 " : "bg-gray-300"
                      } outline rounded-md px-2 py-2`}
                    >
                      {answer}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        <div className="mx-auto my-16 flex space-x-8 justify-center items-center">
          <button
            onClick={() => {
              setCertificateResult(challenge());
              sendExperimentData();
            }}
            className=" w-28 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 m-10"
          >
            認証
          </button>
          <div
            className={`${
              certificateResult == undefined ? "hidden" : "block"
            } ${
              certificateResult == "認証成功"
                ? " text-green-500"
                : " text-red-500"
            } my-auto pt-2`}
          >
            {certificateResult}
          </div>
        </div>
      </div>
    </div>
  );
}
