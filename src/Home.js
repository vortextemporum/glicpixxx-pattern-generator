import { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import { apiUrl, BATCHER_ADDRESS, BATCHER_ABI } from "./config";
import Web3 from "web3";

import ImagePicker from "react-image-picker";
import "react-image-picker/dist/index.css";

import { ReactP5Wrapper } from "react-p5-wrapper";
import sketch from "./sketch.js";

// BACKGROUND SKETCH

export default function Home() {
  const [signedIn, setSignedIn] = useState(false);

  const [walletAddress, setWalletAddress] = useState(
    "0xe49381184a49cd2a48e4b09a979524e672fdd10e"
  );
  const [walletGLICPIX, setWalletGLICPIX] = useState([]);
  const [walletImages, setWalletImages] = useState([]);
  const [imagesNames, setImagesNames] = useState([]);
  const [thumbSize, setThumbSize] = useState(64);

  const [images, setImages] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  const [minRes, setMinRes] = useState(32);
  const [maxZoom, setmaxZoom] = useState(1);

  const [biggyChance, setBiggyChance] = useState(0);
  const [biggyMin, setBiggyMin] = useState(0);
  const [biggyMax, setBiggyMax] = useState(0);

  const [zoomChance, setzoomChance] = useState(0);
  const [tileWidth, setTileWidth] = useState(32);
  const [tileHeight, setTileHeight] = useState(32);

  const [hueType, setHueType] = useState("huenone");
  const [hueStep, setHueStep] = useState(1);
  const [patternType, setPatternType] = useState("single");
  const [zoomType, setZoomType] = useState("fixed");
  const [caRule, setCaRule] = useState(1);

  const zipImages = () => {
    const zip = require("jszip")();
    let files = imagesNames.map((item, i) => item["fileName"]);
    for (let file = 0; file < files.length; file++) {
      // Zip file with the file name.
      zip.file(files[file], files[file]);
    }
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, `${walletAddress}.zip`);
    });
  };

  const changeThumbSize = (size) => {
    console.log(size);
    const timing = getComputedStyle(document.documentElement).getPropertyValue(
      "--thumb-value"
    );
    console.log("timig", timing);
    // console.log("timig",`${size}px !important`)
    setThumbSize(size);
    document.documentElement.style.setProperty(
      "--thumb-value",
      size + "px",
      "important"
    );
    document.documentElement.style.setProperty(
      "--icon-value",
      size / 2 + "px",
      "important"
    );
  };

  const onPickImages = (e) => {
    console.log("picked",e)
    // console.log(e.map((item) => item["src"]))
    setImages(e.map((item) => item["src"]));
    setSelectedIds(e.map((item) => item["value"]));
    console.log(images);
    console.log(selectedIds);
    // setImages({e})
  };

  async function signIn() {
    if (typeof window.web3 !== "undefined") {
      // Use existing gateway
      window.web3 = new Web3(window.ethereum);
    } else {
      alert("No Ethereum interface injected into browser. Read-only access");
    }

    window.ethereum
      .enable()
      .then(function (accounts) {
        window.web3.eth.net.getNetworkType().then((network) => {
          console.log(network);
          if (network != "main") {
            alert(
              "You are on " +
                network +
                " network. Change network to mainnet or you won't be able to do shit here"
            );
          }
        });
        let wallet = accounts[0];
        setWalletAddress(wallet);
        setSignedIn(true);
      })
      .catch(function (error) {
        // Handle error. Likely the user rejected the login
        console.error(error);
      });
  }

  //

  async function signOut() {
    setSignedIn(false);
  }

  const getGlicpix = async () => {
    const web3infura = new Web3(new Web3.providers.HttpProvider(apiUrl));
    // console.log(web3infura);
    const batchercontract = new web3infura.eth.Contract(
      BATCHER_ABI,
      BATCHER_ADDRESS
    );
    // console.log(batchercontract);
    // const walletAddress2 = "0xe49381184a49cd2a48e4b09a979524e672fdd10e"
    const glicpixxxaddress = "0x1c60841b70821dca733c9b1a26dbe1a33338bd43";
    const bganpunksv2address = "0x31385d3520bced94f77aae104b406994d8f2168c"
    const berketh = "0xc5E08104c19DAfd00Fe40737490Da9552Db5bfE5";
    
    let tokensOfOwner = await batchercontract.methods
      .getIds(glicpixxxaddress, walletAddress)
      .call();
    // let bastardsOfOwner = await batchercontract.methods
    //   .getIds(bganpunksv2address, berketh)
    //   .call();
    // console.log("bastards",bastardsOfOwner)

    // console.log(tokensOfOwner);

    if (tokensOfOwner.length == 0) {
      alert(`NO GLICPIX IN WALLET ${walletAddress}`);
    } else {
      let sorted = tokensOfOwner.slice().sort(function (a, b) {
        return Number(a) - Number(b);
      }); // SORTS BY ID
      // console.log(sorted)
      const tx1text = sorted.join(",");
      // console.log(tx1text);

      const res = await fetch(
        `https://api.glicpixxx.love/ver002/multiple/${tx1text}`,
        {
          method: "GET",
        }
      ).then((r) => r.json());
      // const result = await res.json()
      console.log(res);
      setWalletGLICPIX(res);
      getFiles(res);
    }
  };

  const getAllGlicpix = async () => {
    const res = await fetch(`https://api.glicpixxx.love/ver002/all`, {
      method: "GET",
    }).then((r) => r.json());
    // const result = await res.json()
    // console.log(res)
    setWalletGLICPIX(res);
    getFiles(res);
  };

  const getFiles = (walletGLICPIX) => {
    let images = [];
    let imagesNames = [];
    const zeroPad = (num, places) => String(num).padStart(places, "0");

    walletGLICPIX.map((g) => {
      let type = g["attributes"][2]["value"];
      // console.log(type)
      if (type === "BOOMER CALM AF") {
        let fileName = `/imagesource/boomer_calm_af/${g["fileName"]}`;
        let tokenId = g["tokenId"].toString();

        images.push(fileName);
        imagesNames.push({ tokenId: tokenId, fileName: fileName });
      } else if (type === "BOOMER HYPED AF") {
        g["frame_order"].split(",").map((f, index) => {
          let fileName = `/imagesource/boomer_hyped_af/${g["fileName"].slice(
            0,
            -4
          )}/${f.replace(/ /g, "")}`;
          let tokenId = `${g["tokenId"]}_frame_${index}`;

          images.push(fileName);
          imagesNames.push({ tokenId: tokenId, fileName: fileName });
        });
      } else if (type === "BASTARD CALM AF") {
        let fileName = `/imagesource/bastard_calm_af/${g["fileName"]}`;
        let tokenId = g["tokenId"].toString();

        images.push(fileName);
        imagesNames.push({ tokenId: tokenId, fileName: fileName });
      } else if (type === "BASTARD HYPED AF") {
        for (let i = 0; i < 100; i++) {
          let name = `${g["fileName"].split("-")[0]}-gen${zeroPad(i, 2)}`;

          let fileName = `/imagesource/bastard_hyped_af/${g["fileName"].slice(
            0,
            -4
          )}/${name}.png`;
          let tokenId = `${g["tokenId"]}_frame_${zeroPad(i, 2)}`;

          images.push(fileName);
          imagesNames.push({ tokenId: tokenId, fileName: fileName });
        }
      }
    });
    images.push("/calms2/00001.png","/calms2/00002.png","/calms2/00003.png","/calms2/00004.png","/calms2/00005.png","/calms2/00008.png","/calms2/00009.png","/calms2/00010.png","/calms2/00011.png")
    imagesNames.push({ tokenId: "bgan1", fileName: "/calms2/00001.png" },{ tokenId: "bgan2", fileName: "/calms2/00002.png"},{ tokenId: "bgan3", fileName: "/calms2/00003.png"},{ tokenId: "bgan4", fileName: "/calms2/00004.png" },{ tokenId: "bgan5", fileName: "/calms2/00005.png" },{ tokenId: "bgan8", fileName: "/calms2/00008.png" },{ tokenId: "bgan9", fileName: "/calms2/00009.png" },{ tokenId: "bgan10", fileName: "/calms2/00010.png" },{ tokenId: "bgan11", fileName: "/calms2/00011.png" });

    // console.log(images)
    setWalletImages(images);
    console.log("imagesNames", imagesNames);
    setImagesNames(imagesNames);
  };

  // const sortShit = (e) => {
  //   if (e === "id-ascending") {

  //   } else if (e === "id-descending") {

  //   } else if (e === "color") {

  //   }

  // }



  useEffect(async () => {
    // getGlicpix();
  }, []);

  return (
    <div className="source-code flex flex-col min-h-screen text-black">
      <main className="w-full">
        <div className="px-2 py-2 bg-pink-300 ">
          <h1 className="font-bold text-3xl my-2 text-center">
            GLICPIXXX ARTSY FART PATTERN GENERATOR
          </h1>
          <h1 className="font-bold text-lg my-2 text-center">v69.420</h1>
        </div>
        <div className="px-6 bg-yellow-300 py-4 text-center">
          <a
            className="font-bold text-lg my-2 underline "
            target="_blank"
            href="https://github.com/vortextemporum/glicpixxx-pattern-generator"
          >
            SOURCE CODE ON GITHUB
          </a>
          {/* <h1 className="font-bold text-sm my-2 underline">
            Last update: Better looking webpage - hue shift option
          </h1> */}
        </div>

        <div className="flex flex-col flex-wrap bg-green-400 px-6 py-2">
          <p className="font-bold text-lg my-2">
            ENTER AN ETHEREUM ADDRESS BELOW, DEFAULT WALLET BELOW IS BERK'S
            GLICPIXYZ.ETH VAULT.
          </p>

          <input
            type="text"
            className="text-xl p-2 my-2 text-black text-center font-bold box-shadow-black border-2 border-black"
            value={walletAddress}
            placeholder="Enter Wallet Address"
            onChange={(e) => setWalletAddress(e.target.value)}
          />
          {/* <div className="flex auth text-lg text-black justify-center">
            {!signedIn ? (
              <button
                onClick={signIn}
                className="inline-block border-2 border-black box-shadow-black bg-white border-opacity-100 no-underline hover:text-black py-2 px-4 shadow-lg hover:bg-blue-500 hover:text-gray-100 font-bold"
              >
                Click to Connect Wallet with Metamask
              </button>
            ) : (
              <button
                onClick={signOut}
                className="inline-block border-2 border-black bg-white border-opacity-100 no-underline hover:text-black py-2 px-4 mx-4 shadow-lg hover:bg-blue-500 hover:text-gray-100 font-bold"
              >
                Wallet Connected: {walletAddress}
              </button>
            )}
          </div> */}

          <button
            className="bg-white box-shadow-black my-2 py-2 text-lg font-bold text-black border-2 border-black hover:bg-black hover:text-white hover:border-white"
            onClick={() => {
              getGlicpix();
            }}
          >
            {" "}
            Click Here to Load GLICPIXXXVER002 in {walletAddress}{" "}
          </button>
          {imagesNames.length > 0 ? (
            <button
              className="bg-white my-2 py-2 text-lg font-bold text-black border-2 border-black hover:bg-black hover:text-white hover:border-white box-shadow-black"
              onClick={() => {
                zipImages();
              }}
            >
              {" "}
              DOWNLOAD WALLET GLICPIXXX AS ZIP FILE
            </button>
          ) : (
            <></>
          )}
          {/* <button
            className="bg-white box-shadow-black my-2 py-2 px-2 text-md font-bold text-black border-2 border-black hover:bg-black hover:text-white hover:border-white"
            onClick={() => {
              getAllGlicpix();
            }}
          >
            {" "}
            Or Click Here to Load Every GLICPIXXXVER002 in Existence (warning,
            loading may take super long and it may crash your browser and server
            may not respond lol){" "}
          </button> */}
        </div>

        <div className="bg-purple-200">
          <p className="font-bold text-lg py-2 px-6">
            p.s: FEEL FREE TO DONATE SOME GLICPIXXXVER002 TO{" "}
            <a
              className="underline text-red-500"
              target="_blank"
              href="https://app.ens.domains/name/glicpixyz.eth/details"
            >
              GLICPIXYZ.ETH VAULT
            </a>{" "}
            . THE GLICPIXXX IN IT ARE FREE TO USE BY ANYONE FOR ANYTHING, AND
            THEY WILL BE MY COMPANY ASSET FOR TEXTILE DESIGN, VIDEOGAMES, ART
            ETCETERA.
          </p>
        </div>

        <div className="bg-black text-white space-y-2">
          <p className="font-bold text-2xl text-center py-2 px-6 ">
            MANUALLY CHOOSE GLICPIXXX:
          </p>

          <div className="flex justify-center space-x-4">
            <p>THUMBNAIL SIZE:</p>
            <input
              className="block bg-white border border-gray-400 hover:border-gray-500 text-center rounded shadow leading-tight font-bold text-black"
              onChange={(e) => changeThumbSize(e.target.value)}
              type="number"
              min={32}
              max={128}
              value={thumbSize}
            />
            <p>
              <input
                type="range"
                name="size"
                min="32"
                max="128"
                defaultValue="64"
                onChange={(e) => changeThumbSize(e.target.value)}
              />
            </p>
          </div>
          {/* <div className="flex justify-center space-x-4">
            <p className="font-bold">SORT BY:</p>

            <select
              className="block bg-white border border-gray-400 hover:border-gray-500 text-center rounded shadow leading-tight font-bold text-black"
              onChange={(e) => setZoomType(e.target.value)}
            >
              <option name="zoomType" value="fixed">
                GLICPIXXX ID
              </option>
              <option name="zoomType" value="spread">
                COLOR
              </option>
            </select>
          </div> */}
        </div>

        <div className="bg-black py-4 flex justify-center">
          <ImagePicker
            images={imagesNames.map((item, i) => ({
              src: item["fileName"],
              value: item["tokenId"],
            }))}
            onPick={(e) => onPickImages(e)}
            multiple
          />
        </div>
        <div className="bg-pink-300 py-6 px-6">
        {/*   <div className="flex items-center text-sm my-1 space-x-4">
          <p className=" font-bold">GO YOLO RANDOM:</p>
          <input
            className="block bg-white border border-gray-400 hover:border-gray-500 text-center rounded shadow leading-tight font-bold text-black"
            onChange={(e) => setzoomChance(e.target.value)}
            type="number"
            min={0}
            max={100}
            step={10}
            value={zoomChance}
          />
          <p>
            <input
              type="range"
              name="size"
              min="0"
              max="100"
              defaultValue="0"
              onChange={(e) => setzoomChance(e.target.value)}
            />
          </p>
        </div> */}
          <p className="text-xl font-bold p-2">
            SELECTED GLICPIXXX:
            {/* SELECTED IDS: {selectedIds.join(", ")} */}
          </p>

          <div className="flex flex-wrap justify-center items-center space-x-4 space-y-2">
            {/* <img src={walletImages[0]} /> */}
            {images.map((item, idx) => {
              console.log(item);

              return (
                <div className="p-2 border-2 border-black bg-white">
                  <span>{selectedIds[idx]}</span>
                  <img key={idx} src={item} width={"64px"} />
                </div>
              );
            })}
          </div>

          {/* {images.map((item, i) => {
            <img key={i} src={item} />;
          })} */}
        </div>

        {/* <button className="bg-white  p-4 my-8 text-4xl text-black border-4 border-white hover:border-black" onClick={() => { } }> Deselect all images </button> */}
      </main>

      <div className="flex flex-col border-2  p-4 bg-yellow-300">

        <p className="font-bold text-center mb-2">PARAMETERS</p>

        <div className="flex items-center text-sm my-1 space-x-4">
          <p className="font-bold mr-2">TILE WIDTH:</p>
          <input
            className="block bg-white border border-gray-400 hover:border-gray-500 text-center rounded shadow leading-tight font-bold text-black"
            onChange={(e) => setTileWidth(e.target.value)}
            type="number"
            min={1}
            max={256}
            value={tileWidth}
          />
          <p>
            <input
              type="range"
              name="size"
              min="1"
              max="256"
              defaultValue="32"
              onChange={(e) => setTileWidth(e.target.value)}
            />
          </p>
        </div>

        <div className="flex items-center text-sm my-1 space-x-4">
          <p className=" font-bold">TILE HEIGHT:</p>
          <input
            className="block bg-white border border-gray-400 hover:border-gray-500 text-center rounded shadow leading-tight font-bold text-black"
            onChange={(e) => setTileHeight(e.target.value)}
            type="number"
            min={1}
            max={256}
            value={tileHeight}
          />
          <p>
            <input
              type="range"
              name="size"
              min="1"
              max="256"
              defaultValue="32"
              onChange={(e) => setTileHeight(e.target.value)}
            />
          </p>
        </div>

        <div className="flex items-center text-sm my-1 space-x-4">
          <p className=" font-bold">ZOOM CHANCE:</p>
          <input
            className="block bg-white border border-gray-400 hover:border-gray-500 text-center rounded shadow leading-tight font-bold text-black"
            onChange={(e) => setzoomChance(e.target.value)}
            type="number"
            min={0}
            max={100}
            step={10}
            value={zoomChance}
          />
          <p>
            <input
              type="range"
              name="size"
              min="0"
              max="100"
              defaultValue="0"
              onChange={(e) => setzoomChance(e.target.value)}
            />
          </p>
        </div>
        <div className="flex items-center text-sm my-1 space-x-4">
          <p className="font-bold">MAX ZOOM:</p>
          <input
            className="block bg-white border border-gray-400 hover:border-gray-500 text-center rounded shadow leading-tight font-bold text-black"
            onChange={(e) => setmaxZoom(e.target.value)}
            type="number"
            min={1}
            max={16}
            value={maxZoom}
          />
          <p>
            <input
              type="range"
              name="size"
              min="1"
              max="16"
              defaultValue="1"
              onChange={(e) => setmaxZoom(e.target.value)}
            />
          </p>
        </div>

        <div className="flex items-center text-sm my-1">
          <p className="font-bold mr-2">ZOOM TYPE:</p>

          <select
            className="block bg-white border border-gray-400 hover:border-gray-500 text-center rounded shadow leading-tight font-bold text-black"
            onChange={(e) => setZoomType(e.target.value)}
          >
            <option name="zoomType" value="fixed">
              FIXED
            </option>
            <option name="zoomType" value="spread">
              SPREAD
            </option>
            <option name="zoomType" value="spreadxy">
              SPREADXY
            </option>
            <option name="zoomType" value="best">
              BEST
            </option>
            <option name="zoomType" value="best2">
              BEST2
            </option>
            <option name="zoomType" value="best3">
              BEST3
            </option>
          </select>
        </div>

        <div className="flex items-center text-sm my-1 space-x-4">
          <p className=" font-bold">BIGGY CHANCE:</p>
          <input
            className="block bg-white border border-gray-400 hover:border-gray-500 text-center rounded shadow leading-tight font-bold text-black"
            onChange={(e) => setBiggyChance(e.target.value)}
            type="number"
            min={0}
            max={100}
            step={1}
            value={biggyChance}
          />
          <p>
            <input
              type="range"
              name="size"
              min="0"
              max="100"
              defaultValue="0"
              onChange={(e) => setBiggyChance(e.target.value)}
            />
          </p>
        </div>
        {/* <div className="flex items-center text-sm my-1 space-x-4">
          <p className="font-bold">BIGGY MIN:</p>
          <input
            className="block bg-white border border-gray-400 hover:border-gray-500 text-center rounded shadow leading-tight font-bold text-black"
            onChange={(e) => setBiggyMin(e.target.value)}
            type="number"
            min={1}
            max={16}
            value={biggyMin}
          />
          <p>
            <input
              type="range"
              name="size"
              min="1"
              max="16"
              defaultValue="1"
              onChange={(e) => setBiggyMin(e.target.value)}
            />
          </p>
        </div> */}
        <div className="flex items-center text-sm my-1 space-x-4">
          <p className="font-bold">BIGGY MAX:</p>
          <input
            className="block bg-white border border-gray-400 hover:border-gray-500 text-center rounded shadow leading-tight font-bold text-black"
            onChange={(e) => setBiggyMax(e.target.value)}
            type="number"
            min={1}
            max={16}
            value={biggyMax}
          />
          <p>
            <input
              type="range"
              name="size"
              min="1"
              max="16"
              defaultValue="1"
              onChange={(e) => setBiggyMax(e.target.value)}
            />
          </p>
        </div>

        <div className="flex items-center text-sm my-1">
          <p className="font-bold mr-2">IMAGE PATTERN TYPE:</p>

          <select
            className="block bg-white border border-gray-400 hover:border-gray-500 text-center rounded shadow leading-tight font-bold text-black"
            onChange={(e) => setPatternType(e.target.value)}
          >
            <option name="imagePat" value="single">
              SINGLE
            </option>
            <option name="imagePat" value="rand">
              RANDOM
            </option>
            <option name="imagePat" value="randcol">
              RANDOM COLUMN
            </option>
            <option name="imagePat" value="randrow">
              RANDOM ROW
            </option>
            <option name="imagePat" value="seq">
              SEQ
            </option>
            <option name="imagePat" value="seqPalindrome">
              SEQ PALINDROME
            </option>
            <option name="imagePat" value="seqcol">
              SEQ COLUMN
            </option>
            <option name="imagePat" value="seqrow">
              SEQ ROW
            </option>
            <option name="imagePat" value="ca">
              CELLULAR AUTOMATA
            </option>
            <option name="imagePat" value="drunk">
              DRUNK
            </option>
          </select>
        </div>
        {patternType === "ca" ? (
          <div className="flex items-center text-sm my-1">
            <p className="font-bold mr-2">CA RULE:</p>
            <input
              className="block bg-white border border-gray-400 hover:border-gray-500 text-center rounded shadow leading-tight font-bold text-black"
              onChange={(e) => setCaRule(e.target.value)}
              type="number"
              min={1}
              max={256}
              value={caRule}
            />
            <p>
              <input
                type="range"
                name="size"
                min="1"
                max="256"
                defaultValue="1"
                onChange={(e) => setCaRule(e.target.value)}
              />
            </p>
          </div>
        ) : (
          <></>
        )}
        <div className="flex items-center text-sm my-1">
          <p className="font-bold mr-2">HUE SHIFT:</p>

          <select
            className="block bg-white border border-gray-400 hover:border-gray-500 text-center rounded shadow leading-tight font-bold text-black"
            onChange={(e) => setHueType(e.target.value)}
          >
            <option name="hue" value="huenone">
              NONE
            </option>
            <option name="hue" value="hueglic">
              PER GLICPIXXX
            </option>
            <option name="hue" value="huegrid">
              EVERY TILE
            </option>
            <option name="hue" value="hueseq">
              STEP
            </option>
          </select>

          {hueType === "hueseq" ? (
            <div className="flex items-center text-sm my-1">
              <p className="font-bold mr-2">HUE STEP</p>
              <input
                className="block bg-white border border-gray-400 hover:border-gray-500 text-center rounded shadow leading-tight font-bold text-black"
                onChange={(e) => setHueStep(e.target.value)}
                type="number"
                min={1}
                max={360}
                value={hueStep}
              />
              <p>
                <input
                  type="range"
                  name="size"
                  min="1"
                  max="360"
                  defaultValue="1"
                  onChange={(e) => setHueStep(e.target.value)}
                />
              </p>
            </div>
          ) : (
            <></>
          )}
        </div>

        <button
          id="generatebutton"
          className="bg-black text-white hover:bg-white hover:text-black p-2 my-2 text-xl border-4 border-white hover:border-black"
        >
          {" "}
          GENERATE PATTERN
        </button>
        <button
          id="saveimage"
          className="bg-black text-white hover:bg-white hover:text-black p-2 mt-2 text-xl border-4 border-white hover:border-black"
        >
          {" "}
          SAVE IMAGE
        </button>
      </div>

      <div className="">
        {images.length > 0 ? (
          <div className="overflow-auto">
            <ReactP5Wrapper
              sketch={sketch}
              filenames={images}
              minRes={minRes}
              tileWidth={tileWidth}
              tileHeight={tileHeight}
              patternType={patternType}
              caRule={caRule}
              hueType={hueType}
              zoomChance={zoomChance}
              maxZoom={maxZoom}
              zoomType={zoomType}
              hueStep={hueStep}
              biggyChance={biggyChance}
              biggyMin={biggyMin}
              biggyMax={biggyMax}
            />
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
