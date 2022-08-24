// const glitch = require("p5.glitch")
const Serialism = require("total-serialism");
const Algo = Serialism.Algorithmic;
const Rand = Serialism.Stochastic;
const Gen = Serialism.Generative;

export default function sketch(p5) {
  var images = [];
  let filenames = [];
  let patternList = [];
  let glixbganweight = 0.5;

  let camel;

  var minreso = 32;
  var tilewidth = 32;
  var tileheight = 32;
  var hueType = "none";

  var maxZoom = 1; // 1-4
  var zoomChance = 0;
  var zoomType = "fixed";

  var biggyChance = 0;
  var biggyMin = 1;
  var biggyMax = 2;

  var patternType = "single";
  var caRule = 0;

  let direction = "vertical";
  let threshold = 100;
  let threshold2 = 100;
  let pixelDistance = 20;
  let pixelDistance2 = 20;

  let img;
  let changes;
  let glic;

  let ww = () => {
    return minreso * tilewidth;
  };
  let hh = () => {
    return minreso * tileheight;
  };

  function pixelate(newDensity = 1) {
    newDensity = p5.constrain(newDensity, 0.0, p5.displayDensity());
    p5.pixelDensity(newDensity);
    document.body.style.imageRendering = "pixelated";
    p5.noSmooth();
    // this.debugMsg('p5.glitch - pixelate density: ' + newDensity);
  }

  function generatePixelSort(direction, threshold, pixelDistance) {
    changes = detectPixelChanges(
      img,
      threshold,
      pixelDistance,
      direction,
      false
    );
    for (let i = 0; i < changes.length; i++) {
      if (i < changes.length - 1) {
        pixelSortTo(
          img,
          changes[i].x,
          changes[i].y,
          changes[i + 1].x,
          changes[i + 1].y,
          direction
        );
      } else {
        pixelSort(img, changes[i].x, changes[i].y, direction);
      }
    }
    img.updatePixels();
  }

  function detectPixelChanges(
    img,
    threshold,
    distance = 1,
    direction = "horizontal",
    onlyFirst = true
  ) {
    let results = [];
    direction =
      direction == "horizontal" ? p5.createVector(1, 0) : p5.createVector(0, 1);
    let pos = p5.createVector();

    for (let j = 0, lim = direction.x ? img.height : img.width; j < lim; j++) {
      for (
        let i = 0, lim = direction.x ? img.width : img.height;
        i < lim;
        i++
      ) {
        let colBefore = getPixelValue(
          img,
          direction.x ? i - distance : j,
          direction.x ? j : i - distance
        );
        if (colBefore) {
          let col = getPixelValue(
            img,
            direction.x ? i : j,
            direction.x ? j : i
          );
          let d = p5.dist(
            colBefore[0],
            colBefore[1],
            colBefore[2],
            col[0],
            col[1],
            col[2]
          );
          if (d > threshold) {
            //point(direction.x ? i : j, direction.x ? j : i);
            results.push(
              p5.createVector(direction.x ? i : j, direction.x ? j : i)
            );
            if (onlyFirst) break;
          }
        }
      }
    }
    return results;
  }

  function getPixelValue(img, x, y) {
    if (x < 0 || x > img.width - 1 || y < 0 || y > img.height - 1) return null;
    if (!img.pixels.length) img.loadPixels();
    let i = 16 * (x + y * img.width);
    let r = img.pixels[i];
    let g = img.pixels[i + 1];
    let b = img.pixels[i + 2];
    let a = img.pixels[i + 3];
    return [r, g, b, a];
  }

  function setPixelValue(img, x, y, colR, colG, colB, colA = 255) {
    if (x < 0 || x > img.width - 1 || y < 0 || y > img.height - 1) return null;
    if (!img.pixels.length) img.loadPixels();
    let i = 16 * (x + y * img.width);
    img.pixels[i] = colR;
    img.pixels[i + 1] = colG;
    img.pixels[i + 2] = colB;
    img.pixels[i + 3] = colA;
  }

  function pixelSort(img, x, y, direction) {
    direction =
      direction == "horizontal" ? p5.createVector(1, 0) : p5.createVector(0, 1);
    let pix = [];
    let start = direction.x ? x : y;
    let end = direction.x ? img.width : img.height;
    for (let i = start; i < end; i++) {
      let val = getPixelValue(img, direction.x ? i : x, direction.x ? y : i);
      pix.push(val);
    }

    pix.sort(sortFunction);
    let i = 0;
    for (let p of pix) {
      setPixelValue(
        img,
        x + direction.x * i,
        y + direction.y * i,
        p[0],
        p[1],
        p[2]
      );
      i++;
    }
  }

  function pixelSortTo(img, x1, y1, x2, y2, direction = "vertical") {
    direction =
      direction == "horizontal" ? p5.createVector(1, 0) : p5.createVector(0, 1);
    let pix = [];
    let start = direction.x ? x1 : y1;
    let end = direction.x ? img.width : img.height;
    for (let i = start; i < end; i++) {
      let x = direction.x ? i : x1;
      let y = direction.x ? y1 : i;
      if (x == x2 && y == y2) break;
      let val = getPixelValue(img, x, y);
      pix.push(val);
    }

    pix.sort(sortFunction);
    let i = 0;
    for (let p of pix) {
      setPixelValue(
        img,
        x1 + direction.x * i,
        y1 + direction.y * i,
        p[0],
        p[1],
        p[2]
      );
      i++;
    }
  }

  function sortFunction(a, b) {
    return (
      p5.brightness(p5.color(b[0], b[1], b[2])) -
      p5.brightness(p5.color(a[0], a[1], a[2]))
    );
    // return b[0] * b[1] * b[2] - a[0] * a[1] * a[2];
    return -(b[0] - a[0] + b[1] - a[1] + b[2] - a[2]);
  }

  /// HUE SHIFT START

  function hue2rgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }

  function changeHue(r, g, b, degree) {
    var hsl = rgbToHSL(r, g, b);
    hsl.h += degree;
    if (hsl.h > 360) {
      hsl.h -= 360;
    } else if (hsl.h < 0) {
      hsl.h += 360;
    }
    return hslToRGB(hsl);
  }

  // exepcts a string and returns an object
  function rgbToHSL(r, g, b) {
    var r = r / 255,
      g = g / 255,
      b = b / 255,
      cMax = Math.max(r, g, b),
      cMin = Math.min(r, g, b),
      delta = cMax - cMin,
      l = (cMax + cMin) / 2,
      h = 0,
      s = 0;

    if (delta == 0) {
      h = 0;
    } else if (cMax == r) {
      h = 60 * (((g - b) / delta) % 6);
    } else if (cMax == g) {
      h = 60 * ((b - r) / delta + 2);
    } else {
      h = 60 * ((r - g) / delta + 4);
    }

    if (delta == 0) {
      s = 0;
    } else {
      s = delta / (1 - Math.abs(2 * l - 1));
    }

    return {
      h: h,
      s: s,
      l: l,
    };
  }

  // expects an object and returns a string
  function hslToRGB(hsl) {
    var h = hsl.h,
      s = hsl.s,
      l = hsl.l,
      c = (1 - Math.abs(2 * l - 1)) * s,
      x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
      m = l - c / 2,
      r,
      g,
      b;

    if (h < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (h < 120) {
      r = x;
      g = c;
      b = 0;
    } else if (h < 180) {
      r = 0;
      g = c;
      b = x;
    } else if (h < 240) {
      r = 0;
      g = x;
      b = c;
    } else if (h < 300) {
      r = x;
      g = 0;
      b = c;
    } else {
      r = c;
      g = 0;
      b = x;
    }

    r = normalize_rgb_value(r, m);
    g = normalize_rgb_value(g, m);
    b = normalize_rgb_value(b, m);

    return [r, g, b];
  }

  function normalize_rgb_value(color, m) {
    color = Math.floor((color + m) * 255);
    if (color < 0) {
      color = 0;
    }
    return color;
  }

  p5.hueShift = (img, degree) => {
    img.loadPixels();
    for (var i = 0; i < img.pixels.length; i += 4) {
      let r = img.pixels[i];
      let g = img.pixels[i + 1];
      let b = img.pixels[i + 2];

      let hueShifted = changeHue(r, g, b, degree);

      img.pixels[i] = hueShifted[0];
      img.pixels[i + 1] = hueShifted[1];
      img.pixels[i + 2] = hueShifted[2];
    }
    img.updatePixels();
  };

  /// HUE SHIFT END

  p5.updateWithProps = (props) => {
    // console.log(props)

    // console.log("ALL PROPS", props);
    if (props.params.filenames !== filenames) {
      // console.log("FILENAMES PROP", props.params.params.filenames);
      filenames = props.params.filenames;
      p5.preload();
      // return
    }
    // if (props.params.minRes) {
    //   // console.log("FILENAMES PROP",props.params.minRes)
    //   minreso = parseInt(props.params.minRes)
    //   p5.resizeCanvas(ww(), hh());

    // }
    // if (props.params.glixbganweight !== glixbganweight) {
      glixbganweight = props.params.glixbganweight;
      // return;
    // }
    // if (props.params.tileWidth !== tilewidth) {
      tilewidth = parseInt(props.params.tileWidth);
      tileheight = parseInt(props.params.tileHeight);
      p5.resizeCanvas(ww(), hh());
      // return;
    // }
    // if (props.params.hueType !== hueType) {
      hueType = props.params.hueType;
      // return;
    // }
    // if (props.params.tileHeight !== tileheight) {
      // p5.resizeCanvas(ww(), hh());
      // return
    // }
    // if (props.params.patternType !== patternType) {
      patternType = props.params.patternType;
      // return
    // }
    // if (props.params.caRule !== caRule) {
      caRule = props.params.caRule;
      // return
    // }
    // if (props.params.zoomChance !== zoomChance) {
      zoomChance = props.params.zoomChance;
      // return
    // }
    // if (props.params.maxZoom !== maxZoom) {
      maxZoom = props.params.maxZoom;
      // console.log(maxZoom)
      // return
    // }
    // if (props.params.zoomType !== zoomType) {
      zoomType = props.params.zoomType;
      // return
    // }
    // if (props.params.biggyChance !== biggyChance) {
      biggyChance = props.params.biggyChance;
      // return
    // }
    // if (props.params.biggyMin !== biggyMin) {
      biggyMin = props.params.biggyMin;
      // return
    // }
    // if (props.params.biggyMax !== biggyMax) {
      biggyMax = props.params.biggyMax;
      // return
    // }
    // p5.redraw();
  };

  p5.preload = () => {
    images = [];
    let i = 0;
    let im;
    //   console.log(filenames)
    for (im in filenames) {
      images.push(p5.loadImage(filenames[im]));
    }
    // camel = p5.loadImage('https://berk.mypinata.cloud/ipfs/QmWKxFR8PJUL1BijXs2UyNQuNAVPMFwx5Lefr3PtmS6oK8');
    // console.log(images);
  };

  p5.setup = () => {
    var canva = p5.createCanvas(ww(), hh());
    canva.id("bgbgbg");
    var button = p5.select("#generatebutton");
    var button2 = p5.select("#saveimage");
    // var button3 = p5.select("#pixelsort");
    // var button4 = p5.select("#pixelsort2");

    // button.mousePressed(() => { var canva = p5.createCanvas(ww(), hh()); canva.id("bgbgbg"); p5.redraw()});
    button.mousePressed(() => {
      p5.redraw();
    });
    button2.mousePressed(() =>
      p5.saveCanvas(canva, `glicpixpattern_${new Date().toJSON()}`, "png")
    );
    // button3.mousePressed(() => {
    //   img.pixels = [];
    //   // console.log(img.pixels)
    //   // console.log(img.pixels)
    //   console.log(img.width, img.height);
    //   generatePixelSort("vertical", 100, 20);
    //   p5.image(img, 0, 0);
    // });
    // button4.mousePressed(() => {
    //   img.pixels = [];
    //   // console.log(img.pixels)
    //   // console.log(img.pixels)
    //   console.log(img.width, img.height);
    //   generatePixelSort("horizontal", 100, 20);
    //   p5.image(img, 0, 0);
    // });
    p5.noLoop();
    // glitch = new Glitch(p5);
    // console.log(glitch)
  };

  p5.draw = () => {
    img = p5.createGraphics(ww(), hh());
    img.noSmooth();

    if (images.length > 0) {
      p5.noSmooth();
      if (hueType === "hueglic") {
        for (let j = 0; j < images.length; j++) {
          p5.hueShift(images[j], Math.floor(Math.random() * 360));
        }
      }
      // pixelate(0.2)

      generate();
      // p5.blendMode(p5.DIFFERENCE)

      // camel.filter(p5.INVERT)
      // p5.image(camel,0,0,ww(), hh())
      // img.filter(p5.INVERT)
      // p5.image(img,0,0)
      // img.filter(p5.INVERT)
      // p5.image(camel,0,0)
      // img.tint(200,30,30);
      // img.hueShift(20);
      p5.image(img, 0, 0);
    }
  };

  function generateRotationList(patternType) {
    let rotateList = [];
    let totalTiles = tilewidth * tileheight;

    switch (patternType) {
      case "fixed":
    }
  }

  function generateImageList(patternType) {
    let imageList = [];
    let totalTiles = tilewidth * tileheight;
    // console.log("BAK", images);
    let glixx = filenames
      .map((item, idx) => {
        if (item.split("/")[4] === "glicpix") {
          return idx;
        } else {
          return null;
        }
      })
      .filter((item) => item !== null);
    // console.log("glixx",glixx);
    let bgans = filenames
      .map((item, idx) => {
        if (item.split("/")[4] === "bgan") {
          return idx;
        } else {
          return null;
        }
      })
      .filter((item) => item !== null);
    // console.log("testing", bgans);
    let splitList = { glix: glixx, bgan: bgans };
    // console.log("SPLIT", splitList);
    // console.log("bgan",bgans)
    //   console.log("PATTERN TYPE:",patternType)
    switch (patternType) {
      case "ca":
        let n1 = p5.floor(p5.random() * images.length);
        let n2 = p5.floor(p5.random() * images.length);
        while (n2 == n1) {
          n2 = p5.floor(p5.random() * images.length);
        }
        let ca = new Algo.Automaton();
        ca.feed(Rand.coin(tilewidth));
        ca.rule(caRule);
        let gens = [];
        for (let i = 0; i < tileheight; i++) {
          gens.push(ca.next());
        }
        // console.log(gens)
        imageList = gens.flat(1).map((item) => {
          if (item === 0) {
            return n1;
          } else if (item === 1) {
            return n2;
          }
        });
        break;
      case "rand":
        for (let i = 0; i < totalTiles; i++) {
          // console.log(splitList[whichList].length)
          let imm;
          if (splitList["glix"].length > 0 && splitList["bgan"].length > 0) {
            let whichList = p5.random() <= glixbganweight ? "glix" : "bgan";
            imm =
              splitList[whichList][
                p5.floor(p5.random() * splitList[whichList].length)
              ];
            imageList.push(imm);
          } else {
            imm = p5.floor(p5.random() * images.length);
            imageList.push(imm);
          }
        }
        break;
      case "randrow":
        for (var y = 0; y < tileheight; y++) {
          let rowRand;
          if (splitList["glix"].length > 0 && splitList["bgan"].length > 0) {
            let whichList = p5.random() <= glixbganweight ? "glix" : "bgan";
            rowRand =
              splitList[whichList][
                p5.floor(p5.random() * splitList[whichList].length)
              ];
          } else {
            rowRand = p5.floor(p5.random() * images.length);
          }
          for (var x = 0; x < tilewidth; x++) {
            imageList.push(rowRand);
          }
        }
        
        break;
      case "randcol":
        imageList = Array(totalTiles).fill(0);
        for (var x = 0; x < tilewidth; x++) {
          let colRand;
          if (splitList["glix"].length > 0 && splitList["bgan"].length > 0) {
            let whichList = p5.random() <= glixbganweight ? "glix" : "bgan";
            colRand =
              splitList[whichList][
                p5.floor(p5.random() * splitList[whichList].length)
              ];
          } else {
            colRand = p5.floor(p5.random() * images.length);
          }
          for (var y = 0; y < tileheight; y++) {
            imageList[tilewidth * y + x] = colRand;
          }
        }
        break;
      case "seq":
        for (let i = 0; i < totalTiles; i++) {
          imageList.push(i % images.length);
        }
        break;
      case "seqPalindrome":
        let sequence = Gen.spread(images.length).concat(
          Gen.spread(images.length).reverse()
        );
        for (let i = 0; i < totalTiles; i++) {
          imageList.push(sequence[i % sequence.length]);
        }
        break;
      case "seqrow":
        for (var y = 0; y < tileheight; y++) {
          let rowSeq = y % images.length;
          for (var x = 0; x < tilewidth; x++) {
            imageList.push(rowSeq);
          }
        }
        break;
      case "seqcol":
        imageList = Array(totalTiles).fill(0);
        for (var x = 0; x < tilewidth; x++) {
          let colSeq = x % images.length;
          for (var y = 0; y < tileheight; y++) {
            imageList[tilewidth * y + x] = colSeq;
          }
        }
        break;
      // case "euclid":
      //   imageList = Array(totalTiles).fill(0)
      //   for (var x = 0; x < tilewidth; x++) {
      //     let colSeq = x % images.length
      //     for (var y = 0; y < tileheight; y++) {
      //         imageList[ (tilewidth * y) + x ] = colSeq;
      //   }}
      //   break;
      // case "hexbeat":
      //   imageList = Array(totalTiles).fill(0)
      //   for (var x = 0; x < tilewidth; x++) {
      //     let colSeq = x % images.length
      //     for (var y = 0; y < tileheight; y++) {
      //         imageList[ (tilewidth * y) + x ] = colSeq;
      //   }}
      //   break;
      case "drunk":
        
        let nextNumber = p5.floor(p5.random() * images.length);
        for (let i = 0; i < totalTiles; i++) {
          nextNumber =
            Rand.coin(1)[0] == 1
              ? (nextNumber + 1) % images.length
              : nextNumber == 0
              ? images.length - 1
              : nextNumber - 1;

          imageList.push(nextNumber);
        }
        // console.log(imageList);
        break;
      case "single":
        let randImg = p5.floor(p5.random() * images.length);
        imageList = Array(totalTiles).fill(randImg);
        //   console.log(imageList)
        break;
      default:
        imageList = [0];
    }

    return imageList;
  }

  function generate() {
    let w = ww();
    let h = hh();
    // console.log(w,h)
    let imageList = generateImageList(patternType);
    // console.log(imageList)
    let im;
    let i = 0;
    // p5.tint(p5.random() * 255, p5.random() * 255, p5.random() * 255);
    // let huestart = Math.floor(Math.random() * 360)
    img.translate(minreso / 2, minreso / 2);

    let huestep = Math.floor(Math.random() * 360);
    for (var y = 0; y < h; y = y + minreso) {
      for (var x = 0; x < w; x = x + minreso) {
        // img.imageMode(p5.CENTER)

        // p5.push()
        im = imageList[i];
        if (hueType === "huegrid") {
          p5.hueShift(images[im], Math.floor(Math.random() * 360));
        } else if (hueType === "hueseq") {
          // huestart = (huestart + huestep) % 360
          // console.log(huestart)
          p5.hueShift(images[im], huestep);
        }
        // if (i % 2 == 0) {
        //   p5.scale(-1, 1);
        // }
        //
        img.angleMode(p5.DEGREES);

        // // p5.translate(xPosition, yPosition);
        img.imageMode(p5.CENTER);
        img.push(); // 1
        // p5.angleMode(p5.DEGREES);

        // let imageRotation = (p5.random() > 0.9) ? Math.floor(Math.random() * 360) : Math.floor(Math.random() * 4) * 90

        let imageRotation = Math.floor(Math.random() * 4) * 90;

        img.rotate(imageRotation);

        let f = Math.floor(Math.random() * 4);
        // let f = 0
        // console.log(f);

        //     // p5.push();
        switch (f) {
          case 1:
            img.scale(-1, 1);
            break;

          case 2:
            img.scale(1, -1);
            break;
          case 3:
            img.scale(-1, -1);
            break;

          // default:
          //   "lol";
        }

        // img.pop()
        // img.rotate(imageRotation * -1);

        let isZoom = img.map(Math.random(), 0, 1, 0, 100) <= zoomChance;
        if (isZoom) {
          if (zoomType === "fixed") {
            img.image(images[im], x, y, minreso * maxZoom, minreso * maxZoom);
          } else if (zoomType === "spread") {
            // let z = Math.floor(Math.random() * maxZoom) + 1
            let z = img.map(Math.random(), 0, 1, 1, maxZoom);
            img.image(images[im], 0, 0, minreso * z, minreso * z);
          } else if (zoomType === "spreadxy") {
            // img.push()

            img.image(
              images[im],
              0,
              0,
              minreso * img.map(Math.random(), 0, 1, 1, maxZoom),
              minreso * img.map(Math.random(), 0, 1, 1, maxZoom)
            );
          } else if (zoomType === "best") {
            let z = img.map(Math.random(), 0, 1, 1, maxZoom);
            let dWidth = minreso;
            let dHeight = minreso;
            let sx = img.map(Math.random(), 0, 1, 0, minreso - minreso / z);
            let sy = img.map(Math.random(), 0, 1, 0, minreso - minreso / z);
            let sWidth = minreso / z;
            let sHeight = minreso / z;
            img.image(
              images[im],
              0,
              0,
              dWidth,
              dHeight,
              sx,
              sy,
              sWidth,
              sHeight
            );
          } else if (zoomType === "best2") {
            let z = img.map(Math.random(), 0, 1, 1, maxZoom);
            // let dWidth = minreso / img.map(Math.random(), 0, 1, 1, maxZoom);
            let dWidth = minreso / img.map(Math.random(), 0, 1, 1, maxZoom);
            // let dHeight = minreso / img.map(Math.random(), 0, 1, 1, maxZoom);
            let dHeight = minreso / img.map(Math.random(), 0, 1, 1, maxZoom);
            let sx = img.map(Math.random(), 0, 1, 0, minreso - minreso / z);
            let sy = img.map(Math.random(), 0, 1, 0, minreso - minreso / z);
            let sWidth = minreso / z;
            let sHeight = minreso / z;
            img.image(
              images[im],
              0,
              0,
              dWidth,
              dHeight,
              sx,
              sy,
              sWidth,
              sHeight
            );
          } else if (zoomType === "best3") {
            // let z = img.map(Math.random(), 0, 1, 1, maxZoom);
            // let dWidth = minreso / img.map(Math.random(), 0, 1, 1, maxZoom);
            let dWidth = minreso * img.map(Math.random(), 0, 1, 1, maxZoom);
            // let dHeight = minreso / img.map(Math.random(), 0, 1, 1, maxZoom);
            let dHeight = minreso * img.map(Math.random(), 0, 1, 1, maxZoom);
            let sx = img.map(
              Math.random(),
              0,
              1,
              0,
              minreso - minreso / img.map(Math.random(), 0, 1, 1, maxZoom)
            );
            let sy = img.map(
              Math.random(),
              0,
              1,
              0,
              minreso - minreso / img.map(Math.random(), 0, 1, 1, maxZoom)
            );
            let sWidth = minreso / img.map(Math.random(), 0, 1, 1, maxZoom);
            let sHeight = minreso / img.map(Math.random(), 0, 1, 1, maxZoom);
            img.image(
              images[im],
              0,
              0,
              dWidth,
              dHeight,
              sx,
              sy,
              sWidth,
              sHeight
            );
          }
        } else {
          img.image(images[im], 0, 0, minreso, minreso);
          // img.pop();

          // }
        }
        // img.pop();
        // console.log('bigi',biggyChance)
        let isBig = img.map(Math.random(), 0, 1, 0, 100) <= biggyChance;
        if (isBig) {
          // let m = [2, 3, 4, 5, 6,7,8,9];
          img.push();
          // img.rotate(-imageRotation);

          let tes = Math.floor(Math.random() * biggyMax) + 1;
          // let tes = Math.floor(img.map(Math.random(), 0, 1, biggyMin, biggyMax + 1));
          // console.log(tes)
          img.translate(minreso, minreso);
          img.image(
            images[im],
            0 - minreso * tes,
            0 - minreso * tes,
            minreso * tes,
            minreso * tes
          );

          img.pop();
        }
        img.pop();
        img.translate(minreso, 0);
        i++;
      }

      img.translate(minreso * -tilewidth, minreso);
    }
  }
}
