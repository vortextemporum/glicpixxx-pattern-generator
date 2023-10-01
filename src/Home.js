import { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import { apiUrl, BATCHER_ADDRESS, BATCHER_ABI } from "./config";
import Web3 from "web3";


import ImagePicker from "react-image-picker";
import "react-image-picker/dist/index.css";

import { ReactP5Wrapper } from "react-p5-wrapper";
import sketch from "./sketch.js";

var sample = require("@stdlib/random-sample");

// BACKGROUND SKETCH

export default function Home() {
  const [signedIn, setSignedIn] = useState(false);
  const [done, setDone] = useState(false);
  const [manualopen, setmanualopen] = useState(false);

  const [walletAddress, setWalletAddress] = useState(
    "0xe49381184a49cd2a48e4b09a979524e672fdd10e"
  );
  const [walletAddress2, setWalletAddress2] = useState(
    "0xc5E08104c19DAfd00Fe40737490Da9552Db5bfE5"
  );
  const [walletBGAN, setWalletBGAN] = useState([]);
  const [walletGLICPIX, setWalletGLICPIX] = useState([]);
  const [walletImagesGlicpix, setWalletImagesGlicpix] = useState([]);
  const [walletImagesBGAN, setWalletImagesBGAN] = useState([]);
  const [imagesNamesGlicpix, setImagesNamesGlicpix] = useState([]);
  const [imagesNamesBGAN, setImagesNamesBGAN] = useState([]);
  const [thumbSize, setThumbSize] = useState(64);

  const [randomGlicpixAmount, setRandomGlicpixAmount] = useState(1);
  const [randomBGANAmount, setRandomBGANAmount] = useState(1);

  const [images, setImages] = useState([]);
  const [imagesGlicpix, setImagesGlicpix] = useState([]);
  const [imagesBGAN, setImagesBGAN] = useState([]);

  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedIdsBGAN, setSelectedIdsBGAN] = useState([]);
  const [selectedIdsGlicpix, setSelectedIdsGlicpix] = useState([]);

  const [minRes, setMinRes] = useState(32);

  const [glixbganweight, setglixbganweight] = useState(0.5);

  const [zoomChance, setzoomChance] = useState(0);
  const [maxZoom, setmaxZoom] = useState(4);

  const [biggyChance, setBiggyChance] = useState(0);
  // const [biggyMin, setBiggyMin] = useState(0);
  const [biggyMax, setBiggyMax] = useState(8);

  const [tileWidth, setTileWidth] = useState(32);
  const [tileHeight, setTileHeight] = useState(32);

  const [hueType, setHueType] = useState("huenone");
  const [hueStep, setHueStep] = useState(1);
  const [patternType, setPatternType] = useState("single");
  const [zoomType, setZoomType] = useState("best3");
  const [caRule, setCaRule] = useState(1);

  const paraminit = {
    filenames:[],
    minRes:32,
    tileWidth:32,
    tileHeight:32,
    patternType:"single",
    caRule:0,
    hueType:"huenone",
    zoomChance:0,
    maxZoom:4,
    zoomType:"best3",
    hueStep:1,
    biggyChance:0,
    biggyMax:8,
    glixbganweight:0.5,
  }

  const [params, setParams] = useState(paraminit)
  const [paramsPassed, setParamsPassed] = useState(params)

  

  const zipImages = async (col) => {
    const zip = require("jszip")();
    if (col === "glix") {
      const JSZipUtils = require("jszip-utils");

      let files = imagesNamesGlicpix.map((item, i) => item["fileName"]);
      for (let file = 0; file < files.length; file++) {
        // Zip file with the file name.
        // console.log(files[file]);
        await JSZipUtils.getBinaryContent(files[file], function (err, data) {
          if (err) {
            throw err; // or handle the error
          }
          console.log(data);
          zip.file(files[file], data, {
            createFolders: false, // default value
          });
        });
        // zip.file(files[file], files[file]);
      }
      zip.generateAsync({ type: "blob" }).then((content) => {
        saveAs(content, `glicpixxx_${walletAddress}.zip`);
      });
    } else if (col === "bgan") {
      let files = imagesNamesBGAN.map((item, i) => item["fileName"]);
      for (let file = 0; file < files.length; file++) {
        // Zip file with the file name.
        zip.file(files[file], files[file]);
      }
      zip.generateAsync({ type: "blob" }).then((content) => {
        saveAs(content, `bgan_${walletAddress2}.zip`);
      });
    }
  };

  const changeThumbSize = (size) => {
    // console.log(size);
    const timing = getComputedStyle(document.documentElement).getPropertyValue(
      "--thumb-value"
    );
    // console.log("timig", timing);
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

  const onPickImages = (e, collection) => {
    // console.log("picked", e);
    // console.log(e.map((item) => item["src"]))
    let imageList = e.map((item) => item["src"]);
    let idList = e.map((item) => item["value"]);
    if (collection === "glix") {
      setImagesGlicpix(imageList);
      setSelectedIdsGlicpix(idList);
      let arr1 = [...imageList, ...imagesBGAN];
      let arr2 = [...idList, ...selectedIdsBGAN];
      setImages(arr1);
      setParams(params => ({...params, filenames: arr1}))

      setSelectedIds(arr2);
    } else if (collection === "bgan") {
      setImagesBGAN(imageList);
      setSelectedIdsBGAN(idList);
      let arr1 = [...imageList, ...imagesGlicpix];
      let arr2 = [...idList, ...selectedIdsGlicpix];
      setImages(arr1);
      setParams(params => ({...params, filenames: arr1}))

      setSelectedIds(arr2);
    }

    // setImages(e.map((item) => item["src"]));
    // setSelectedIds(e.map((item) => item["value"]));
    // console.log(images);
    // console.log(selectedIds);
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

    const batchercontract = new web3infura.eth.Contract(
      BATCHER_ABI,
      BATCHER_ADDRESS
    );

    const glicpixxxaddress = "0x1c60841b70821dca733c9b1a26dbe1a33338bd43";

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

      const tx1text = sorted.join(",");

      const res = await fetch(
        `https://api.glicpixxx.love/ver002/multiple/${tx1text}`,
        {
          method: "GET",
        }
      ).then((r) => r.json());
      // const result = await res.json()
      setWalletGLICPIX(res);
      getGlicpixFiles(res);
    }
  };

  const getBGAN = async () => {
    const web3infura = new Web3(new Web3.providers.HttpProvider(apiUrl));
    // console.log(web3infura);
    const batchercontract = new web3infura.eth.Contract(
      BATCHER_ABI,
      BATCHER_ADDRESS
    );

    const bganpunksv2address = "0x31385d3520bced94f77aae104b406994d8f2168c";

    let tokensOfOwner = await batchercontract.methods
      .getIds(bganpunksv2address, walletAddress2)
      .call();

    if (tokensOfOwner.length == 0) {
      alert(`NO BGANV2 IN WALLET ${walletAddress2}`);
    } else {
      let sorted = tokensOfOwner.slice().sort(function (a, b) {
        return Number(a) - Number(b);
      }); // SORTS BY ID

      const tx1text = sorted.join(",");

      const res = await fetch(
        `https://api.bastardganpunks.club/multiple/${tx1text}`,
        {
          method: "GET",
        }
      ).then((r) => r.json());
      console.log(res);
      // const result = await res.json()
      await setWalletBGAN(res);
      await getBGANFiles(res);
    }
  };

  const getAllGlicpix = async () => {
    const res = await fetch(`https://api.glicpixxx.love/ver002/all`, {
      method: "GET",
    }).then((r) => r.json());
    // const result = await res.json()
    // console.log(res)
    setWalletGLICPIX(res);
    getGlicpixFiles(res);
  };

  const getGlicpixFiles = async (walletGLICPIX) => {
    let images = [];
    let imagesNames = [];
    const zeroPad = (num, places) => String(num).padStart(places, "0");

    walletGLICPIX.map((g) => {
      let type = g["attributes"][2]["value"];
      // console.log(type)
      if (type === "BOOMER CALM AF") {
        let fileName = `https://storage.googleapis.com/glixbgan/imagesource/glicpix/boomer_calm_af/${g["fileName"]}`;
        let tokenId = `glicpix_${g["tokenId"].toString()}`;

        images.push(fileName);
        imagesNames.push({ tokenId: tokenId, fileName: fileName });
        // getBase64(fileName)
      } else if (type === "BOOMER HYPED AF") {
        g["frame_order"].split(",").map((f, index) => {
          let fileName = `https://storage.googleapis.com/glixbgan/imagesource/glicpix/boomer_hyped_af/${g[
            "fileName"
          ].slice(0, -4)}/${f.replace(/ /g, "")}`;
          let tokenId = `glicpix_${g["tokenId"]}_frame_${index}`;

          images.push(fileName);
          imagesNames.push({ tokenId: tokenId, fileName: fileName });
        });
      } else if (type === "BASTARD CALM AF") {
        let fileName = `https://storage.googleapis.com/glixbgan/imagesource/glicpix/bastard_calm_af/${g["fileName"]}`;
        let tokenId = `glicpix_${g["tokenId"].toString()}`;

        images.push(fileName);
        imagesNames.push({ tokenId: tokenId, fileName: fileName });
      } else if (type === "BASTARD HYPED AF") {
        for (let i = 0; i < 100; i++) {
          let name = `${g["fileName"].split("-")[0]}-gen${zeroPad(i, 2)}`;

          let fileName = `https://storage.googleapis.com/glixbgan/imagesource/glicpix/bastard_hyped_af/${g[
            "fileName"
          ].slice(0, -4)}/${name}.png`;
          let tokenId = `glicpix_${g["tokenId"]}_frame_${zeroPad(i, 2)}`;

          images.push(fileName);
          imagesNames.push({ tokenId: tokenId, fileName: fileName });
        }
      }
    });
    // images.push("/calms2/00001.png","/calms2/00002.png","/calms2/00003.png","/calms2/00004.png","/calms2/00005.png","/calms2/00008.png","/calms2/00009.png","/calms2/00010.png","/calms2/00011.png")
    // imagesNames.push({ tokenId: "bgan1", fileName: "/calms2/00001.png" },{ tokenId: "bgan2", fileName: "/calms2/00002.png"},{ tokenId: "bgan3", fileName: "/calms2/00003.png"},{ tokenId: "bgan4", fileName: "/calms2/00004.png" },{ tokenId: "bgan5", fileName: "/calms2/00005.png" },{ tokenId: "bgan8", fileName: "/calms2/00008.png" },{ tokenId: "bgan9", fileName: "/calms2/00009.png" },{ tokenId: "bgan10", fileName: "/calms2/00010.png" },{ tokenId: "bgan11", fileName: "/calms2/00011.png" });

    // console.log(images)
    await setWalletImagesGlicpix(images);
    // console.log("imagesNames", imagesNames);
    await setImagesNamesGlicpix(imagesNames);
  };
  const getBGANFiles = async (walletBGAN) => {
    let images2 = [];
    let imagesNames2 = [];
    const zeroPad = (num, places) => String(num).padStart(places, "0");

    walletBGAN.map((g) => {
      let type = g["attributes"][0]["value"];
      // console.log(type)
      if (type === "CALM AF (STILL)") {
        let fileName = `https://storage.googleapis.com/glixbgan/imagesource/bgan/calmaf/${zeroPad(
          g["tokenId"],
          5
        )}.png`;
        let tokenId = `bgan_${g["tokenId"].toString()}`;
        // console.log("CALM");
        images2.push(fileName);
        imagesNames2.push({ tokenId: tokenId, fileName: fileName });
      } else if (type === "HYPED AF (ANIMATED)") {
        // g["fra"]
        const frames = g["attributes"][4]["value"];
        for (let i = 0; i < frames; i++) {
          let fileName = `https://storage.googleapis.com/glixbgan/imagesource/bgan/hypedaf/${zeroPad(
            g["tokenId"],
            5
          )}/${zeroPad(i, 3)}.png`;
          let tokenId = `bgan_${g["tokenId"].toString()}_frame_${zeroPad(
            i,
            3
          )}`;

          images2.push(fileName);
          imagesNames2.push({ tokenId: tokenId, fileName: fileName });
        }
      }
    });
    // images.push("/calms2/00001.png","/calms2/00002.png","/calms2/00003.png","/calms2/00004.png","/calms2/00005.png","/calms2/00008.png","/calms2/00009.png","/calms2/00010.png","/calms2/00011.png")
    // imagesNames.push({ tokenId: "bgan1", fileName: "/calms2/00001.png" },{ tokenId: "bgan2", fileName: "/calms2/00002.png"},{ tokenId: "bgan3", fileName: "/calms2/00003.png"},{ tokenId: "bgan4", fileName: "/calms2/00004.png" },{ tokenId: "bgan5", fileName: "/calms2/00005.png" },{ tokenId: "bgan8", fileName: "/calms2/00008.png" },{ tokenId: "bgan9", fileName: "/calms2/00009.png" },{ tokenId: "bgan10", fileName: "/calms2/00010.png" },{ tokenId: "bgan11", fileName: "/calms2/00011.png" });

    // console.log(images)

    // const arr1 = await [...walletImages, ...images2]
    // const arr2 = await [...imagesNames, ...imagesNames2]
    await setWalletImagesBGAN(images2);
    await setImagesNamesBGAN(imagesNames2);
    setDone(true);
  };

  const setRandomGlicpix = (amount) => {
    let some = sample(imagesNamesGlicpix, { size: parseInt(amount) });
    // console.log(some);
    let imageList = some.map((item) => item["fileName"]);
    let idList = some.map((item) => item["tokenId"]);

    // console.log(imageList);
    setImagesGlicpix(imageList);
    setSelectedIdsGlicpix(idList);
    let arr1 = [...imageList, ...imagesBGAN];
    let arr2 = [...idList, ...selectedIdsBGAN];
    setImages(arr1);
    setParams(params => ({...params, filenames: arr1}))

    setSelectedIds(arr2);
  };
  const setRandomBGAN = (amount) => {
    let some = sample(imagesNamesBGAN, { size: parseInt(amount) });
    // console.log(some);
    let imageList = some.map((item) => item["fileName"]);
    let idList = some.map((item) => item["tokenId"]);

    // console.log(imageList);
    setImagesBGAN(imageList);
    setSelectedIdsBGAN(idList);
    let arr1 = [...imageList, ...imagesGlicpix];
    let arr2 = [...idList, ...selectedIdsGlicpix];
    setImages(arr1);
    setParams(params => ({...params, filenames: arr1}))

    setSelectedIds(arr2);
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

  function getBase64Image(img) {
    // Create an empty canvas element
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    // Copy the image contents to the canvas
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    // Get the data-URL formatted image
    // Firefox supports PNG and JPEG. You could check img.src to
    // guess the original format, but be aware the using "image/jpg"
    // will re-encode the image.
    var dataURL = canvas.toDataURL("image/png");

    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}

  function getBase64FromImageUrl(url) {
    var img = new Image();

    img.setAttribute('crossOrigin', 'anonymous');

    img.onload = function () {
        var canvas = document.createElement("canvas");
        canvas.width =this.width;
        canvas.height =this.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(this, 0, 0);

        var dataURL = canvas.toDataURL("image/png");

        alert(dataURL.replace(/^data:image\/(png|jpg);base64,/, ""));
    };

    img.src = url;
}

  function getallBase64url() {
    images.map((item,idx) => console.log("url",getBase64FromImageUrl(item)))
  }
  function getallBase64() {
    images.map((item,idx) => console.log("noturl",getBase64Image(document.getElementById("resim" + idx))))
  }

  return (
    <div className="source-code flex flex-col min-h-screen text-black">
      <main className="w-full">
        <div className="px-2 py-2 bg-pink-300 ">
          <h1 className="font-bold text-3xl my-2 text-center">
            GLICPIXXX ARTSY FART PATTERN GENERATOR
          </h1>
          <h1 className="font-bold text-lg my-2 text-center">v69.420</h1>
        </div>
        <div className="px-6 bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400 py-4 text-center">
          <p className="font-bold text-lg ">
            made by{" "}
            <a
              className="text-red-600 hover:text-white"
              target="_blank"
              href="https://github.com/vortextemporum/glicpixxx-pattern-generator"
            >
              Berk.eth aka PrincessCamel.eth aka Guerilla Pimp Minion Bastard{" "}
            </a>
          </p>
          <p className="font-bold text-lg ">
            powered by GLICPIXXXVER002 && BGANPUNKSV2
          </p>
          {/* <h1 className="font-bold text-sm my-2 underline">
            Last update: Better looking webpage - hue shift option
          </h1> */}
        </div>
        <div className="px-6 bg-yellow-300 py-4 text-center flex justify-around flex-wrap space-x-4 items-center">
          <a
            className="font-bold text-lg my-2 p-4 border-2 border-black bg-white box-shadow-black hover:border-white hover:bg-black hover:text-white"
            target="_blank"
            href="https://github.com/vortextemporum/glicpixxx-pattern-generator"
          >
            SOURCE CODE ON GITHUB
          </a>
          <a
            className="font-bold text-lg my-2 p-4 border-2 border-black bg-white box-shadow-black hover:border-white hover:bg-black hover:text-white"
            target="_blank"
            href="https://glicpixxx.love/"
          >
            GLICPIXXX
          </a>
          <a
            className="font-bold text-lg my-2 p-4 border-2 border-black bg-white box-shadow-black hover:border-white hover:bg-black hover:text-white"
            target="_blank"
            href="https://artglixxx.io/"
          >
            ARTGLIXXX
          </a>
          <a
            className="font-bold text-lg my-2 p-4 border-2 border-black bg-white box-shadow-black hover:border-white hover:bg-black hover:text-white"
            target="_blank"
            href="https://bastardganpunks.club/"
          >
            BGANPUNKSV2
          </a>
          {/* <h1 className="font-bold text-sm my-2 underline">
            Last update: Better looking webpage - hue shift option
          </h1> */}
        </div>

        <div className="flex flex-col flex-wrap bg-green-400 px-6 py-2">
          <p className="font-bold text-lg my-2">
            ENTER AN ETHEREUM ADDRESS BELOW TO FETCH GLICPIXXXVER002, DEFAULT
            WALLET BELOW IS GLICPIXYZ.ETH
          </p>

          <input
            type="text"
            className="text-xl p-2 my-2 text-black text-center font-bold box-shadow-black border-2 border-black"
            value={walletAddress}
            placeholder="Enter Wallet Address"
            onChange={(e) => setWalletAddress(e.target.value)}
          />

          <button
            className="bg-white box-shadow-black my-2 py-2 text-lg font-bold text-black border-2 border-black hover:bg-black hover:text-white hover:border-white"
            onClick={async () => {
              await getGlicpix();
            }}
          >
            {" "}
            Click Here to Load GLICPIXXXVER002 in {walletAddress}{" "}
          </button>
          {imagesNamesGlicpix.length > 0 ? (
            <button
              className="bg-white my-2 py-2 text-lg font-bold text-black border-2 border-black hover:bg-black hover:text-white hover:border-white box-shadow-black"
              onClick={() => {
                // zipImages("glix");
              }}
            >
              {" "}
              DOWNLOAD WALLET GLICPIXXX AS ZIP FILE (SOON)
            </button>
          ) : (
            <></>
          )}
        </div>
        <div className="flex flex-col flex-wrap bg-purple-400 px-6 py-2">
          <p className="font-bold text-lg my-2">
            ENTER AN ETHEREUM ADDRESS BELOW TO FETCH BGANPUNKSV2, DEFAULT WALLET
            BELOW IS BERK.ETH
          </p>
          <input
            type="text"
            className="text-xl p-2 my-2 text-black text-center font-bold box-shadow-black border-2 border-black"
            value={walletAddress2}
            placeholder="Enter Wallet Address"
            onChange={(e) => setWalletAddress2(e.target.value)}
          />

          <button
            className="bg-white box-shadow-black my-2 py-2 text-lg font-bold text-black border-2 border-black hover:bg-black hover:text-white hover:border-white"
            onClick={async () => {
              await getBGAN();
            }}
          >
            {" "}
            Click Here to Load BGANPUNKSV2 in {walletAddress2}{" "}
          </button>

          {imagesNamesBGAN.length > 0 ? (
            <button
              className="bg-white my-2 py-2 text-lg font-bold text-black border-2 border-black hover:bg-black hover:text-white hover:border-white box-shadow-black"
              onClick={() => {
                // zipImages("bgan");
              }}
            >
              {" "}
              DOWNLOAD WALLET BGAN AS ZIP FILE (SOON)
            </button>
          ) : (
            <></>
          )}
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
        <div className="w-full flex">
          <p
            className={`w-1/2 text-center py-2 px-6 cursor-pointer ${
             manualopen ? "bg-red-500 text-white underline text-2xl font-bold" : "bg-white text-black text-xl"
            }`}
            onClick={() => setmanualopen(true)}
          >
            CHOOSE MANUALLY
          </p>
          <p
            className={`  w-1/2 text-center py-2 px-6 cursor-pointer ${
              !manualopen ? "bg-red-500 text-white underline text-2xl font-bold" : "bg-white text-black text-xl"
            }`}
            onClick={() => setmanualopen(false)}
          >
            CHOOSE RANDOMLY
          </p>
        </div>

        {manualopen ? (
          <div>
            { (imagesNamesGlicpix.length > 0 || imagesNamesBGAN.length > 0) ?
            <div className="bg-black text-white space-y-2">
              <p className="font-bold text-2xl text-center py-2 px-6 ">
                CHOOSE NFTs:
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
            </div> : <></>
          }
            <div className="bg-black py-4 flex flex-wrap justify-center">
              {imagesNamesGlicpix.length > 0 ? (
                <div>
                  <p className="text-white text-2xl p-6 text-center">
                    GLICPIXXXVER002
                  </p>

                  <ImagePicker
                    images={imagesNamesGlicpix.map((item, i) => ({
                      src: item["fileName"],
                      value: item["tokenId"],
                      // isSelected: i % 2 === 0,
                    }))}
                    onPick={(e) => onPickImages(e, "glix")}
                    multiple
                  />
                </div>
              ) : (
                <></>
              )}
              {imagesNamesBGAN.length > 0 ? (
                <div>
                  <p className="text-white text-2xl p-6 text-center">
                    BASTARD GAN PUNKS V2
                  </p>
                  <ImagePicker
                    images={imagesNamesBGAN.map((item, i) => ({
                      src: item["fileName"],
                      value: item["tokenId"],
                    }))}
                    onPick={(e) => onPickImages(e, "bgan")}
                    multiple
                  />
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>
        ) : (
          <></>
        )}
        {imagesNamesGlicpix.length > 0 ? (
          <div className="bg-pink-300 py-6 px-6 flex flex-wrap items-center justify-center space-x-4">
            <p className=" font-bold text-xl ">
              RANDOMLY CHOOSE AMONGST GLICPIXXX:
            </p>
            <input
              className="block p-2 text-xl bg-white border border-gray-400 hover:border-gray-500 text-center rounded shadow leading-tight font-bold text-black"
              onChange={(e) => setRandomGlicpixAmount(e.target.value)}
              type="number"
              min={1}
              max={imagesNamesGlicpix.length}
              step={1}
              value={randomGlicpixAmount}
            />
            <p>
              <input
                type="range"
                name="size"
                min={1}
                max={50}
                defaultValue={1}
                onChange={(e) => setRandomGlicpixAmount(e.target.value)}
              />
            </p>
            <button
              className="bg-white p-2 text-lg   text-black border-4 border-white hover:border-black"
              onClick={() => setRandomGlicpix(randomGlicpixAmount)}
            >
              {" "}
              RANDOM GLICPIXXX GO BRRRR
            </button>
          </div>
        ) : (
          <></>
        )}

        {imagesNamesBGAN.length > 0 ? (
          <div className="bg-pink-300 py-6 px-6 flex flex-wrap items-center justify-center space-x-4">
            <p className=" font-bold text-xl ">RANDOMLY CHOOSE AMONGST BGAN:</p>
            <input
              className="block p-2 text-xl bg-white border border-gray-400 hover:border-gray-500 text-center rounded shadow leading-tight font-bold text-black"
              onChange={(e) => setRandomBGANAmount(e.target.value)}
              type="number"
              min={1}
              max={imagesNamesBGAN.length}
              step={1}
              value={randomBGANAmount}
            />
            <p>
              <input
                type="range"
                name="size"
                min={1}
                max={50}
                defaultValue={1}
                onChange={(e) => setRandomBGANAmount(e.target.value)}
              />
            </p>
            <button
              className="bg-white p-2 text-lg   text-black border-4 border-white hover:border-black"
              onClick={() => setRandomBGAN(randomBGANAmount)}
            >
              {" "}
              RANDOM BGAN GO BRRRR
            </button>
          </div>
        ) : (
          <></>
        )}
        {/* <p className="text-xl font-bold p-2">
          SELECTED GLICPIXXX:
        </p> */}

        <div className="flex flex-wrap justify-center items-center space-x-4 space-y-2">
          {/* <img src={walletImages[0]} /> */}
          {images.map((item, idx) => {
            // console.log(item);

            return (
              <div className="p-2 border-2 border-black bg-white">
                <span>{selectedIds[idx]}</span>
                <img id={"resim" + idx} key={item} src={item} width={"64px"} crossOrigin="true"/>
              </div>
            );
          })}
        </div>

        {/* {images.map((item, i) => {
            <img key={i} src={item} />;
          })} */}
        {/* </div> */}

        {/* <button className="bg-white  p-4 my-8 text-4xl text-black border-4 border-white hover:border-black" onClick={() => { } }> Deselect all images </button> */}
      </main>

      {/* PARAMETEEEEEEEERS */}

      <div className="flex flex-col border-2  p-4 bg-yellow-300 space-y-4">
        <p className="font-bold text-center text-2xl mb-2">PARAMETERS</p>

        <div className="flex items-center text-sm my-1 space-x-4">
          <p className="font-bold mr-2">TILE WIDTH:</p>
          <input
            className="block bg-white border border-gray-400 hover:border-gray-500 text-center rounded shadow leading-tight font-bold text-black"
            // onChange={(e) => setTileWidth(e.target.value)}
            onChange={(e) => setParams(params => ({...params, tileWidth: e.target.value}))}
            type="number"
            min={1}
            max={256}
            value={params.tileWidth}
          />
          <p>
            <input
              type="range"
              name="size"
              min="1"
              max="256"
              value={params.tileWidth}
              // onChange={(e) => setTileWidth(e.target.value)}
              onChange={(e) => setParams(params => ({...params, tileWidth: e.target.value}))}

            />
          </p>
          <form>
            <div
              className="flex space-x-2"
              // onChange={(e) => setTileWidth(e.target.value)}
              onChange={(e) => setParams(params => ({...params, tileWidth: e.target.value}))}

            >
              <input type="radio" value={32} name="gender" /> <label>32</label>
              <input type="radio" value={64} name="gender" /> <label>64</label>
              <input type="radio" value={128} name="gender" />{" "}
              <label>128</label>
              <input type="radio" value={256} name="gender" />{" "}
              <label>256</label>
            </div>
          </form>
        </div>

        <div className="flex items-center text-sm my-1 space-x-4">
          <p className=" font-bold">TILE HEIGHT:</p>
          <input
            className="block bg-white border border-gray-400 hover:border-gray-500 text-center rounded shadow leading-tight font-bold text-black"
            onChange={(e) => setParams(params => ({...params, tileHeight: e.target.value}))}

            // onChange={(e) => setTileHeight(e.target.value)}
            type="number"
            min={1}
            max={256}
            value={params.tileHeight}
          />
          <p>
            <input
              type="range"
              name="size"
              min="1"
              max="256"
              value={params.tileHeight}
              onChange={(e) => setParams(params => ({...params, tileHeight: e.target.value}))}

              // onChange={(e) => setTileHeight(e.target.value)}
            />
          </p>
          <form>
            <div
              className="flex space-x-2"
              onChange={(e) => setParams(params => ({...params, tileHeight: e.target.value}))}

              // onChange={(e) => setTileHeight(e.target.value)}
            >
              <input type="radio" value={32} name="gender" /> <label>32</label>
              <input type="radio" value={64} name="gender" /> <label>64</label>
              <input type="radio" value={128} name="gender" />{" "}
              <label>128</label>
              <input type="radio" value={256} name="gender" />{" "}
              <label>256</label>
            </div>
          </form>
        </div>

        <div className="flex flex-wrap space-x-4">
          <div className="flex items-center text-sm my-1 space-x-4">
            <p className=" font-bold">ZOOM CHANCE:</p>
            <input
              className="block bg-white border border-gray-400 hover:border-gray-500 text-center rounded shadow leading-tight font-bold text-black"
              onChange={(e) => setParams(params => ({...params, zoomChance: e.target.value}))}

              // onChange={(e) => setzoomChance(e.target.value)}
              type="number"
              min={0}
              max={100}
              step={10}
              value={params.zoomChance}
            />
            <p>
              <input
                type="range"
                name="size"
                min="0"
                max="100"
                defaultValue={params.zoomChance}
                onChange={(e) => setParams(params => ({...params, zoomChance: e.target.value}))}

                // onChange={(e) => setzoomChance(e.target.value)}
              />
            </p>
          </div>
          <div className="flex items-center text-sm my-1 space-x-4">
            <p className="font-bold">MAX ZOOM:</p>
            <input
              className="block bg-white border border-gray-400 hover:border-gray-500 text-center rounded shadow leading-tight font-bold text-black"
              // onChange={(e) => setmaxZoom(e.target.value)}
              onChange={(e) => setParams(params => ({...params, maxZoom: e.target.value}))}

              type="number"
              min={1}
              max={16}
              value={params.maxZoom}
            />
            <p>
              <input
                type="range"
                name="size"
                min="1"
                max="16"
                defaultValue="4"
                onChange={(e) => setParams(params => ({...params, maxZoom: e.target.value}))}

                // onChange={(e) => setmaxZoom(e.target.value)}
              />
            </p>
          </div>

          <div className="flex items-center text-sm my-1">
            <p className="font-bold mr-2">ZOOM TYPE:</p>

            <select
              className="block bg-white border border-gray-400 hover:border-gray-500 text-center rounded shadow leading-tight font-bold text-black"
              // onChange={(e) => setZoomType(e.target.value)}
              onChange={(e) => setParams(params => ({...params, zoomType: e.target.value}))}

              value={params.zoomType}
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
        </div>

        <div className="flex flex-wrap space-x-4">
          <div className="flex items-center text-sm my-1 space-x-4">
            <p className=" font-bold">BIGGY CHANCE:</p>
            <input
              className="block bg-white border border-gray-400 hover:border-gray-500 text-center rounded shadow leading-tight font-bold text-black"
              onChange={(e) => setParams(params => ({...params, biggyChance: e.target.value}))}

              // onChange={(e) => setBiggyChance(e.target.value)}
              type="number"
              min={0}
              max={100}
              step={1}
              value={params.biggyChance}
            />
            <p>
              <input
                type="range"
                name="size"
                min="0"
                max="100"
                defaultValue="0"
                onChange={(e) => setParams(params => ({...params, biggyChance: e.target.value}))}

                // onChange={(e) => setBiggyChance(e.target.value)}
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
              // onChange={(e) => setBiggyMax(e.target.value)}
              onChange={(e) => setParams(params => ({...params, biggyMax: e.target.value}))}

              type="number"
              min={1}
              max={16}
              value={params.biggyMax}
            />
            <p>
              <input
                type="range"
                name="size"
                min="1"
                max="16"
                defaultValue="8"
                onChange={(e) => setParams(params => ({...params, biggyMax: e.target.value}))}

                // onChange={(e) => setBiggyMax(e.target.value)}
              />
            </p>
          </div>
        </div>

        <div className="flex items-center text-sm my-1">
          <p className="font-bold mr-2">IMAGE PATTERN TYPE:</p>

          <select
            className="block bg-white border border-gray-400 hover:border-gray-500 text-center rounded shadow leading-tight font-bold text-black"
            // onChange={(e) => setPatternType(e.target.value)}
            onChange={(e) => setParams(params => ({...params, patternType: e.target.value}))}

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
        {params.patternType === "ca" ? (
          <div className="flex items-center text-sm my-1">
            <p className="font-bold mr-2">CA RULE:</p>
            <input
              className="block bg-white border border-gray-400 hover:border-gray-500 text-center rounded shadow leading-tight font-bold text-black"
              // onChange={(e) => setCaRule(e.target.value)}
              onChange={(e) => setParams(params => ({...params, caRule: e.target.value}))}

              type="number"
              min={1}
              max={256}
              value={params.caRule}
            />
            <p>
              <input
                type="range"
                name="size"
                min="1"
                max="256"
                defaultValue="1"
                onChange={(e) => setParams(params => ({...params, caRule: e.target.value}))}

                // onChange={(e) => setCaRule(e.target.value)}
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
            // onChange={(e) => setHueType(e.target.value)}
            onChange={(e) => setParams(params => ({...params, hueType: e.target.value}))}

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
                // onChange={(e) => setHueStep(e.target.value)}
                onChange={(e) => setParams(params => ({...params, hueStep: e.target.value}))}

                type="number"
                min={1}
                max={360}
                value={params.hueStep}
              />
              <p>
                <input
                  type="range"
                  name="size"
                  min="1"
                  max="360"
                  defaultValue="1"
                  onChange={(e) => setParams(params => ({...params, hueStep: e.target.value}))}

                  // onChange={(e) => setHueStep(e.target.value)}
                />
              </p>
            </div>
          ) : (
            <></>
          )}

        </div>
        <div className="flex items-center text-sm my-1 space-x-4">
          <p className=" font-bold text-base">GLICPIXXX/BGAN RATIO:</p>
          <p className=" font-bold">
            GLICPIXXX {parseFloat(params.glixbganweight).toFixed(2)}
          </p>
          {/* <input
              className="block bg-white border border-gray-400 hover:border-gray-500 text-center rounded shadow leading-tight font-bold text-black"
              onChange={(e) => setglixbganweight((e.target.value) / 100)}
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={glixbganweight}
            /> */}
          <p>
            <input
              type="range"
              name="size"
              min="0.0"
              max="1.0"
              step="0.01"
              defaultValue={glixbganweight}
              onChange={(e) => setParams(params => ({...params, glixbganweight: e.target.value}))}

              // onChange={(e) => setglixbganweight(e.target.value)}
            />
          </p>
          {/* <input
              className="block bg-white border border-gray-400 hover:border-gray-500 text-center rounded shadow leading-tight font-bold text-black"
              onChange={(e) => setglixbganweight((e.target.value) / 100)}
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={1 - glixbganweight}
            /> */}
          <p className=" font-bold">
            {(1 - params.glixbganweight).toFixed(2)} BGANPUNKSV2 - (WORKS WITH RAND RANDCOL RANDROW)
          </p>
        </div>
        <p className="font-bold mr-2">ROTATION / MIRROR TYPE: (SOON)</p>

        <div className="flex flex-wrap space-x-2 space-y-2 items-center justify-around">
         
          <button
            id=""
            className="bg-black text-white hover:bg-white hover:text-black p-2 text-xl border-4 border-white hover:border-black"
            onClick={()=> {setParamsPassed(params)}}
          >
            {" "}
            UPDATE PARAMS
          </button>
          
          <button
            id="generatebutton"
            className="bg-black text-white hover:bg-white hover:text-black p-2 text-xl border-4 border-white hover:border-black"
            // onClick={()=> {setParamsPassed(params);console.log(params,paramsPassed)}}
          >
            {" "}
            GENERATE PATTERN
          </button>
          <button
            id="saveimage"
            className="bg-black text-white hover:bg-white hover:text-black p-2 text-xl border-4 border-white hover:border-black"
          >
            {" "}
            SAVE IMAGE
          </button>
          {/* <button
            id="pixelsort"
            className="bg-black text-white hover:bg-white hover:text-black p-2 text-xl border-4 border-white hover:border-black"
          >
            {" "}
            VERTICAL PIXEL SORTING
          </button>
          <button
            id="pixelsort2"
            className="bg-black text-white hover:bg-white hover:text-black p-2 text-xl border-4 border-white hover:border-black"
          >
            {" "}
            HORIZONTAL PIXEL SORTING
          </button> */}
         
        </div>
        <p className="text-center">Until I implement it here, save your image and upload it to <a className="text-red-500 hover:text-green-800" target="_blank" href="https://timothybauman.com/pixelsorter/">https://timothybauman.com/pixelsorter/</a> to sort pixels for an even cooler result! Will focus on more post processing stuff in the future.</p>
      </div>
      

      <div className="">
        {images.length > 0 ? (
          <div className="overflow-auto">
            <ReactP5Wrapper
              sketch={sketch}
              params = {paramsPassed}
              
            />
            {/* <ReactP5Wrapper
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
              // biggyMin={biggyMin}
              biggyMax={biggyMax}
              glixbganweight={glixbganweight}
            /> */}
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
