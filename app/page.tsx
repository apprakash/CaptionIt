"use client";

import Link from "next/link";
import { FaCopy, FaGithub, FaTwitter } from "react-icons/fa";
import { SiLinkedin } from "react-icons/si";
import { useDropzone } from "react-dropzone";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCompletion } from "ai/react";
import { Upload } from "upload-js";

interface ExtendedFile extends File {
  preview: string;
}

export default function Home() {
  const [files, setFiles] = useState<ExtendedFile[]>([]);
  const [caption, setCaption] = useState("");
  const [isLoad, setIsLoad] = useState(false);

  const { complete, completion, setCompletion, isLoading } = useCompletion({
    api: "/api/caption",
  });

  const upload = Upload({
    apiKey: "public_12a1yDhFXdiwiqc5cp4roMGKbtde",
  });

  const uploadComplete = async (fileUrl: string) => {
    var response = await axios.post("api/", {
      url: fileUrl,
    });
    const result = response.data;
    const caption = "Caption: ";
    const captionIndex = result.indexOf(caption);
    let extractedText;
    if (captionIndex !== -1) {
      extractedText = result.substring(captionIndex + caption.length).trim();
    } else {
      extractedText = result.trim();
    }
    setCaption(extractedText);
    console.log("calling open ai ");
    complete(extractedText);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [],
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, { preview: URL.createObjectURL(file) })
        )
      );
      setCompletion("");
      setIsLoad(true);
      const { fileUrl } = await upload.uploadFile(acceptedFiles[0]);
      await uploadComplete(fileUrl);
    },
  });

  useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  const thumbs = files.map((file) => (
    <div key={file.name}>
      <img
        src={file.preview}
        onLoad={() => URL.revokeObjectURL(file.preview)}
        alt={file.name}
      />
    </div>
  ));

  const handleOnClick = () => {
    setCaption("");
    setIsLoad(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatApiResult = (result: any) => {
    if (result) {
      const formattedResult = result
        .split("$")
        .map((item: string, index: number, array: string[]) => {
          if (index == 0 ){
            return null;
          }
          if (index === array.length) {
            return (
              <div key={index}>
                <p className="mb-5">{item}</p>
              </div>
            );
          }
          return (
            <div key={index} className="flex items-center justify-between">
              <p className="mb-5">
                {item.trim().length > 0 ? item : ""}
                <button
                  className="font-semibold rounded"
                  onClick={() => handleCopy(item)}
                >
                  <FaCopy />
                </button>
              </p>
            </div>
          );
        });

      return <div>{formattedResult}</div>;
    }
  };

  // const formatApiResult = (result: any) => {
  //   if (result) {
  //     const formattedResult = result.replace(/-/g, "<p class='mb-5'>");
  //     const lineSpacingStyle = {
  //       lineHeight: "1.5",
  //     };
  //     return (
  //       <div
  //         style={lineSpacingStyle}
  //         dangerouslySetInnerHTML={{ __html: formattedResult }}
  //       />
  //     );
  //   }
  // };

  return (
    <main className="flex flex-col min-h-screen p-5 bg-gradient-to-r from-rose-100 to-teal-100 text-black">
      <div className="z-10 w-full flex items-center justify-between font-mono text-sm lg:flex border-b border-gray-400">
        <p className="top-0 flex w-full max-w-6xl pb-6 font-bold text-4xl">
          CaptionIt
        </p>
      </div>

      <div className="flex flex-col items-center justify-center mt-2">
        <p className="text-5xl font-semibold mb-5">
          Generate social media captions
        </p>
        <p className="text-xl">
          Simply upload your image, and let CaptionIt work its magic.
        </p>
      </div>

      {isLoad ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10 items-center justify-center h-full py-1">
            <div>
              <div className="max-w-4xl h-full flex justify-center">
                <div className="max-w-xl h-full">{thumbs}</div>
              </div>
            </div>
            <div>
              <div>
                <p>{caption}</p>
              </div>
              <div className="mt-10">
                <p>{formatApiResult(completion)}</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-4 pb-2">
            <button
              className="bg-primary font-semibold py-2 px-4 rounded border border-black"
              onClick={handleOnClick}
            >
              Upload a new photo
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center flex-grow">
          <div
            {...getRootProps()}
            className="p-20 border-2 rounded-4 border-black border-dashed outline-none transition border-opacity-24 max-w-xl text-black text-center text-20"
          >
            <input {...getInputProps()} />
            <p>Drag and drop some files here or click to select files</p>
            <em>(Only *.jpeg and *.png images will be accepted)</em>
          </div>
        </div>
      )}

      <div className="mt-auto flex items-center justify-between font-mono text-sm lg:flex border-t border-gray-400 p-1 md:p-4">
        <p className="text-center">© 2023 CaptionIt. All rights reserved.</p>
        <div className="flex items-center pt-4 space-x-2 md:space-x-4">
          <Link href="https://twitter.com/prakash_poorna">
            <div className="w-6 h-6 md:w-8 md:h-8">
              <FaTwitter />
            </div>
          </Link>
          <Link href="https://www.linkedin.com/in/poorna-prakash-1257bbb9/">
            <div className="w-6 h-6 md:w-8 md:h-8">
              <SiLinkedin />
            </div>
          </Link>
          <Link href="https://github.com/apprakash">
            <div className="w-6 h-6 md:w-8 md:h-8">
              <FaGithub />
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
